'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  VideoIcon, 
  RadioIcon, 
  CameraIcon,
  UploadIcon,
  MessageSquareIcon,
  AlertTriangleIcon,
  SettingsIcon,
  MicIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  DownloadIcon,
  RefreshCwIcon
} from 'lucide-react';

import TacSenseAPI from '@/lib/api';
import { 
  Message, 
  FileUpload, 
  TacSenseConfig, 
  TabType,
  ProcessingStatus,
  SystemAlert
} from '@/types';
import { 
  generateId, 
  formatFileSize, 
  getFileType, 
  formatTimestamp,
  cn,
  debounce
} from '@/lib/utils';
import { toast } from 'react-hot-toast';

// Import components
import FileUploadArea from '@/components/FileUploadArea';
import ChatInterface from '@/components/ChatInterface';
import ConfigPanel from '@/components/ConfigPanel';
import AlertPanel from '@/components/AlertPanel';
import StatusBar from '@/components/StatusBar';

const DEFAULT_CONFIG: TacSenseConfig = {
  chunkSize: 0, // No chunking by default
  enableVoiceAnalysis: true,
  enableChat: true,
  enableChatHistory: true,
  prompt: 'Write a concise and clear dense caption for the provided tactical video, focusing on irregular or hazardous events such as boxes falling, workers not wearing PPE, workers entering dangerous areas, and other safety concerns.',
  captionSummarizationPrompt: 'Summarize the following tactical video captions, focusing on safety incidents and operational concerns.',
  summaryAggregationPrompt: 'Aggregate the following summaries into a comprehensive operational report.',
  model: 'Pi-3.1',
  temperature: 0.7,
  maxTokens: 1000,
};

const TABS = [
  {
    id: 'video' as TabType,
    label: 'VIDEO FILE SUMMARIZATION & Q&A',
    icon: VideoIcon,
    enabled: true,
  },
  {
    id: 'live' as TabType,
    label: 'LIVE STREAM SUMMARIZATION',
    icon: RadioIcon,
    enabled: true,
  },
  {
    id: 'image' as TabType,
    label: 'IMAGE FILE SUMMARIZATION & Q&A',
    icon: CameraIcon,
    enabled: true,
  },
];

