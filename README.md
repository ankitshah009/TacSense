# TacSense AI - Real-time Situational Awareness Dashboard

**TacSense AI** is a comprehensive real-time situational awareness dashboard designed for military commanders and tactical operations. It integrates AI-driven analysis of voice commands, text inputs, and visual data to provide actionable insights during operations.

## 🎯 Overview

TacSense AI processes multimodal inputs to interpret commander intent, aggregate intelligence (including reports and simulated sensor feeds), and deliver concise recommendations via voice and interactive visuals. The system enhances decision-making speed and accuracy while reducing cognitive overload in high-pressure scenarios.

## ✨ Key Features

### 🎥 **Video Intelligence & Analysis**
- Upload and analyze video files for tactical insights
- Extract key events, personnel movement, and equipment usage
- Detect safety violations and security threats
- Generate comprehensive operational reports

### 📡 **Live Stream Analysis**
- Real-time streaming analysis and voice recognition
- Live threat detection and monitoring
- Multi-participant voice analysis with stress detection
- Continuous situational awareness updates

### 📷 **Image Intelligence & Analysis**
- Analyze static images for tactical information
- Object detection and threat identification
- Personnel and equipment inventory
- Environmental assessment and hazard detection

### 🎤 **Multimodal AI Capabilities**
- **Voice Analysis**: Detect urgency and stress in voice commands with tone analysis
- **Text Processing**: Natural language understanding for queries and commands
- **Visual Processing**: Computer vision for threat and object detection
- **Speech Synthesis**: Context-aware audio responses with emotional intelligence

### 🧠 **AI-Powered Insights**
- **Intent Recognition**: Understand commander objectives and priorities
- **Threat Assessment**: Automated identification of security risks
- **Operational Recommendations**: AI-generated tactical suggestions
- **Confidence Scoring**: Reliability metrics for all analysis results

## 🏗️ Architecture

### Frontend (Next.js)
- **Modern React Interface**: Built with Next.js 14 and TypeScript
- **Military-themed UI**: Tactical color schemes and professional design
- **Real-time Updates**: WebSocket integration for live data
- **Responsive Design**: Works across desktop and mobile devices

### Backend (FastAPI)
- **High-performance API**: Built with Python FastAPI
- **Multimodal Processing**: Handles video, audio, image, and text analysis
- **AI Integration**: Inflection AI for natural language processing
- **TTS Capabilities**: Resemble AI's Chatterbox for voice synthesis

### AI & Analysis
- **Computer Vision**: Object detection and scene analysis
- **Speech Recognition**: Voice-to-text with emotion analysis
- **Natural Language Processing**: Intent classification and sentiment analysis
- **Machine Learning**: Threat detection and pattern recognition

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Python 3.9+ (for development)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/ankitshah009/TacSense.git
   cd TacSense
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Run with Docker Compose**
   ```bash
   # Enable BuildKit's bake integration for faster builds
   export COMPOSE_BAKE=true

   # Confirm that the variable is set
   echo $COMPOSE_BAKE    # should output "true"

   # Full production build
   docker-compose up --build

   # Fast development build
   docker-compose -f docker-compose.fast.yml up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Development Setup

1. **Backend Setup**
   ```bash
   cd python_backend
   pip install -r requirements.txt
   python main.py
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📋 Usage Guide

### 1. **Upload and Analyze Content**
- Select the appropriate tab (Video, Live Stream, or Image)
- Drag and drop files or click to upload
- Configure analysis parameters if needed
- Wait for processing and review results

### 2. **Interactive Chat Interface**
- Ask questions about uploaded content
- Use predefined quick actions for common queries
- Voice input support for hands-free operation
- Real-time analysis with confidence scoring

### 3. **Configuration Options**
- **Chunk Size**: Control video processing segments
- **AI Model**: Select from available language models
- **Analysis Prompts**: Customize for specific use cases
- **Voice Analysis**: Enable/disable stress detection

### 4. **Quick Analysis Functions**
- **Safety Analysis**: Identify violations and hazards
- **Threat Detection**: Security risk assessment
- **Asset Inventory**: Personnel and equipment tracking
- **Operational Recommendations**: AI-generated suggestions

## 🎮 Demo Scenarios

### Military Training Analysis
```
1. Upload training exercise video
2. Ask: "Identify any safety violations during the exercise"
3. Review AI-generated insights and recommendations
4. Export analysis report for debriefing
```

### Surveillance Feed Review
```
1. Upload security camera footage
2. Ask: "Detect any suspicious activities or unauthorized personnel"
3. Review threat assessment with confidence scores
4. Generate operational response recommendations
```

### Equipment Inspection
```
1. Upload facility or equipment images
2. Ask: "List all personnel and equipment visible"
3. Review asset inventory and condition assessment
4. Identify maintenance or safety concerns
```

## 🔧 Configuration

### Environment Variables
```env
# API Keys
INFLECTION_API_TOKEN=your_inflection_api_key
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_URL=ws://localhost:7880

# Application Settings
NODE_ENV=development
API_BASE_URL=http://localhost:8000
```

### Docker Configuration
- **Production**: Uses optimized builds with minimal dependencies
- **Fast Development**: Includes hot reload and development tools
- **Volumes**: Persistent storage for uploads and models

## 🛡️ Security Features

- **Data Encryption**: All data transmission encrypted
- **Access Control**: Role-based permissions system
- **Audit Logging**: Complete activity tracking
- **Secure Upload**: File validation and sanitization
- **Privacy Protection**: No data stored beyond session

## 📊 Performance Optimization

- **Lazy Loading**: Models loaded on-demand
- **Caching**: Intelligent result caching
- **Compression**: Optimized media processing
- **Streaming**: Real-time data processing
- **Auto-scaling**: Docker-based scaling

## 🔌 API Documentation

### Core Endpoints
- `POST /api/inference` - Text analysis and chat
- `POST /api/video/process` - Video analysis
- `POST /api/image/analyze` - Image analysis
- `POST /api/files/upload` - File upload
- `GET /api/tts/status` - System status

### WebSocket Events
- `analysis_progress` - Real-time processing updates
- `threat_alert` - Immediate threat notifications
- `system_status` - Health monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/ankitshah009/TacSense/wiki)
- **Issues**: [GitHub Issues](https://github.com/ankitshah009/TacSense/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ankitshah009/TacSense/discussions)

## 🙏 Acknowledgments

- **Inflection AI** for natural language processing capabilities
- **Resemble AI** for text-to-speech technology
- **OpenAI** for computer vision models
- **LiveKit** for real-time communication infrastructure

---

**Built with ❤️ for military and tactical operations**
