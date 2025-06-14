# TacSense AI

Real-time situational awareness dashboard for military commanders, integrating AI-driven analysis of voice commands, text inputs, and visual data to provide actionable insights during operations. Features advanced Text-to-Speech (TTS) capabilities powered by Resemble AI's Chatterbox model.

## Features

- **Unified Backend**: Single Python FastAPI service for simplified development, deployment, and maintenance.
- **Advanced TTS with Chatterbox**:
  - High-quality, natural-sounding speech synthesis with emotion and style control.
  - Voice cloning from short audio prompts.
  - Low-latency generation for real-time applications.
- **Multimodal Input Processing**:
  - Voice command analysis for emotion and urgency.
  - Text input processing for tactical queries and intent classification.
  - Visual data integration for threat detection (simulated).
- **AI-Powered Analysis**:
  - Intent recognition for operational commands.
  - Threat assessment and prioritization.
  - Tactical recommendations based on situational context.
- **Interactive Dashboard**:
  - Real-time map visualization with Leaflet.js.
  - Dynamic threat indicators and unit position updates.
  - Voice and text interface for commander interaction.

## Technical Architecture

The application now runs on a unified backend built with Python and FastAPI. This single service is responsible for:

1. **Serving the Frontend**: The static HTML, CSS, and JavaScript files for the user interface are served directly by FastAPI.
2. **Handling API Requests**: All API endpoints are consolidated under this service:
    - `/api/tts/*`: Endpoints for TTS generation, audio retrieval, and status checks.
    - `/api/analyze/*`: Endpoints for voice, text, and visual analysis.
    - `/api/tactical-data`: Endpoint for retrieving and updating tactical information (units, threats).
3. **Running Analysis Logic**: The core analysis functions are implemented in Python.
4. **Orchestration**: The entire application is containerized using Docker and managed with a single `docker-compose.yml` file.

This architecture removes the complexity of managing separate Node.js and Python backends.

## Getting Started

### Prerequisites

- **Docker and Docker Compose**: The recommended method for running the application. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- **Git**: For cloning the repository.

### Running with Docker (Recommended)

1. **Clone the repository:**

    ```bash
    git clone https://github.com/ankitshah009/TacSense.git
    cd TacSense
    ```

2. **Build and run the application:**

    ```bash
    docker-compose up --build
    ```

    This command will build the Docker image, install all dependencies, and start the unified backend service.

3. **Access the application:**
    - The TacSense AI dashboard will be available at `http://localhost:8000`.

4. **To stop the application:**
    - Press `Ctrl+C` in the terminal where `docker-compose up` is running.
    - To remove the container and network, run: `docker-compose down`.

## API Endpoints

All endpoints are served from the main application running on port 8000.

- `POST /api/tts/generate`: Generate speech from text.
- `GET /api/tts/audio/{filename}`: Retrieve generated audio.
- `GET /api/tts/status`: Check TTS model status.
- `POST /api/analyze/voice`: Analyze voice metrics.
- `POST /api/analyze/text`: Analyze text input.
- `POST /api/analyze/visual`: Analyze visual data.
- `GET /api/tactical-data`: Get current tactical data.
- `POST /api/update-position`: Update a unit's position.
- `POST /api/report-threat`: Report a new threat.

## Project Structure

```text
.
├── docker-compose.yml      # Docker orchestration file
├── frontend/               # All frontend assets (HTML, CSS, JS)
│   ├── index.html
│   └── styles.css
├── python_backend/         # Python FastAPI application
│   ├── Dockerfile
│   ├── main.py             # FastAPI app, endpoints
│   ├── analysis_logic.py   # Core analysis functions
│   └── requirements.txt
└── README.md
```

## TTS Service Integration

The TTS service uses Resemble AI's Chatterbox model, which is licensed under the MIT License. The service provides:

- High-quality, natural-sounding speech
- Emotion and style control
- Voice cloning capabilities
- Ultra-low latency for real-time applications

For more details, see the [python_backend/README.md](python_backend/README.md) file.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
