'use client';

import { useEffect, useRef, useState } from 'react';
import { SendIcon, MicIcon, LoaderIcon, PlayIcon, VolumeXIcon, Volume2Icon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Message, TabType } from '@/types';
import { formatTimestamp, cn, getUrgencyColor, getConfidenceColor } from '@/lib/utils';
import AudioRecorder from './AudioRecorder';

interface ChatInterfaceProps {
  messages: Message[];
  currentInput: string;
  onInputChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  onGenerateSpeech?: (text: string) => void;
  isLoading: boolean;
  activeTab: TabType;
  onAudioAnalysis?: (analysis: any) => void;
}

export default function ChatInterface({
  messages,
  currentInput,
  onInputChange,
  onSendMessage,
  onGenerateSpeech,
  isLoading,
  activeTab,
  onAudioAnalysis
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when not loading
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim() && !isLoading) {
      onSendMessage(currentInput);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const toggleVoiceInput = () => {
    setShowAudioRecorder(!showAudioRecorder);
  };

  const handleAudioTranscription = (transcription: string) => {
    // Set the transcribed text as input
    onInputChange(transcription);
    setShowAudioRecorder(false);
  };

  const handleAudioAnalysis = (analysis: any) => {
    // Handle audio analysis results
    if (onAudioAnalysis) {
      onAudioAnalysis(analysis);
    }
    
    // If we have a transcription, also set it as input
    if (analysis.transcription) {
      onInputChange(analysis.transcription);
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    return (
      <div
        key={message.id}
        className={cn(
          "flex w-full mb-4",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-[80%] rounded-lg px-4 py-3 shadow-sm",
            isUser 
              ? "bg-blue-600 text-white ml-12" 
              : isSystem
              ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500"
              : "bg-gray-100 text-gray-900 mr-12"
          )}
        >
          {/* Message Content */}
          <div className="text-lg">
            {isSystem || isUser ? (
              <p>{message.content}</p>
            ) : (
              <ReactMarkdown
                className="prose prose-sm max-w-none prose-gray dark:prose-invert"
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-200 text-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto mb-2">
                      {children}
                    </pre>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          {/* Message Metadata */}
          <div className="flex items-center justify-between mt-2 text-base opacity-70">
            <span>{formatTimestamp(message.timestamp)}</span>
            
            <div className="flex items-center space-x-2">
              {/* TTS Button for assistant messages */}
              {!isUser && !isSystem && onGenerateSpeech && (
                <button
                  onClick={() => onGenerateSpeech(message.content)}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded transition-colors"
                  title="Generate speech for this message"
                >
                  <Volume2Icon className="w-4 h-4" />
                </button>
              )}
              
              {message.metadata && (
                <div className="flex items-center space-x-2">
                  {message.metadata.confidence && (
                    <span className={getConfidenceColor(message.metadata.confidence)}>
                      {Math.round(message.metadata.confidence * 100)}%
                    </span>
                  )}
                  
                  {message.metadata.urgency && (
                    <span className={getUrgencyColor(message.metadata.urgency)}>
                      {message.metadata.urgency.toUpperCase()}
                    </span>
                  )}
                  
                  {message.metadata.intent && (
                    <span className="text-military-500">
                      {message.metadata.intent}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Voice Metrics (if available) */}
          {message.metadata?.voiceMetrics && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>Pitch: {message.metadata.voiceMetrics.pitch.toFixed(1)} Hz</div>
                <div>Tempo: {message.metadata.voiceMetrics.tempo.toFixed(1)} BPM</div>
                <div>Intensity: {message.metadata.voiceMetrics.intensity.toFixed(2)}</div>
                <div>Duration: {message.metadata.voiceMetrics.duration.toFixed(1)}s</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getPlaceholderText = () => {
    switch (activeTab) {
      case 'video':
        return 'Ask about the video content, objects, events, or tactical insights...';
      case 'live':
        return 'Enter command or query for live stream analysis...';
      case 'image':
        return 'Ask about objects, threats, or details in the image...';
      default:
        return 'Ask a question...';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 bg-white">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-600">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MicIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-medium mb-2 text-gray-800">TacSense AI Ready</p>
              <p className="text-lg text-gray-600">
                Upload a file or start asking questions for tactical analysis
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-gray-900 max-w-[80%] rounded-lg px-4 py-3 mr-12">
                  <div className="flex items-center space-x-2">
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                    <span className="text-lg">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-300 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholderText()}
              disabled={isLoading}
              className={cn(
                "w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-12 text-lg",
                "text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
            
            {/* Audio Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={cn(
                "absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors",
                showAudioRecorder
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
              )}
              title={showAudioRecorder ? "Hide audio recorder" : "Show audio recorder"}
            >
              <MicIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!currentInput.trim() || isLoading}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 text-lg",
              !currentInput.trim() || isLoading
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {isLoading ? (
              <LoaderIcon className="w-4 h-4 animate-spin" />
            ) : (
              <SendIcon className="w-4 h-4" />
            )}
            <span>Ask</span>
          </button>
        </form>

        {/* Audio Recorder */}
        {showAudioRecorder && (
          <div className="mt-4">
            <AudioRecorder
              onTranscriptionReceived={handleAudioTranscription}
              onAnalysisReceived={handleAudioAnalysis}
              compact={false}
            />
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => onInputChange("What are the main safety concerns in this content?")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 rounded-full text-base transition-colors"
          >
            Safety Analysis
          </button>
          <button
            onClick={() => onInputChange("Identify any tactical threats or anomalies")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 rounded-full text-base transition-colors"
          >
            Threat Assessment
          </button>
          <button
            onClick={() => onInputChange("Summarize the key operational insights")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 rounded-full text-base transition-colors"
          >
            Operational Summary
          </button>
          <button
            onClick={() => onInputChange("What recommendations do you have?")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 rounded-full text-base transition-colors"
          >
            Recommendations
          </button>
          
          {/* TTS Test Button */}
          {onGenerateSpeech && (
            <button
              onClick={() => onGenerateSpeech("Hello, this is a test of the text to speech system.")}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-full text-base transition-colors flex items-center space-x-1"
              title="Test TTS functionality"
            >
              <Volume2Icon className="w-4 h-4" />
              <span>Test TTS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 