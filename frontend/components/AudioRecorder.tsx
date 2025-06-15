'use client';

import { useState, useEffect } from 'react';
import { 
  MicIcon, 
  MicOffIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  SendIcon,
  DownloadIcon,
  TrashIcon,
  LoaderIcon,
  Volume2Icon,
  WaveformIcon
} from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { TacSenseAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onTranscriptionReceived?: (transcription: string) => void;
  onAnalysisReceived?: (analysis: any) => void;
  className?: string;
  compact?: boolean;
}

export default function AudioRecorder({ 
  onTranscriptionReceived, 
  onAnalysisReceived, 
  className,
  compact = false 
}: AudioRecorderProps) {
  const audioRecorder = useAudioRecorder();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/pause audio
  const togglePlayback = () => {
    if (!audioRecorder.state.audioUrl) return;

    if (!audioElement) {
      const audio = new Audio(audioRecorder.state.audioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  // Analyze recorded audio
  const analyzeAudio = async () => {
    if (!audioRecorder.state.audioBlob) return;

    setIsAnalyzing(true);
    try {
      const result = await TacSenseAPI.analyzeAudio(audioRecorder.state.audioBlob, {
        transcribeAudio: true,
        analyzeEmotion: true,
        detectKeywords: true,
      });

      setAnalysisResult(result);
      
      if (result.transcription && onTranscriptionReceived) {
        onTranscriptionReceived(result.transcription);
      }
      
      if (onAnalysisReceived) {
        onAnalysisReceived(result);
      }
    } catch (error) {
      console.error('Audio analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate simple waveform visualization
  useEffect(() => {
    if (audioRecorder.state.isRecording) {
      const interval = setInterval(() => {
        setWaveformData(prev => {
          const newData = [...prev, Math.random() * 100];
          return newData.slice(-50); // Keep last 50 data points
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [audioRecorder.state.isRecording]);

  // Reset waveform when recording stops
  useEffect(() => {
    if (!audioRecorder.state.isRecording) {
      setWaveformData([]);
    }
  }, [audioRecorder.state.isRecording]);

  if (compact) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <button
          onClick={audioRecorder.state.isRecording ? audioRecorder.stopRecording : audioRecorder.startRecording}
          className={cn(
            "p-2 rounded-full transition-all duration-200 flex items-center justify-center",
            audioRecorder.state.isRecording
              ? "bg-danger-600 hover:bg-danger-700 text-white animate-pulse"
              : "bg-tactical-600 hover:bg-tactical-700 text-white"
          )}
          title={audioRecorder.state.isRecording ? "Stop recording" : "Start recording"}
        >
          {audioRecorder.state.isRecording ? (
            <StopIcon className="w-4 h-4" />
          ) : (
            <MicIcon className="w-4 h-4" />
          )}
        </button>

        {audioRecorder.state.isRecording && (
          <div className="flex items-center space-x-1">
            <div className="w-1 h-4 bg-danger-500 rounded animate-pulse" />
            <span className="text-sm text-danger-400 font-mono">
              {formatDuration(audioRecorder.state.duration)}
            </span>
          </div>
        )}

        {audioRecorder.state.audioBlob && !audioRecorder.state.isRecording && (
          <button
            onClick={analyzeAudio}
            disabled={isAnalyzing}
            className="p-2 bg-tactical-600 hover:bg-tactical-700 text-white rounded-full transition-colors"
            title="Analyze audio"
          >
            {isAnalyzing ? (
              <LoaderIcon className="w-4 h-4 animate-spin" />
            ) : (
              <SendIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("bg-military-800 border border-military-600 rounded-lg p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <MicIcon className="w-5 h-5 text-tactical-400" />
          <span>Audio Recorder</span>
        </h3>
        
        {audioRecorder.state.error && (
          <div className="text-danger-400 text-sm">
            {audioRecorder.state.error}
          </div>
        )}
      </div>

      {/* Recording Status */}
      {audioRecorder.state.isRecording && (
        <div className="mb-4 p-4 bg-danger-900/30 border border-danger-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-danger-500 rounded-full animate-pulse" />
              <span className="text-danger-300 font-medium">Recording...</span>
              {audioRecorder.state.isPaused && (
                <span className="text-yellow-400 text-sm">(Paused)</span>
              )}
            </div>
            
            <div className="text-danger-300 font-mono text-lg">
              {formatDuration(audioRecorder.state.duration)}
            </div>
          </div>

          {/* Waveform Visualization */}
          <div className="mt-3 h-12 bg-military-900/50 rounded flex items-end justify-center space-x-0.5 px-2">
            {waveformData.map((height, index) => (
              <div
                key={index}
                className="w-1 bg-gradient-to-t from-danger-600 to-danger-400 rounded-t"
                style={{ height: `${Math.max(height * 0.4, 2)}px` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-3 mb-4">
        {!audioRecorder.state.isRecording ? (
          <button
            onClick={audioRecorder.startRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-tactical-600 hover:bg-tactical-700 text-white rounded-lg transition-colors font-medium"
          >
            <MicIcon className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={audioRecorder.state.isPaused ? audioRecorder.resumeRecording : audioRecorder.pauseRecording}
              className="p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              title={audioRecorder.state.isPaused ? "Resume" : "Pause"}
            >
              {audioRecorder.state.isPaused ? (
                <PlayIcon className="w-5 h-5" />
              ) : (
                <PauseIcon className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={audioRecorder.stopRecording}
              className="flex items-center space-x-2 px-4 py-3 bg-danger-600 hover:bg-danger-700 text-white rounded-lg transition-colors font-medium"
            >
              <StopIcon className="w-5 h-5" />
              <span>Stop</span>
            </button>
          </div>
        )}
      </div>

      {/* Recorded Audio Playback */}
      {audioRecorder.state.audioBlob && !audioRecorder.state.isRecording && (
        <div className="mb-4 p-4 bg-military-700/50 border border-military-600 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Volume2Icon className="w-4 h-4 text-tactical-400" />
              <span className="text-white text-sm font-medium">Recorded Audio</span>
              <span className="text-military-400 text-sm">
                ({formatDuration(audioRecorder.state.duration)})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlayback}
              className="p-2 bg-tactical-600 hover:bg-tactical-700 text-white rounded transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={analyzeAudio}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-4 py-2 bg-tactical-600 hover:bg-tactical-700 disabled:bg-military-600 text-white rounded transition-colors"
            >
              {isAnalyzing ? (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              ) : (
                <SendIcon className="w-4 h-4" />
              )}
              <span>Analyze</span>
            </button>

            <button
              onClick={audioRecorder.downloadRecording}
              className="p-2 bg-military-600 hover:bg-military-500 text-white rounded transition-colors"
              title="Download"
            >
              <DownloadIcon className="w-4 h-4" />
            </button>

            <button
              onClick={audioRecorder.clearRecording}
              className="p-2 bg-danger-600 hover:bg-danger-700 text-white rounded transition-colors"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="p-4 bg-tactical-900/30 border border-tactical-500/30 rounded-lg">
          <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
            <WaveformIcon className="w-4 h-4 text-tactical-400" />
            <span>Analysis Results</span>
          </h4>

          {analysisResult.transcription && (
            <div className="mb-3">
              <label className="block text-tactical-300 text-sm font-medium mb-1">
                Transcription:
              </label>
              <p className="text-white bg-military-700 p-3 rounded border">
                "{analysisResult.transcription}"
              </p>
            </div>
          )}

          {analysisResult.analysis && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-tactical-300">Intent:</span>
                <span className="text-white ml-2">{analysisResult.analysis.intent}</span>
              </div>
              <div>
                <span className="text-tactical-300">Sentiment:</span>
                <span className="text-white ml-2">{analysisResult.analysis.sentiment}</span>
              </div>
              <div>
                <span className="text-tactical-300">Urgency:</span>
                <span className="text-white ml-2">{analysisResult.analysis.urgency}</span>
              </div>
              <div>
                <span className="text-tactical-300">Confidence:</span>
                <span className="text-white ml-2">
                  {Math.round(analysisResult.analysis.confidence * 100)}%
                </span>
              </div>
            </div>
          )}

          {analysisResult.tactical_assessment && (
            <div className="mt-3 p-3 bg-danger-900/20 border border-danger-500/30 rounded">
              <div className="text-danger-300 font-medium mb-2">Tactical Assessment</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-danger-400">Threat Level:</span>
                  <span className="text-white ml-2">{analysisResult.tactical_assessment.threat_level}</span>
                </div>
                <div>
                  <span className="text-danger-400">Priority:</span>
                  <span className="text-white ml-2">{analysisResult.tactical_assessment.priority}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 