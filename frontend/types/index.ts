// Core TacSense AI Types

export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    intent?: string;
    urgency?: 'low' | 'medium' | 'high';
    stressLevel?: 'low' | 'moderate' | 'high';
    voiceMetrics?: VoiceMetrics;
  };
}

export interface VoiceMetrics {
  pitch: number;
  tempo: number;
  intensity: number;
  duration: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentInput: string;
  mode: 'video' | 'live' | 'image';
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  uploadProgress?: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  processedData?: any;
}

export interface TacSenseConfig {
  chunkSize: number;
  enableVoiceAnalysis: boolean;
  enableChat: boolean;
  enableChatHistory: boolean;
  prompt: string;
  captionSummarizationPrompt: string;
  summaryAggregationPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AnalysisResult {
  summary: string;
  insights: Insight[];
  threats: Threat[];
  recommendations: Recommendation[];
  confidence: number;
  timestamp: string;
}

export interface Insight {
  id: string;
  type: 'tactical' | 'operational' | 'strategic';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: string;
}

export interface Threat {
  id: string;
  type: string;
  description: string;
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detectedAt: string;
  status: 'active' | 'monitoring' | 'resolved';
}

export interface Recommendation {
  id: string;
  type: 'immediate' | 'tactical' | 'strategic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  suggestedActions: string[];
  rationale: string;
  confidence: number;
  timestamp: string;
}

export interface LiveStreamData {
  streamId: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  participants: number;
  startTime: Date;
  metrics: {
    audioLevel: number;
    videoQuality: string;
    latency: number;
  };
}

export interface VoiceCommand {
  id: string;
  transcript: string;
  confidence: number;
  intent: string;
  urgency: 'low' | 'medium' | 'high';
  timestamp: Date;
  processed: boolean;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  handler: () => void;
}

export interface ProcessingStatus {
  stage: 'uploading' | 'analyzing' | 'generating' | 'completed' | 'error';
  progress: number;
  message: string;
  details?: string;
}

export interface SpeechSynthesisOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
}

export type TabType = 'video' | 'live' | 'image';

export interface TabConfig {
  id: TabType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface InferenceRequest {
  context: Array<{
    text: string;
    type: string;
  }>;
  config?: string;
}

export interface InferenceResponse {
  response?: string;  // Direct response format
  confidence?: number;
  processing_time?: number;
  choices?: Array<{   // OpenAI-style response format
    message: {
      content: string;
    };
  }>;
} 