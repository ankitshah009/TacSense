# TacSense AI

Real-time situational awareness dashboard for military commanders, integrating AI-driven analysis of voice commands, text inputs, and visual data to provide actionable insights during operations.

## Features

- **Multimodal Input Processing**
  - Voice command analysis with emotion detection
  - Text input processing for tactical queries
  - Visual data integration (maps, sensor feeds)

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
- Node.js 14+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tacsense-ai.git
cd tacsense-ai
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Start the backend server:
```bash
npm start
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
