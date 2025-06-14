# MindGuard

Proof-of-concept implementation for a stress detection and response platform.

## Backend
The Node.js backend exposes two simple endpoints:
- `POST /analyze` expects JSON with `voiceMetrics` (pitch, tempo) and optional `heartRate`. It returns a basic emotional state classification.
- `GET /intervention/:state` returns a message suited for the given emotional state.

This logic is purely illustrative, simulating API calls to systems like Resemble AI and Inflection AI.

To run the backend:
```bash
cd backend && npm start
```

## Frontend
A minimal React interface demonstrates how a web client might interact with the backend via fetch requests.

To start the frontend:
```bash
cd frontend && npm start
```

Both packages depend only on built-in APIs due to environment constraints.
