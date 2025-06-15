import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from pathlib import Path
import torchaudio as ta
from typing import Optional, List
import requests
import torch
import uuid
import tempfile
from pydub import AudioSegment
import soundfile as sf
from pydantic import BaseModel
import io
from livekit.api import AccessToken
import time
from datetime import timedelta
from moviepy.editor import VideoFileClip
import speech_recognition as sr
from video_analysis import summarize_video

# Import TTS model (will be loaded on first request)
model = None

app = FastAPI(title="TacSense TTS Service",
             description="TTS service using Resemble AI's Chatterbox model")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure temp directory exists
TEMP_DIR = Path("temp")
TEMP_DIR.mkdir(exist_ok=True)

# External Inflection AI API
INFLECTION_URL = "https://api.inflection.ai/external/api/inference"

def call_inflection_api(payload: dict) -> dict:
    """Proxy a request to the Inflection AI inference API."""
    token = os.getenv("INFLECTION_API_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Inflection API token not configured")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    try:
        response = requests.post(INFLECTION_URL, headers=headers, json=payload, timeout=20)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))


class Message(BaseModel):
    text: str
    type: str = "Human"


class InferenceRequest(BaseModel):
    context: List[Message]
    config: str = "Pi-3.1"

def load_model():
    """Lazy load the TTS model"""
    global model
    if model is None:
        from chatterbox.tts import ChatterboxTTS
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading TTS model on {device}...")
        model = ChatterboxTTS.from_pretrained(device=device)
        print("TTS model loaded successfully")
    return model

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with testing interface"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>TacSense TTS Service</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .endpoint { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; }
            button:hover { background: #0056b3; }
            input, textarea { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 3px; }
            .result { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎵 TacSense TTS Service</h1>
            <p>Your Docker setup is working! Test the API endpoints below:</p>
            
            <div class="endpoint">
                <h3>1. Service Status</h3>
                <button onclick="checkStatus()">Check Status</button>
                <div id="statusResult" class="result"></div>
            </div>
            
            <div class="endpoint">
                <h3>2. Generate Speech</h3>
                <textarea id="ttsText" placeholder="Enter text to convert to speech...">Hello world, this is a test of the TTS system!</textarea>
                <br>
                <label>Exaggeration (0.0-1.0): <input type="number" id="exaggeration" min="0" max="1" step="0.1" value="0.5"></label>
                <br>
                <label>CFG (0.1-1.0): <input type="number" id="cfg" min="0.1" max="1" step="0.1" value="0.5"></label>
                <br>
                <button onclick="generateSpeech()">Generate Speech</button>
                <div id="ttsResult" class="result"></div>
            </div>
            
            <div class="endpoint">
                <h3>3. LiveKit Token</h3>
                <input id="identity" placeholder="Enter user identity..." value="test-user">
                <button onclick="getLiveKitToken()">Get LiveKit Token</button>
                <div id="livekitResult" class="result"></div>
            </div>
        </div>
        
        <script>
            async function checkStatus() {
                try {
                    const response = await fetch('/api/tts/status');
                    const data = await response.json();
                    document.getElementById('statusResult').innerHTML = 
                        `<strong>Status:</strong> ${data.status}<br>
                         <strong>Model Loaded:</strong> ${data.model_loaded}<br>
                         <strong>Device:</strong> ${data.device}`;
                } catch (error) {
                    document.getElementById('statusResult').innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
                }
            }
            
            async function generateSpeech() {
                const text = document.getElementById('ttsText').value;
                const exaggeration = document.getElementById('exaggeration').value;
                const cfg = document.getElementById('cfg').value;
                
                const formData = new FormData();
                formData.append('text', text);
                formData.append('exaggeration', exaggeration);
                formData.append('cfg', cfg);
                
                try {
                    document.getElementById('ttsResult').innerHTML = 'Generating speech... (this may take a while for first request)';
                    const response = await fetch('/api/tts/generate', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                        document.getElementById('ttsResult').innerHTML = 
                            `<strong>Success!</strong><br>
                             <audio controls src="${data.audio_url}">Your browser does not support audio.</audio><br>
                             <a href="${data.audio_url}" target="_blank">Download Audio</a>`;
                    } else {
                        document.getElementById('ttsResult').innerHTML = `<span style="color: red;">Error: ${data.detail || 'Unknown error'}</span>`;
                    }
                } catch (error) {
                    document.getElementById('ttsResult').innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
                }
            }
            
            async function getLiveKitToken() {
                const identity = document.getElementById('identity').value;
                try {
                    const response = await fetch(`/api/livekit/token?identity=${encodeURIComponent(identity)}`);
                    const data = await response.json();
                    document.getElementById('livekitResult').innerHTML = 
                        `<strong>Token:</strong> ${data.token.substring(0, 50)}...<br>
                         <strong>URL:</strong> ${data.url}`;
                } catch (error) {
                    document.getElementById('livekitResult').innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
                }
            }
        </script>
    </body>
    </html>
    """

def create_livekit_token(identity: str) -> str:
    """Generate a LiveKit access token for a client identity"""
    api_key = os.getenv("LIVEKIT_API_KEY", "devkey")
    api_secret = os.getenv("LIVEKIT_API_SECRET", "secret")
    at = AccessToken(api_key, api_secret)
    at.identity = identity
    at.ttl = timedelta(hours=1)
    return at.to_jwt()

@app.post("/api/tts/generate")
async def generate_speech(
    text: str = Form(...),
    exaggeration: float = Form(0.5),
    cfg: float = Form(0.5),
    audio_prompt: Optional[UploadFile] = File(None)
):
    """
    Generate speech from text using Chatterbox TTS
    
    Parameters:
    - text: Text to convert to speech
    - exaggeration: Emotion exaggeration (0.0 to 1.0)
    - cfg: Control the speaking style (0.1 to 1.0)
    - audio_prompt: Optional audio file for voice cloning
    """
    try:
        # Load model on first request
        model = load_model()
        
        # Save audio prompt if provided
        audio_prompt_path = None
        if audio_prompt:
            # Create temp file for the audio prompt
            temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            audio_prompt_path = temp_audio.name
            
            # Convert to WAV if needed
            audio = AudioSegment.from_file(io.BytesIO(await audio_prompt.read()))
            audio.export(audio_prompt_path, format="wav")
        
        # Generate speech
        with torch.no_grad():
            wav = model.generate(
                text,
                audio_prompt_path=audio_prompt_path,
                exaggeration=float(exaggeration),
                cfg=float(cfg)
            )
        
        # Save to temp file
        output_filename = f"tts_{uuid.uuid4()}.wav"
        output_path = TEMP_DIR / output_filename
        ta.save(str(output_path), wav, model.sr)
        
        # Clean up temp audio prompt if it exists
        if audio_prompt_path and os.path.exists(audio_prompt_path):
            os.unlink(audio_prompt_path)
        
        return JSONResponse({
            "status": "success",
            "audio_url": f"/api/tts/audio/{output_filename}",
            "text": text
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tts/audio/{filename}")
async def get_audio(filename: str):
    """Retrieve generated audio file"""
    file_path = TEMP_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path, media_type="audio/wav")

@app.get("/api/tts/status")
async def get_status():
    """Check if TTS service is running"""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "device": "cuda" if torch.cuda.is_available() else "cpu"
    }


@app.get("/api/livekit/token")
async def get_livekit_token(identity: str):
    """Provide a LiveKit token and server URL for the client"""
    token = create_livekit_token(identity)
    url = os.getenv("LIVEKIT_URL", "ws://localhost:7880")
    return {"token": token, "url": url}


@app.post("/api/video/search")
async def search_video(query: str = Form(...), video: UploadFile = File(...)):
    """Search for text within a video by transcribing the audio"""
    try:
        temp = tempfile.NamedTemporaryFile(delete=False, suffix=Path(video.filename).suffix)
        temp.write(await video.read())
        temp.close()

        clip = VideoFileClip(temp.name)
        audio_path = temp.name + ".wav"
        clip.audio.write_audiofile(audio_path, fps=16000, logger=None)

        r = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio_data = r.record(source)
            transcript = r.recognize_sphinx(audio_data)

        os.unlink(audio_path)
        os.unlink(temp.name)

        found = query.lower() in transcript.lower()
        return {"found": found, "transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/inference")
async def run_inference(request: InferenceRequest):
    """Run inference using the external Inflection AI service."""
    payload = request.dict()
    return call_inflection_api(payload)

@app.post("/api/files/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file for processing"""
    try:
        # Create temp file
        file_id = str(uuid.uuid4())
        file_path = TEMP_DIR / f"{file_id}_{file.filename}"
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "fileId": file_id,
            "status": "uploaded",
            "filename": file.filename,
            "size": len(content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/video/process")
async def process_video(
    video: UploadFile = File(...),
    chunk_size: int = Form(0),
    prompt: str = Form(""),
    caption_prompt: str = Form(""),
    summary_prompt: str = Form("")
):
    """Process video file for tactical analysis"""
    try:
        # Save video file temporarily
        file_id = str(uuid.uuid4())
        video_path = TEMP_DIR / f"{file_id}_{video.filename}"
        
        with open(video_path, "wb") as buffer:
            content = await video.read()
            buffer.write(content)
        
        # Mock processing (in real implementation, would extract frames, analyze, etc.)
        import time
        time.sleep(2)  # Simulate processing time
        
        # Mock analysis results
        analysis_result = {
            "summary": "Tactical video analysis completed. Detected personnel movement, equipment usage, and environmental factors. No immediate threats identified.",
            "insights": [
                {
                    "id": "insight_1",
                    "type": "tactical",
                    "title": "Personnel Movement",
                    "description": "Multiple personnel observed in coordinated movement patterns",
                    "confidence": 0.89,
                    "priority": "medium"
                },
                {
                    "id": "insight_2", 
                    "type": "operational",
                    "title": "Equipment Status",
                    "description": "Standard tactical equipment detected and properly utilized",
                    "confidence": 0.92,
                    "priority": "low"
                }
            ],
            "threats": [],
            "recommendations": [
                {
                    "id": "rec_1",
                    "type": "tactical",
                    "priority": "medium",
                    "title": "Continue Monitoring",
                    "description": "Maintain surveillance of personnel movement patterns",
                    "confidence": 0.85
                }
            ],
            "confidence": 0.88,
            "timestamp": time.time()
        }
        
        # Cleanup temp file
        os.unlink(video_path)

        return analysis_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/video/inference")
async def video_inference(video: UploadFile = File(...)):
    """Generate a tactical summary for a video using the Pi model."""
    try:
        file_id = str(uuid.uuid4())
        video_path = TEMP_DIR / f"{file_id}_{video.filename}"

        with open(video_path, "wb") as buffer:
            content = await video.read()
            buffer.write(content)

        transcript, visual_summary = summarize_video(video_path)

        prompt = (
            "Analyze the following tactical video and provide a concise summary "
            "and recommendations.\n"
            f"Visual summary: {visual_summary}.\n"
            f"Transcript: {transcript}"
        )

        inference_payload = {
            "context": [{"text": prompt, "type": "Human"}],
            "config": "Pi-3.1",
        }

        result = call_inflection_api(inference_payload)

        os.unlink(video_path)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/image/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    prompt: str = Form("")
):
    """Analyze image for tactical information"""
    try:
        # Save image file temporarily
        file_id = str(uuid.uuid4())
        image_path = TEMP_DIR / f"{file_id}_{image.filename}"
        
        with open(image_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
        
        # Mock image analysis
        analysis_result = {
            "objects": [
                {"type": "person", "confidence": 0.92, "position": {"x": 100, "y": 150}},
                {"type": "vehicle", "confidence": 0.87, "position": {"x": 300, "y": 200}}
            ],
            "threats": [],
            "insights": [
                {
                    "type": "operational",
                    "description": "Clear visibility conditions, multiple subjects identified",
                    "confidence": 0.90
                }
            ]
        }
        
        # Cleanup temp file
        os.unlink(image_path)
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/text/analyze")
async def analyze_text_endpoint(text: str = Form(...)):
    """Analyze text for intent, sentiment, and urgency"""
    try:
        from analysis_logic import analyze_text
        
        result = analyze_text(text)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/analyze")
async def analyze_voice_endpoint(voice_data: dict):
    """Analyze voice metrics for stress and urgency"""
    try:
        from analysis_logic import analyze_voice
        
        voice_metrics = voice_data.get("voiceMetrics", {})
        result = analyze_voice(voice_metrics)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
