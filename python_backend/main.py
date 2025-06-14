import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
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
from livekit import AccessToken
import time
from moviepy.editor import VideoFileClip
import speech_recognition as sr

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


def create_livekit_token(identity: str) -> str:
    """Generate a LiveKit access token for a client identity"""
    api_key = os.getenv("LIVEKIT_API_KEY", "devkey")
    api_secret = os.getenv("LIVEKIT_API_SECRET", "secret")
    at = AccessToken(api_key, api_secret, identity=identity, ttl=3600)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
