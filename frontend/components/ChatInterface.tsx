'use client';

import { useEffect, useRef, useState } from 'react';
import { SendIcon, MicIcon, LoaderIcon, PlayIcon, VolumeXIcon, Volume2Icon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Message, TabType } from '@/types';
import { formatTimestamp, cn, getUrgencyColor, getConfidenceColor } from '@/lib/utils';

interface ChatInterfaceProps {
  messages: Message[];
  currentInput: string;
  onInputChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  onGenerateSpeech?: (text: string) => void;
  isLoading: boolean;
  activeTab: TabType;
}

export default function ChatInterface({
  messages,
  currentInput,
  onInputChange,
  onSendMessage,
  onGenerateSpeech,
  isLoading,
  activeTab
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

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
    setIsVoiceActive(!isVoiceActive);
    // TODO: Implement voice recognition
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
              ? "bg-tactical-600 text-white ml-12" 
              : isSystem
              ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500"
              : "bg-military-200 text-military-900 mr-12"
          )}
        >
          {/* Message Content */}
          <div className="text-base">
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
                    <code className="bg-military-700 text-tactical-300 px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-military-700 text-tactical-300 p-3 rounded-lg text-xs font-mono overflow-x-auto mb-2">
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
          <div className="flex items-center justify-between mt-2 text-sm opacity-70">
            <span>{formatTimestamp(message.timestamp)}</span>
            
            <div className="flex items-center space-x-2">
              {/* TTS Button for assistant messages */}
              {!isUser && !isSystem && onGenerateSpeech && (
                <button
                  onClick={() => onGenerateSpeech(message.content)}
                  className="p-1 text-military-400 hover:text-tactical-400 hover:bg-military-700 rounded transition-colors"
                  title="Generate speech for this message"
                >
                  <Volume2Icon className="w-3 h-3" />
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
            <div className="mt-2 p-2 bg-military-100 rounded text-xs">
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
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-military-400">
              <div className="w-16 h-16 bg-military-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MicIcon className="w-8 h-8" />
              </div>
              <p className="text-xl font-medium mb-2">TacSense AI Ready</p>
              <p className="text-base">
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
                <div className="bg-military-200 text-military-900 max-w-[80%] rounded-lg px-4 py-3 mr-12">
                  <div className="flex items-center space-x-2">
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-military-600 p-4 bg-military-800">
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
                "w-full bg-military-700 border border-military-600 rounded-lg px-4 py-3 pr-12",
                "text-white placeholder-military-400 focus:outline-none focus:border-tactical-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
            
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={cn(
                "absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors",
                isVoiceActive
                  ? "bg-danger-600 text-white"
                  : "text-military-400 hover:text-tactical-400 hover:bg-military-600"
              )}
              title={isVoiceActive ? "Stop voice input" : "Start voice input"}
            >
              {isVoiceActive ? <VolumeXIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!currentInput.trim() || isLoading}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2",
              !currentInput.trim() || isLoading
                ? "bg-military-700 text-military-500 cursor-not-allowed"
                : "bg-tactical-600 hover:bg-tactical-700 text-white"
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
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => onInputChange("What are the main safety concerns in this content?")}
            className="px-4 py-2 bg-military-700 hover:bg-military-600 text-military-300 hover:text-white rounded-full text-sm transition-colors"
          >
            Safety Analysis
          </button>
          <button
            onClick={() => onInputChange("Identify any tactical threats or anomalies")}
            className="px-4 py-2 bg-military-700 hover:bg-military-600 text-military-300 hover:text-white rounded-full text-sm transition-colors"
          >
            Threat Assessment
          </button>
          <button
            onClick={() => onInputChange("Summarize the key operational insights")}
            className="px-4 py-2 bg-military-700 hover:bg-military-600 text-military-300 hover:text-white rounded-full text-sm transition-colors"
          >
            Operational Summary
          </button>
          <button
            onClick={() => onInputChange("What recommendations do you have?")}
            className="px-4 py-2 bg-military-700 hover:bg-military-600 text-military-300 hover:text-white rounded-full text-sm transition-colors"
          >
            Recommendations
          </button>
          
          {/* TTS Test Button */}
          {onGenerateSpeech && (
            <button
              onClick={() => onGenerateSpeech("Hello, this is a test of the text to speech system.")}
              className="px-4 py-2 bg-tactical-700 hover:bg-tactical-600 text-white rounded-full text-sm transition-colors flex items-center space-x-1"
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