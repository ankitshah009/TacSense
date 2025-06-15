"""
TacSense Video Analysis Engine
Based on NVIDIA VSS (Video Search and Summarization) Architecture
Integrated with Google Gemini 2.5-pro for multimodal video understanding
"""

import os
import cv2
import base64
import tempfile
import asyncio
import json
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import numpy as np

from google import genai
from google.genai import types
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class VideoFrame:
    """Represents a video frame with metadata"""
    frame_id: int
    timestamp: float
    image_data: np.ndarray
    base64_data: str
    
@dataclass
class VideoChunk:
    """Represents a video chunk for processing"""
    chunk_id: str
    start_time: float
    end_time: float
    frames: List[VideoFrame]
    audio_transcript: Optional[str] = None

@dataclass
class VideoInsight:
    """Represents an insight extracted from video analysis"""
    id: str
    type: str  # tactical, operational, safety, threat
    title: str
    description: str
    confidence: float
    priority: str  # low, medium, high, critical
    timestamp: float
    frame_references: List[int]
    
@dataclass
class TacticalAlert:
    """Represents a tactical alert from video analysis"""
    id: str
    alert_type: str
    severity: str  # low, medium, high, critical
    title: str
    description: str
    timestamp: float
    confidence: float
    recommended_actions: List[str]

