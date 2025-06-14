import datetime
from typing import List, Dict, Any

# Voice analysis with emotion and urgency detection
def analyze_voice(voice_metrics: Dict[str, float] | None = None) -> Dict[str, str]:
    if voice_metrics is None:
        voice_metrics = {}
    pitch = voice_metrics.get('pitch', 0)
    tempo = voice_metrics.get('tempo', 0)
    intensity = voice_metrics.get('intensity', 0)

    urgency = 'normal'
    emotion = 'neutral'

    # Urgency detection
    if (pitch > 280 and tempo > 160) or intensity > 0.8:
        urgency = 'high'
    elif pitch > 250 or tempo > 140:
        urgency = 'elevated'

    # Basic emotion detection (simplified)
    if pitch > 270 and tempo > 150:
        emotion = 'stressed'
    elif pitch < 200 and tempo < 120:
        emotion = 'calm'

    return {'urgency': urgency, 'emotion': emotion}


# Text analysis for tactical intent
def analyze_text(text: str = '') -> Dict[str, Any]:
    text_lower = text.lower()
    intent = 'query'
    priority = 'medium'

    if 'enemy' in text_lower or 'threat' in text_lower:
        intent = 'threat_detection'
        priority = 'high'
    elif 'position' in text_lower or 'location' in text_lower:
        intent = 'position_update'
    elif 'support' in text_lower or 'backup' in text_lower:
        intent = 'support_request'
        priority = 'high'

    keywords = [w for w in text_lower.split() if w.isalpha()]
    return {'intent': intent, 'priority': priority, 'keywords': keywords}


# Visual analysis (simulated)
def analyze_visual(visual_data: Dict[str, Any] | None = None) -> Dict[str, Any]:
    if visual_data is None:
        visual_data = {}
    mock_threats = [
        {"type": "vehicle", "confidence": 0.87, "position": {"x": 0.45, "y": 0.32}},
        {"type": "person", "confidence": 0.92, "position": {"x": 0.12, "y": 0.67}},
    ]
    return {
        'threats': mock_threats,
        'timestamp': datetime.datetime.utcnow().isoformat(),
        'confidence': 0.85,
    }


# Simple multimodal model combining voice, text, and visual cues
def multimodal_model(inputs: Dict[str, Any]) -> Dict[str, str]:
    voice = inputs.get('voice', {})
    text = inputs.get('text', {})
    visual = inputs.get('visual', {})
    classification = 'normal'
    if voice.get('urgency') == 'high' or text.get('intent') == 'threat_detection' or len(visual.get('threats', [])) > 0:
        classification = 'alert'
    elif voice.get('urgency') == 'elevated' or text.get('priority') == 'high':
        classification = 'caution'
    return {'classification': classification}


# Multimodal analysis combining all inputs
def analyze_multimodal(
    voice_metrics: Dict[str, float] | None = None,
    text: str = '',
    visual_data: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    voice_res = analyze_voice(voice_metrics)
    text_res = analyze_text(text)
    visual_res = analyze_visual(visual_data)
    model_res = multimodal_model({'voice': voice_res, 'text': text_res, 'visual': visual_res})
    return {
        'voice': voice_res,
        'text': text_res,
        'visual': visual_res,
        **model_res,
    }


# Generate tactical recommendations
def generate_recommendations(context: Dict[str, Any]) -> List[Dict[str, Any]]:
    voice = context.get('voice', {})
    text = context.get('text', {})
    visual = context.get('visual', {})
    recommendations: List[Dict[str, Any]] = []

    if voice.get('urgency') == 'high':
        recommendations.append({
            'type': 'alert',
            'priority': 'high',
            'message': 'High urgency detected in voice command',
            'suggestedActions': ['Verify intel', 'Alert nearby units', 'Prepare response'],
        })

    if text.get('intent') == 'threat_detection':
        recommendations.append({
            'type': 'threat',
            'priority': 'high',
            'message': 'Potential threat identified',
            'suggestedActions': ['Deploy recon', 'Go to alert level 2', 'Notify command'],
        })

    if len(visual.get('threats', [])) > 0:
        recommendations.append({
            'type': 'visual_threat',
            'priority': 'high',
            'message': f"{len(visual['threats'])} potential threats detected visually",
            'suggestedActions': ['Review visual feed', 'Cross-reference with intel', 'Prepare engagement protocols'],
        })

    if not recommendations:
        recommendations.append({
            'type': 'status',
            'priority': 'low',
            'message': 'Situation normal',
            'suggestedActions': ['Continue monitoring', 'Update status'],
        })

    return recommendations
