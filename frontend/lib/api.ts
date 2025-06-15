import axios, { AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  InferenceRequest, 
  InferenceResponse, 
  VoiceMetrics,
  AnalysisResult,
  ProcessingStatus
} from '@/types';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/api' 
  : '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized access
    }
    return Promise.reject(error);
  }
);

export class TacSenseAPI {
  // Text and Chat API
  static async sendChatMessage(
    message: string, 
    context: Array<{ text: string; type: string }>
  ): Promise<InferenceResponse> {
    try {
      const response = await apiClient.post<InferenceResponse>('/inference', {
        context: [...context, { text: message, type: 'Human' }],
        config: 'Pi-3.1'
      });
      return response.data;
    } catch (error) {
      console.error('Send chat message error:', error);
      throw error;
    }
  }

  // Voice and Speech API
  static async generateSpeech(
    text: string, 
    options: { exaggeration?: number; cfg?: number } = {}
  ): Promise<{ audio_url: string; status: string }> {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('exaggeration', options.exaggeration?.toString() || '0.5');
      formData.append('cfg', options.cfg?.toString() || '0.5');

      const response = await apiClient.post('/tts/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Generate speech error:', error);
      throw error;
    }
  }

  static async getTTSStatus(): Promise<{ status: string; model_loaded: boolean; device: string }> {
    try {
      const response = await apiClient.get('/tts/status');
      return response.data;
    } catch (error) {
      console.error('Get TTS status error:', error);
      throw error;
    }
  }

  // File Upload and Processing API
  static async uploadFile(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<{ fileId: string; status: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  }

  static async processVideo(
    videoFile: File,
    config: {
      chunkSize?: number;
      prompt?: string;
      captionPrompt?: string;
      summaryPrompt?: string;
    } = {}
  ): Promise<ProcessingStatus> {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      
      if (config.chunkSize) formData.append('chunk_size', config.chunkSize.toString());
      if (config.prompt) formData.append('prompt', config.prompt);
      if (config.captionPrompt) formData.append('caption_prompt', config.captionPrompt);
      if (config.summaryPrompt) formData.append('summary_prompt', config.summaryPrompt);

      const response = await apiClient.post('/video/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for video processing
      });

      return response.data;
    } catch (error) {
      console.error('Process video error:', error);
      throw error;
    }
  }

  static async inferVideo(videoFile: File): Promise<InferenceResponse> {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const response = await apiClient.post<InferenceResponse>(
        '/video/inference',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Video inference error:', error);
      throw error;
    }
  }

  static async searchVideo(
    query: string, 
    videoFile: File
  ): Promise<AnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('query', query);
      formData.append('video', videoFile);

      const response = await apiClient.post<AnalysisResult>('/video/search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Search video error:', error);
      throw error;
    }
  }

  // LiveKit Streaming API
  static async getLiveKitToken(identity: string): Promise<{ token: string; url: string }> {
    try {
      const response = await apiClient.get(`/livekit/token?identity=${encodeURIComponent(identity)}`);
      return response.data;
    } catch (error) {
      console.error('Get LiveKit token error:', error);
      throw error;
    }
  }

  // Voice Analysis API
  static async analyzeVoice(voiceMetrics: VoiceMetrics): Promise<{
    stressLevel: string;
    urgency: string;
    confidence: number;
    metrics: VoiceMetrics;
  }> {
    try {
      const response = await apiClient.post('/voice/analyze', { voiceMetrics });
      return response.data;
    } catch (error) {
      console.error('Analyze voice error:', error);
      throw error;
    }
  }

  // Text Analysis API
  static async analyzeText(text: string): Promise<{
    intent: string;
    sentiment: string;
    urgency: string;
    keywords: string[];
    confidence: number;
  }> {
    try {
      const response = await apiClient.post('/text/analyze', { text });
      return response.data;
    } catch (error) {
      console.error('Analyze text error:', error);
      throw error;
    }
  }

  // Image Analysis API
  static async analyzeImage(
    imageFile: File,
    prompt?: string
  ): Promise<{
    objects: Array<{ type: string; confidence: number; position: any }>;
    threats: Array<{ type: string; severity: string; confidence: number }>;
    insights: Array<{ type: string; description: string; confidence: number }>;
  }> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (prompt) formData.append('prompt', prompt);

      const response = await apiClient.post('/image/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Analyze image error:', error);
      throw error;
    }
  }

  // System Status API
  static async getSystemStatus(): Promise<{
    status: string;
    services: Array<{ name: string; status: string; uptime: number }>;
    performance: { cpu: number; memory: number; disk: number };
  }> {
    try {
      const response = await apiClient.get('/system/status');
      return response.data;
    } catch (error) {
      console.error('Get system status error:', error);
      throw error;
    }
  }

  // Utility method for handling API errors
  static handleApiError(error: any): string {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    } else if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}

// Utility functions for API responses
export const createApiResponse = <T>(
  success: boolean, 
  data?: T, 
  error?: string
): ApiResponse<T> => ({
  success,
  data,
  error,
});

export const isApiError = (response: any): response is { error: string } => {
  return response && typeof response.error === 'string';
};

export default TacSenseAPI; 