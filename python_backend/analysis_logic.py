"""
Analysis logic for TacSense AI, ported from the original Node.js implementation.
"""

from typing import Dict, Any, List, Optional
import re
import random

# Mock analysis functions - replace with actual ML models in production

def analyze_voice(voice_metrics: Dict[str, float]) -> Dict[str, Any]:
    """
    Analyze voice metrics to determine stress level and other characteristics.
    
    Args:
        voice_metrics: Dictionary containing pitch, tempo, intensity, etc.
        
    Returns:
        Dict containing analysis results
    """
    # Default values if metrics are not provided
    pitch = voice_metrics.get('pitch', 0)
    tempo = voice_metrics.get('tempo', 0)
    intensity = voice_metrics.get('intensity', 0)
    
    # Simple heuristic for stress detection
    stress_score = 0
    if pitch > 250:  # Higher pitch might indicate stress
        stress_score += 1
    if tempo > 160:  # Faster speech might indicate stress
        stress_score += 1
    if intensity > 0.7:  # Higher intensity might indicate stress
        stress_score += 1
        
    stress_level = "high" if stress_score >= 2 else "moderate" if stress_score == 1 else "low"
    
    return {
        "stressLevel": stress_level,
        "metrics": {
            "pitch": pitch,
            "tempo": tempo,
            "intensity": intensity
        },
        "confidence": 0.85,  # Mock confidence value
        "urgency": "high" if stress_level == "high" else "medium"
    }

def analyze_text(text: str) -> Dict[str, Any]:
    """
    Analyze text for intent, sentiment, and urgency.
    
    Args:
        text: Input text to analyze
        
    Returns:
        Dict containing analysis results
    """
    if not text:
        return {
            "intent": "unknown",
            "sentiment": "neutral",
            "urgency": "low",
            "confidence": 0.0
        }
    
    # Simple keyword matching for intent detection
    text_lower = text.lower()
    intent = "inform"
    sentiment = "neutral"
    
    # Check for questions
    if "?" in text or any(word in text_lower for word in ["what", "where", "when", "why", "how", "who"]):
        intent = "question"
    
    # Check for commands
    if any(word in text_lower for word in ["go to", "move to", "deploy", "attack", "defend"]):
        intent = "command"
    
    # Simple sentiment analysis
    positive_words = ["good", "affirmative", "yes", "positive", "clear"]
    negative_words = ["negative", "no", "bad", "danger", "threat"]
    
    if any(word in text_lower for word in positive_words):
        sentiment = "positive"
    elif any(word in text_lower for word in negative_words):
        sentiment = "negative"
    
    # Urgency detection
    urgent_indicators = ["urgent", "now", "immediately", "asap", "emergency", "help"]
    urgency = "high" if any(word in text_lower for word in urgent_indicators) else "medium"
    
    return {
        "intent": intent,
        "sentiment": sentiment,
        "urgency": urgency,
        "keywords": [word for word in text_lower.split() if len(word) > 3],
        "confidence": 0.9  # Mock confidence value
    }

def analyze_visual(visual_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze visual data for threats and objects of interest.
    
    Args:
        visual_data: List of detected objects with type, confidence, and position
        
    Returns:
        Dict containing analysis results
    """
    if not visual_data:
        return {
            "threats": [],
            "objects": [],
            "threatLevel": "low",
            "confidence": 0.0
        }
    
    # Threat classification
    threat_types = ["person", "vehicle", "weapon", "drone", "suspicious_object"]
    threats = []
    objects = []
    
    for obj in visual_data:
        obj_type = obj.get("type", "").lower()
        confidence = obj.get("confidence", 0)
        
        # Only consider high confidence detections
        if confidence < 0.5:
            continue
            
        if any(threat in obj_type for threat in threat_types):
            threat_level = "high"
            if "person" in obj_type:
                threat_level = "medium"
            elif "vehicle" in obj_type:
                threat_level = "high" if confidence > 0.8 else "medium"
                
            threats.append({
                "type": obj_type,
                "confidence": confidence,
                "position": obj.get("position", {}),
                "threatLevel": threat_level,
                "id": f"threat-{len(threats)+1}"
            })
        else:
            objects.append({
                "type": obj_type,
                "confidence": confidence,
                "position": obj.get("position", {})
            })
    
    # Determine overall threat level
    threat_levels = [t.get("threatLevel", "low") for t in threats]
    overall_threat = "low"
    if "high" in threat_levels:
        overall_threat = "high"
    elif "medium" in threat_levels:
        overall_threat = "medium"
    
    return {
        "threats": threats,
        "objects": objects,
        "threatLevel": overall_threat,
        "confidence": 0.85 if threats else 0.95,
        "timestamp": "2023-04-01T12:00:00Z"  # Would use datetime.utcnow().isoformat() in production
    }

def generate_recommendations(context: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate recommendations based on analysis context.
    
    Args:
        context: Dictionary containing analysis results from voice, text, and visual analysis
        
    Returns:
        List of recommendation objects
    """
    recommendations = []
    
    # Voice-based recommendations
    if "voice" in context and context["voice"].get("urgency") == "high":
        recommendations.append({
            "type": "voice_analysis",
            "priority": "high",
            "message": "High stress detected in voice. Consider checking on the operator's status.",
            "suggestedActions": ["Acknowledge stress", "Offer support", "Consider operator rotation"]
        })
    
    # Text-based recommendations
    if "text" in context:
        text_data = context["text"]
        if text_data.get("intent") == "command" and text_data.get("urgency") == "high":
            recommendations.append({
                "type": "command_priority",
                "priority": "high",
                "message": "High-priority command detected. Prioritize execution.",
                "suggestedActions": ["Acknowledge command", "Confirm execution", "Assess resources"]
            })
    
    # Visual-based recommendations
    if "visual" in context and context["visual"].get("threatLevel") in ["medium", "high"]:
        threat_count = len(context["visual"].get("threats", []))
        threat_level = context["visual"].get("threatLevel")
        
        recommendations.append({
            "type": "threat_detected",
            "priority": threat_level,
            "message": f"{threat_count} potential threat(s) detected with {threat_level} risk level.",
            "suggestedActions": ["Assess threat level", "Alert team members", "Consider evasive actions"]
        })
    
    # Add default recommendation if none generated
    if not recommendations:
        recommendations.append({
            "type": "status_update",
            "priority": "low",
            "message": "All systems nominal. Continue monitoring.",
            "suggestedActions": ["Continue monitoring"]
        })
    
    return recommendations

# Example usage
if __name__ == "__main__":
    # Test voice analysis
    voice_result = analyze_voice({"pitch": 280, "tempo": 175, "intensity": 0.8})
    print("Voice Analysis:", voice_result)
    
    # Test text analysis
    text_result = analyze_text("Enemy spotted at grid 123-456! Requesting immediate support!")
    print("\nText Analysis:", text_result)
    
    # Test visual analysis
    visual_data = [
        {"type": "person", "confidence": 0.92, "position": {"x": 100, "y": 200}},
        {"type": "rifle", "confidence": 0.88, "position": {"x": 105, "y": 205}},
        {"type": "vehicle", "confidence": 0.76, "position": {"x": 300, "y": 400}}
    ]
    visual_result = analyze_visual(visual_data)
    print("\nVisual Analysis:", visual_result)
    
    # Test recommendations
    context = {
        "voice": voice_result,
        "text": text_result,
        "visual": visual_result
    }
    recs = generate_recommendations(context)
    print("\nRecommendations:", recs)