export default function TacSenseAI() {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('video');
  const [uploadedFile, setUploadedFile] = useState<FileUpload | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [config, setConfig] = useState<TacSenseConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  // Initialize system on mount
  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      // Check TTS status
      const ttsStatus = await TacSenseAPI.getTTSStatus();
      if (ttsStatus.status === 'ready') {
        addSystemAlert('info', 'TTS System Ready', 'Text-to-speech system is operational');
      }
      
      // Add welcome message
      addMessage({
        id: generateId(),
        type: 'system',
        content: 'TacSense AI initialized. Ready for multimodal analysis. Upload files or start a conversation.',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('System initialization error:', error);
      addSystemAlert('error', 'System Initialization Failed', 'Some services may be unavailable');
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const addSystemAlert = (type: SystemAlert['type'], title: string, message: string) => {
    const alert: SystemAlert = {
      id: generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      dismissed: false,
    };
    setSystemAlerts(prev => [...prev, alert]);
  };

  const dismissAlert = (alertId: string) => {
    setSystemAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  // File upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    const fileUpload: FileUpload = {
      id: generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading',
      uploadProgress: 0,
    };

    setUploadedFile(fileUpload);
    setProcessingStatus({
      stage: 'uploading',
      progress: 0,
      message: 'Uploading file...',
    });

    try {
      // Validate file type
      const fileType = getFileType(file.name);
      const allowedTypes = activeTab === 'video' ? ['video'] : 
                          activeTab === 'image' ? ['image'] : ['video', 'image', 'audio'];
      
      if (!allowedTypes.includes(fileType)) {
        throw new Error(`Invalid file type. Expected ${allowedTypes.join(', ')} but got ${fileType}`);
      }

      // Upload file
      const uploadResult = await TacSenseAPI.uploadFile(file, (progress) => {
        setUploadedFile(prev => prev ? { ...prev, uploadProgress: progress } : null);
        setProcessingStatus(prev => prev ? { ...prev, progress } : null);
      });

      // Update status
      setUploadedFile(prev => prev ? { 
        ...prev, 
        status: 'processing',
        url: uploadResult.fileId 
      } : null);

      setProcessingStatus({
        stage: 'analyzing',
        progress: 50,
        message: 'Analyzing content...',
      });

      // Process based on file type and tab
      let analysisResult;
      if (activeTab === 'video' && fileType === 'video') {
        analysisResult = await TacSenseAPI.processVideo(file, {
          chunkSize: config.chunkSize,
          prompt: config.prompt,
          captionPrompt: config.captionSummarizationPrompt,
          summaryPrompt: config.summaryAggregationPrompt,
        });
      } else if (activeTab === 'image' && fileType === 'image') {
        analysisResult = await TacSenseAPI.analyzeImage(file, config.prompt);
      }

      // Update final status
      setUploadedFile(prev => prev ? { 
        ...prev, 
        status: 'completed',
        processedData: analysisResult 
      } : null);

      setProcessingStatus({
        stage: 'completed',
        progress: 100,
        message: 'Analysis complete',
      });

      // Add analysis results to chat
      if (analysisResult) {
        addMessage({
          id: generateId(),
          type: 'assistant',
          content: `Analysis complete for ${file.name}. I've processed the ${fileType} and extracted key insights. You can now ask questions about the content.`,
          timestamp: new Date(),
          metadata: {
            confidence: 0.95,
          },
        });
      }

      toast.success('File processed successfully');
    } catch (error) {
      console.error('File upload error:', error);
      setUploadedFile(prev => prev ? { ...prev, status: 'error' } : null);
      setProcessingStatus({
        stage: 'error',
        progress: 0,
        message: 'Processing failed',
        details: TacSenseAPI.handleApiError(error),
      });
      toast.error(TacSenseAPI.handleApiError(error));
    }
  }, [activeTab, config]);

  // Chat message handler
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // Analyze text for urgency and intent
      const textAnalysis = await TacSenseAPI.analyzeText(message);
      
      // Build context from previous messages
      const context = messages.slice(-5).map(msg => ({
        text: msg.content,
        type: msg.type === 'user' ? 'Human' : 'Assistant',
      }));

      // Send to inference API
      const response = await TacSenseAPI.sendChatMessage(message, context);

      const assistantMessage: Message = {
        id: generateId(),
        type: 'assistant',
        content: response.response,
        timestamp: new Date(),
        metadata: {
          confidence: response.confidence,
          intent: textAnalysis.intent,
          urgency: textAnalysis.urgency as 'low' | 'medium' | 'high',
        },
      };

      addMessage(assistantMessage);

      // Generate speech if enabled
      if (config.enableVoiceAnalysis) {
        try {
          const speechResult = await TacSenseAPI.generateSpeech(response.response);
          if (speechResult.status === 'success') {
            const audio = new Audio(speechResult.audio_url);
            setAudioPlayer(audio);
          }
        } catch (speechError) {
          console.error('Speech generation error:', speechError);
        }
      }

      // Check for high urgency and create alerts
      if (textAnalysis.urgency === 'high') {
        addSystemAlert('warning', 'High Urgency Detected', 'Commander input indicates high priority situation');
      }

    } catch (error) {
      console.error('Send message error:', error);
      addMessage({
        id: generateId(),
        type: 'system',
        content: `Error: ${TacSenseAPI.handleApiError(error)}`,
        timestamp: new Date(),
      });
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [messages, config]);

  // Voice recording handler
  const toggleVoiceRecording = useCallback(() => {
    setIsVoiceRecording(prev => !prev);
    // TODO: Implement voice recording functionality
    toast.info(isVoiceRecording ? 'Voice recording stopped' : 'Voice recording started');
  }, [isVoiceRecording]);

  // Audio playback handler
  const playAudio = useCallback(() => {
    if (audioPlayer) {
      audioPlayer.play();
    }
  }, [audioPlayer]);

  // Delete file handler
  const handleDeleteFile = useCallback(() => {
    setUploadedFile(null);
    setProcessingStatus(null);
    toast.success('File removed');
  }, []);

  // Reset chat handler
  const resetChat = useCallback(() => {
    setMessages([]);
    addMessage({
      id: generateId(),
      type: 'system',
      content: 'Chat reset. How can I assist you with tactical analysis?',
      timestamp: new Date(),
    });
    toast.success('Chat reset');
  }, []);

  return (
    <div className="min-h-screen bg-military-900 text-white">
      {/* Header */}
      <header className="bg-military-800 border-b border-military-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-tactical-500 rounded-lg flex items-center justify-center">
                <VideoIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">TacSense AI</h1>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-sm text-military-300">
              <div className="w-2 h-2 bg-success-500 rounded-full pulse-dot"></div>
              <span>Operational</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                showConfig 
                  ? "bg-tactical-600 text-white" 
                  : "bg-military-700 text-military-300 hover:bg-military-600"
              )}
            >
              Show Parameters
            </button>
            <button
              onClick={resetChat}
              className="p-2 text-military-300 hover:text-white hover:bg-military-700 rounded-lg transition-colors"
              title="Reset Chat"
            >
              <RefreshCwIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-military-800 border-b border-military-600">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-success-50 text-success-800 border-success-600'
                  : 'text-military-300 border-transparent hover:text-white hover:bg-military-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 h-[calc(100vh-140px)]">
        {/* Left Sidebar */}
        <div className="w-80 bg-military-800 border-r border-military-600 flex flex-col">
          {/* File Upload Area */}
          <div className="p-4 border-b border-military-600">
            <FileUploadArea
              onFileUpload={handleFileUpload}
              uploadedFile={uploadedFile}
              onDeleteFile={handleDeleteFile}
              acceptedTypes={activeTab === 'video' ? 'video/*' : activeTab === 'image' ? 'image/*' : '*'}
              processingStatus={processingStatus}
            />
          </div>

          {/* Configuration Panel */}
          {showConfig && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ConfigPanel
                config={config}
                onConfigChange={setConfig}
                onClose={() => setShowConfig(false)}
              />
            </div>
          )}

          {/* Alerts Panel */}
          <div className="border-t border-military-600">
            <AlertPanel
              alerts={systemAlerts.filter(alert => !alert.dismissed)}
              onDismissAlert={dismissAlert}
            />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-military-800 border-b border-military-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <MessageSquareIcon className="w-5 h-5 text-tactical-400" />
                  <span className="font-medium">CHAT</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangleIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-military-300">ALERTS</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleVoiceRecording}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isVoiceRecording
                      ? "bg-danger-600 text-white"
                      : "bg-military-700 text-military-300 hover:bg-military-600"
                  )}
                  title="Voice Input"
                >
                  <MicIcon className="w-4 h-4" />
                </button>
                
                {audioPlayer && (
                  <button
                    onClick={playAudio}
                    className="p-2 bg-military-700 text-military-300 hover:bg-military-600 rounded-lg transition-colors"
                    title="Play Audio Response"
                  >
                    <PlayIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            <ChatInterface
              messages={messages}
              currentInput={currentInput}
              onInputChange={setCurrentInput}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              activeTab={activeTab}
            />
          </div>
        </div>

        {/* Right Sidebar - Analysis Results */}
        <div className="w-80 bg-military-800 border-l border-military-600 flex flex-col">
          <div className="p-4 border-b border-military-600">
            <h3 className="font-medium text-white mb-2">
              {activeTab === 'video' ? 'VIDEO EVENT SUMMARY' : 
               activeTab === 'image' ? 'IMAGE ANALYSIS SUMMARY' : 
               'LIVE STREAM SUMMARY'}
            </h3>
            <div className="bg-military-700 rounded-lg p-4 text-sm text-military-300">
              {uploadedFile && uploadedFile.status === 'completed' && uploadedFile.processedData ? (
                <div className="space-y-2">
                  <p className="text-white font-medium">Analysis Complete</p>
                  <p>{uploadedFile.processedData.summary || 'Tactical analysis results available for querying.'}</p>
                  {uploadedFile.processedData.insights && uploadedFile.processedData.insights.length > 0 && (
                    <div className="mt-3">
                      <p className="text-white font-medium text-xs mb-2">KEY INSIGHTS:</p>
                      <ul className="space-y-1">
                        {uploadedFile.processedData.insights.slice(0, 3).map((insight: any, index: number) => (
                          <li key={index} className="text-xs">• {insight.description || insight.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {uploadedFile.processedData.threats && uploadedFile.processedData.threats.length > 0 && (
                    <div className="mt-3">
                      <p className="text-danger-400 font-medium text-xs mb-2">THREATS DETECTED:</p>
                      <ul className="space-y-1">
                        {uploadedFile.processedData.threats.slice(0, 2).map((threat: any, index: number) => (
                          <li key={index} className="text-xs text-danger-300">
                            ⚠ {threat.description || threat.type} ({threat.severity})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p>Upload a {activeTab === 'video' ? 'video' : activeTab === 'image' ? 'image' : 'file'} to see tactical analysis results here...</p>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4 space-y-4">
            <div className="space-y-2">
              <button 
                onClick={() => setCurrentInput("What are the key findings from this analysis?")}
                className="w-full bg-tactical-600 hover:bg-tactical-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Ask
              </button>
              <button 
                onClick={() => setCurrentInput("Generate a scenario highlight focusing on critical events")}
                className="w-full bg-military-700 hover:bg-military-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Generate Scenario Highlight
              </button>
              <button 
                onClick={() => setCurrentInput("Create a summary of key tactical highlights")}
                className="w-full bg-military-700 hover:bg-military-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Generate Highlight
              </button>
              <button 
                onClick={resetChat}
                className="w-full bg-military-700 hover:bg-military-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Reset Chat
              </button>
            </div>

            {/* Quick Analysis Options */}
            {uploadedFile && uploadedFile.status === 'completed' && (
              <div className="border-t border-military-600 pt-4">
                <h4 className="text-sm font-medium text-military-300 mb-3">QUICK ANALYSIS</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => setCurrentInput("Identify all safety violations and hazards")}
                    className="w-full bg-yellow-900 hover:bg-yellow-800 text-yellow-200 px-3 py-2 rounded text-xs transition-colors"
                  >
                    Safety Analysis
                  </button>
                  <button 
                    onClick={() => setCurrentInput("Detect any security threats or anomalies")}
                    className="w-full bg-danger-900 hover:bg-danger-800 text-danger-200 px-3 py-2 rounded text-xs transition-colors"
                  >
                    Threat Detection
                  </button>
                  <button 
                    onClick={() => setCurrentInput("List all personnel and equipment observed")}
                    className="w-full bg-tactical-900 hover:bg-tactical-800 text-tactical-200 px-3 py-2 rounded text-xs transition-colors"
                  >
                    Asset Inventory
                  </button>
                  <button 
                    onClick={() => setCurrentInput("Provide operational recommendations")}
                    className="w-full bg-success-900 hover:bg-success-800 text-success-200 px-3 py-2 rounded text-xs transition-colors"
                  >
                    Recommendations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        systemStatus="operational"
        uploadedFile={uploadedFile}
        processingStatus={processingStatus}
        activeConnections={1}
      />
    </div>
  );
} 