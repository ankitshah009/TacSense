from pathlib import Path
import tempfile
import os
from typing import Tuple
from moviepy.editor import VideoFileClip
import speech_recognition as sr


def extract_audio_transcript(video_path: Path) -> str:
    """Extract audio from video and run offline transcription using Sphinx."""
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_audio:
            clip = VideoFileClip(str(video_path))
            clip.audio.write_audiofile(tmp_audio.name, fps=16000, logger=None)
            clip.close()
            recognizer = sr.Recognizer()
            with sr.AudioFile(tmp_audio.name) as source:
                audio = recognizer.record(source)
            try:
                transcript = recognizer.recognize_sphinx(audio)
            except Exception:
                transcript = ""
    finally:
        if os.path.exists(tmp_audio.name):
            os.unlink(tmp_audio.name)
    return transcript


def extract_visual_summary(video_path: Path) -> str:
    """Analyze a few frames to produce a simple visual summary."""
    try:
        import cv2
    except Exception:
        return "visual analysis not available"

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return "could not read video"

    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    sample_frames = min(frame_count, 10)
    brightness = 0.0

    for i in range(sample_frames):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i * frame_count / sample_frames)
        ret, frame = cap.read()
        if not ret:
            continue
        brightness += frame.mean()

    cap.release()
    if sample_frames == 0:
        return "no frames analyzed"
    avg_brightness = brightness / sample_frames
    lighting = "bright" if avg_brightness > 100 else "dim"
    return f"{sample_frames} frames analyzed, lighting {lighting}"


def summarize_video(video_path: Path) -> Tuple[str, str]:
    transcript = extract_audio_transcript(video_path)
    visual_summary = extract_visual_summary(video_path)
    return transcript, visual_summary
