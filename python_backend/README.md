# TacSense TTS Service

This is the Python backend service for TacSense AI that provides Text-to-Speech (TTS) functionality using Resemble AI's Chatterbox model.

## Features

- High-quality TTS with emotion control
- Support for voice cloning with audio prompts
- Configurable speech parameters (exaggeration, CFG scale)
- RESTful API for easy integration
- Automatic GPU acceleration when available

## Prerequisites

- Python 3.8+
- CUDA-compatible GPU (recommended) or CPU
- FFmpeg (for audio processing)

## Installation

1. **Create and activate a virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. **Install the required packages**

   ```bash
   pip install -r requirements.txt
   ```

3. **Install FFmpeg**

   - On Ubuntu/Debian: `sudo apt-get install ffmpeg`
   - On macOS: `brew install ffmpeg`
   - On Windows: Download from [FFmpeg's website](https://ffmpeg.org/download.html)

## Running the Service

Start the FastAPI server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Generate Speech

**POST** `/api/tts/generate`

Generate speech from text with optional voice cloning.

### Form Data

- `text` (required): Text to convert to speech
- `exaggeration` (optional, default=0.5): Emotion exaggeration (0.0 to 1.0)
- `cfg` (optional, default=0.5): Control the speaking style (0.1 to 1.0)
- `audio_prompt` (optional): Audio file for voice cloning

### Example Response

```json
{
  "status": "success",
  "audio_url": "/api/tts/audio/tts_1234.wav",
  "text": "Your input text here"
}
```

### Get Audio

**GET** `/api/tts/audio/{filename}`

Retrieve a generated audio file.

### Check Status

**GET** `/api/tts/status`

Check if the TTS service is running.

### Get LiveKit Token

**GET** `/api/livekit/token?identity=YOUR_ID`

Retrieve a token and server URL for connecting to LiveKit.

### Search a Video

**POST** `/api/video/search`

Upload a video file and provide a `query` field to search the transcript.

### External Inference

**POST** `/api/inference`

Proxy a request to the Inflection AI inference API. Set the `INFLECTION_API_TOKEN`
environment variable with your API token.

Example:

```bash
curl -X POST http://localhost:8000/api/inference \
  -H "Content-Type: application/json" \
  -d '{"context": [{"text": "Hi", "type": "Human"}], "config": "Pi-3.1"}'
```

### Video Inference

**POST** `/api/video/inference`

Upload a video file and receive a tactical summary generated with the Pi model.

Example:

```bash
curl -X POST http://localhost:8000/api/video/inference \
  -F "video=@/path/to/video.mp4"
```

## Example Usage

### Using cURL

```bash
# Basic TTS
curl -X POST -F "text=Hello, this is a test" http://localhost:8000/api/tts/generate

# With voice cloning
curl -X POST \
  -F "text=Hello, this is a test with my voice" \
  -F "exaggeration=0.7" \
  -F "cfg=0.4" \
  -F "audio_prompt=@/path/to/your/voice_sample.wav" \
  http://localhost:8000/api/tts/generate
```

### Using Python

```python
import requests

# Generate speech
response = requests.post(
    "http://localhost:8000/api/tts/generate",
    data={"text": "Hello, this is a test", "exaggeration": 0.6, "cfg": 0.5}
).json()

# Download the audio
audio_url = f"http://localhost:8000{response['audio_url']}"
audio_data = requests.get(audio_url).content

# Save the audio
with open("output.wav", "wb") as f:
    f.write(audio_data)
```

## Integration with Node.js Backend

To integrate this with your existing Node.js backend, you can make HTTP requests to the TTS service:

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function generateSpeech(text, audioPath = null) {
  const form = new FormData();
  form.append('text', text);
  form.append('exaggeration', '0.6');
  form.append('cfg', '0.5');
  
  if (audioPath) {
    form.append('audio_prompt', fs.createReadStream(audioPath));
  }
  
  const response = await axios.post('http://localhost:8000/api/tts/generate', form, {
    headers: form.getHeaders()
  });
  
  return response.data;
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
