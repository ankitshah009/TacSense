# TacSense AI

Real-time situational awareness dashboard for military commanders, integrating AI-driven analysis of voice commands, text inputs, and visual data to provide actionable insights during operations.

## Features

- **Multimodal Input Processing**
  - Voice command analysis with emotion detection
  - Text input processing for tactical queries
  - Visual data integration (maps, sensor feeds)
  - Unified multimodal analysis endpoint

- **AI-Powered Analysis**
  - Intent recognition for operational commands
  - Threat assessment and prioritization
  - Tactical recommendations based on situational context

- **Interactive Dashboard**
  - Real-time map visualization
  - Threat indicators and alerts
  - Voice and text interface for commander interaction

## Technical Architecture

### Backend Services
- **Input Processing**
  - `/analyze/voice` - Processes voice commands with tone analysis
  - `/analyze/text` - Interprets text-based intelligence reports
  - `/analyze/visual` - Processes visual data from maps/sensors
  - `/analyze/multimodal` - Combines voice, text, and visual inputs
  
- **Analysis Engine**
  - Intent recognition and classification
  - Threat assessment algorithms
  - Recommendation generation

### Frontend Components
- Interactive map display
- Real-time alert system
- Voice command interface
- Tactical information dashboard

## Getting Started

### Prerequisites
- Python 3.10+
- pip

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tacsense-ai.git
cd tacsense-ai
```

2. Install backend dependencies:
```bash
cd backend
python -m pip install -r requirements.txt
```

3. Start the backend server:
```bash
python server.py
```

4. Open the frontend in your browser:
```bash
open frontend/index.html
```

## Usage

1. Access the dashboard at `http://localhost:3000`
2. Use voice commands or text input to interact with the system
3. View real-time threat assessments and recommendations
4. Monitor the tactical situation via the interactive map

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
