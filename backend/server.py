from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path
from typing import Dict, Any

from analysis import (
    analyze_voice,
    analyze_text,
    analyze_visual,
    analyze_multimodal,
    generate_recommendations,
)

app = Flask(__name__, static_folder=str(Path(__file__).resolve().parent / '..' / 'frontend'))

# In-memory data store
TACTICAL_DATA: Dict[str, Any] = {
    'units': [],
    'threats': [],
    'lastUpdated': '',
}


# Initialize mock data
def initialize_mock_data() -> None:
    TACTICAL_DATA['units'] = [
        {
            'id': 'unit-1',
            'callsign': 'Alpha',
            'status': 'active',
            'position': {'lat': 34.0522, 'lng': -118.2437},
        },
        {
            'id': 'unit-2',
            'callsign': 'Bravo',
            'status': 'active',
            'position': {'lat': 34.0622, 'lng': -118.2537},
        },
    ]
    TACTICAL_DATA['threats'] = [
        {
            'id': 'threat-1',
            'type': 'suspicious_vehicle',
            'position': {'lat': 34.0572, 'lng': -118.2487},
            'confidence': 0.85,
        }
    ]
    TACTICAL_DATA['lastUpdated'] = 'init'


@app.post('/api/analyze/<endpoint>')
def analyze_endpoint(endpoint: str):
    data = request.get_json(silent=True) or {}
    try:
        if endpoint == 'voice':
            result = analyze_voice(data.get('voiceMetrics'))
            ctx = {'voice': result}
        elif endpoint == 'text':
            result = analyze_text(data.get('text', ''))
            ctx = {'text': result}
        elif endpoint == 'visual':
            result = analyze_visual(data.get('visualData'))
            ctx = {'visual': result}
        elif endpoint == 'multimodal':
            result = analyze_multimodal(
                voice_metrics=data.get('voiceMetrics'),
                text=data.get('text', ''),
                visual_data=data.get('visualData'),
            )
            ctx = result
        else:
            return jsonify({'error': 'Invalid analysis endpoint'}), 400

        recommendations = generate_recommendations(ctx)
        return jsonify({'analysis': result, 'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.get('/api/tactical-data')
def get_tactical_data():
    return jsonify({**TACTICAL_DATA})


@app.post('/api/update-position')
def update_position():
    data = request.get_json(force=True)
    unit_id = data.get('unitId')
    position = data.get('position')
    unit = next((u for u in TACTICAL_DATA['units'] if u['id'] == unit_id), None)
    if not unit:
        return jsonify({'error': 'Unit not found'}), 404
    unit['position'] = position
    unit['lastUpdated'] = 'now'
    TACTICAL_DATA['lastUpdated'] = 'now'
    return jsonify({'success': True, 'unit': unit})


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_frontend(path):
    root = Path(app.static_folder)
    file_path = root / path
    if not file_path.exists():
        return send_from_directory(root, '404.html'), 404
    return send_from_directory(root, path)


def create_app():
    initialize_mock_data()
    return app


if __name__ == '__main__':
    initialize_mock_data()
    app.run(host='0.0.0.0', port=3001)