class GeminiVideoAnalyzer:
    """
    Video Analysis Engine using Google Gemini 2.5-pro
    Inspired by NVIDIA VSS architecture for tactical video understanding
    """
    
    def __init__(self, api_key: str):
        """Initialize the Gemini Video Analyzer"""
        self.api_key = api_key
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.5-pro-preview-05-06"
        
        # Tactical analysis prompts inspired by VSS
        self.tactical_prompts = {
            "situational_awareness": """
            Analyze this video content for tactical situational awareness. Focus on:
            1. Personnel movement patterns and formations
            2. Equipment and vehicle identification
            3. Environmental conditions and terrain
            4. Potential threats or anomalies
            5. Communication or coordination activities
            
            Provide detailed observations with confidence scores and tactical significance.
            """,
            
            "threat_assessment": """
            Conduct a comprehensive threat assessment of this video content:
            1. Identify any potential security threats or risks
            2. Assess hostile activities or suspicious behavior
            3. Evaluate defensive positions and vulnerabilities
            4. Analyze crowd dynamics or group behavior
            5. Detect weapons, explosives, or dangerous materials
            
            Rate threat levels and provide immediate recommendations.
            """,
            
            "operational_analysis": """
            Perform operational analysis focusing on:
            1. Mission effectiveness and execution
            2. Resource utilization and logistics
            3. Communication and coordination quality
            4. Standard operating procedure compliance
            5. Performance metrics and efficiency
            
            Provide actionable insights for operational improvement.
            """,
            
            "safety_compliance": """
            Evaluate safety and compliance aspects:
            1. Personal protective equipment usage
            2. Safety protocol adherence
            3. Hazardous conditions or unsafe practices
            4. Emergency response readiness
            5. Regulatory compliance issues
            
            Highlight safety concerns and compliance violations.
            """
        }
    
    def extract_frames(self, video_path: str, max_frames: int = 10) -> List[VideoFrame]:
        """Extract key frames from video for analysis"""
        frames = []
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0
        
        # Extract frames at regular intervals
        frame_interval = max(1, total_frames // max_frames)
        
        frame_count = 0
        extracted_count = 0
        
        while cap.isOpened() and extracted_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % frame_interval == 0:
                # Convert frame to base64
                _, buffer = cv2.imencode('.jpg', frame)
                base64_data = base64.b64encode(buffer).decode('utf-8')
                
                timestamp = frame_count / fps if fps > 0 else 0
                
                video_frame = VideoFrame(
                    frame_id=extracted_count,
                    timestamp=timestamp,
                    image_data=frame,
                    base64_data=base64_data
                )
                
                frames.append(video_frame)
                extracted_count += 1
            
            frame_count += 1
        
        cap.release()
        logger.info(f"Extracted {len(frames)} frames from video (duration: {duration:.2f}s)")
        return frames
    
    async def analyze_chunk_with_gemini(self, chunk: VideoChunk, analysis_type: str = "situational_awareness") -> Dict[str, Any]:
        """Analyze a video chunk using Gemini 2.5-pro"""
        try:
            # Prepare content with multiple frames
            parts = [types.Part.from_text(text=self.tactical_prompts[analysis_type])]
            
            # Add frames to the analysis
            for frame in chunk.frames:
                # Convert base64 to bytes for Gemini
                image_bytes = base64.b64decode(frame.base64_data)
                parts.append(types.Part.from_bytes(
                    data=image_bytes,
                    mime_type="image/jpeg"
                ))
            
            contents = [types.Content(role="user", parts=parts)]
            
            # Generate analysis
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents
            )
            
            # Parse response (simplified for now)
            result = {
                "chunk_id": chunk.chunk_id,
                "timestamp_range": [chunk.start_time, chunk.end_time],
                "analysis_type": analysis_type,
                "summary": response.text,
                "confidence_score": 0.85  # Mock confidence
            }
            
            logger.info(f"Analyzed chunk {chunk.chunk_id} with {len(chunk.frames)} frames")
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing chunk {chunk.chunk_id}: {str(e)}")
            return {
                "chunk_id": chunk.chunk_id,
                "error": str(e),
                "summary": "Analysis failed",
                "confidence_score": 0.0
            }
    
    async def comprehensive_video_analysis(self, video_path: str, max_frames: int = 20) -> Dict[str, Any]:
        """
        Perform comprehensive video analysis using multiple analysis types
        Similar to NVIDIA VSS multi-modal approach
        """
        try:
            # Extract frames
            frames = self.extract_frames(video_path, max_frames)
            if not frames:
                raise ValueError("No frames extracted from video")
            
            # Create chunks (simplified - just one chunk for now)
            chunk = VideoChunk(
                chunk_id=str(uuid.uuid4()),
                start_time=frames[0].timestamp,
                end_time=frames[-1].timestamp,
                frames=frames
            )
            
            # Analyze with situational awareness
            result = await self.analyze_chunk_with_gemini(chunk, "situational_awareness")
            
            # Format final result
            final_result = {
                "video_path": video_path,
                "analysis_timestamp": datetime.now().isoformat(),
                "executive_summary": result.get("summary", "Video analysis completed"),
                "overall_confidence": result.get("confidence_score", 0.0),
                "total_frames_analyzed": len(frames),
                "analysis_duration": f"{frames[-1].timestamp - frames[0].timestamp:.2f}s",
                "detailed_analysis": result
            }
            
            logger.info("Comprehensive video analysis completed")
            return final_result
            
        except Exception as e:
            logger.error(f"Error in comprehensive video analysis: {str(e)}")
            raise

    async def analyze_image_with_context(self, image_path: str, context_prompt: str = "") -> Dict[str, Any]:
        """Analyze a single image with tactical context"""
        try:
            # Read and encode image
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # Prepare tactical image analysis prompt
            tactical_prompt = f"""
            Analyze this image for tactical and operational intelligence:
            
            {context_prompt if context_prompt else "Provide comprehensive tactical analysis focusing on personnel, equipment, environment, and potential threats."}
            
            Focus on:
            1. Personnel identification and activities
            2. Equipment and vehicle assessment
            3. Environmental conditions and terrain
            4. Potential security concerns or threats
            5. Tactical significance and recommendations
            
            Provide detailed observations with confidence scores.
            """
            
            parts = [
                types.Part.from_text(text=tactical_prompt),
                types.Part.from_bytes(data=image_data, mime_type="image/jpeg")
            ]
            
            contents = [types.Content(role="user", parts=parts)]
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents
            )
            
            result = {
                "image_path": image_path,
                "analysis_timestamp": datetime.now().isoformat(),
                "tactical_assessment": response.text,
                "confidence_score": 0.85  # Mock confidence
            }
            
            logger.info(f"Analyzed image: {image_path}")
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing image {image_path}: {str(e)}")
            return {
                "image_path": image_path,
                "error": str(e),
                "summary": "Image analysis failed",
                "confidence_score": 0.0
            }

# Utility functions for integration
def setup_gemini_analyzer(api_key: str = None) -> GeminiVideoAnalyzer:
    """Setup Gemini Video Analyzer with API key"""
    if not api_key:
        api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable or api_key parameter required")
    
    return GeminiVideoAnalyzer(api_key)

async def analyze_video_file(video_path: str, api_key: str = None) -> Dict[str, Any]:
    """Convenience function to analyze a video file"""
    analyzer = setup_gemini_analyzer(api_key)
    return await analyzer.comprehensive_video_analysis(video_path)

async def analyze_image_file(image_path: str, context: str = "", api_key: str = None) -> Dict[str, Any]:
    """Convenience function to analyze an image file"""
    analyzer = setup_gemini_analyzer(api_key)
    return await analyzer.analyze_image_with_context(image_path, context) 