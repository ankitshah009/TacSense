'use client';

import { useState } from 'react';
import { XIcon, SettingsIcon } from 'lucide-react';
import { TacSenseConfig } from '@/types';
import { cn } from '@/lib/utils';

interface ConfigPanelProps {
  config: TacSenseConfig;
  onConfigChange: (config: TacSenseConfig) => void;
  onClose: () => void;
}

export default function ConfigPanel({ config, onConfigChange, onClose }: ConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<TacSenseConfig>(config);

  const handleInputChange = (key: keyof TacSenseConfig, value: any) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const chunkSizeOptions = [
    { value: 0, label: 'No chunking' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
  ];

  return (
    <div className="p-4 bg-military-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-tactical-400" />
          <h3 className="font-medium text-white">Configuration</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-military-400 hover:text-white transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Chunk Size */}
        <div>
          <label className="block text-sm font-medium text-military-300 mb-2">
            CHUNK SIZE
          </label>
          <select
            value={localConfig.chunkSize}
            onChange={(e) => handleInputChange('chunkSize', parseInt(e.target.value))}
            className="w-full bg-military-700 border border-military-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-tactical-500"
          >
            {chunkSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt */}
        <div>
          <label className="block text-sm font-medium text-military-300 mb-2">
            PROMPT (OPTIONAL)
          </label>
          <textarea
            value={localConfig.prompt}
            onChange={(e) => handleInputChange('prompt', e.target.value)}
            rows={4}
            className="w-full bg-military-700 border border-military-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-tactical-500"
            placeholder="Enter analysis prompt..."
          />
        </div>

        {/* Caption Summarization Prompt */}
        <div>
          <label className="block text-sm font-medium text-military-300 mb-2">
            CAPTION SUMMARIZATION PROMPT (OPTIONAL)
          </label>
          <textarea
            value={localConfig.captionSummarizationPrompt}
            onChange={(e) => handleInputChange('captionSummarizationPrompt', e.target.value)}
            rows={3}
            className="w-full bg-military-700 border border-military-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-tactical-500"
            placeholder="Enter caption summarization prompt..."
          />
        </div>

        {/* Summary Aggregation Prompt */}
        <div>
          <label className="block text-sm font-medium text-military-300 mb-2">
            SUMMARY AGGREGATION PROMPT (OPTIONAL)
          </label>
          <textarea
            value={localConfig.summaryAggregationPrompt}
            onChange={(e) => handleInputChange('summaryAggregationPrompt', e.target.value)}
            rows={3}
            className="w-full bg-military-700 border border-military-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-tactical-500"
            placeholder="Enter summary aggregation prompt..."
          />
        </div>

        {/* File Settings */}
        <div>
          <label className="block text-sm font-medium text-military-300 mb-3">
            FILE SETTINGS
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localConfig.enableChat}
                onChange={(e) => handleInputChange('enableChat', e.target.checked)}
                className="w-4 h-4 text-tactical-600 bg-military-700 border-military-600 rounded focus:ring-tactical-500 focus:ring-2"
              />
              <span className="text-sm text-military-300">Enable Chat for the file</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localConfig.enableChatHistory}
                onChange={(e) => handleInputChange('enableChatHistory', e.target.checked)}
                className="w-4 h-4 text-tactical-600 bg-military-700 border-military-600 rounded focus:ring-tactical-500 focus:ring-2"
              />
              <span className="text-sm text-military-300">Enable chat history</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localConfig.enableVoiceAnalysis}
                onChange={(e) => handleInputChange('enableVoiceAnalysis', e.target.checked)}
                className="w-4 h-4 text-tactical-600 bg-military-700 border-military-600 rounded focus:ring-tactical-500 focus:ring-2"
              />
              <span className="text-sm text-military-300">Enable voice analysis</span>
            </label>
          </div>
        </div>

        {/* AI Model Settings */}
        <div>
          <label className="block text-sm font-medium text-military-300 mb-2">
            AI MODEL
          </label>
          <select
            value={localConfig.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            className="w-full bg-military-700 border border-military-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-tactical-500"
          >
            <option value="Pi-3.1">Pi-3.1 (Recommended)</option>
            <option value="Pi-3.0">Pi-3.0</option>
            <option value="Pi-2.0">Pi-2.0</option>
          </select>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-military-300 mb-2">
            TEMPERATURE: {localConfig.temperature.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={localConfig.temperature}
            onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
            className="w-full h-2 bg-military-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-military-400 mt-1">
            <span>Focused</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div>
          <label className="block text-sm font-medium text-military-300 mb-2">
            MAX TOKENS
          </label>
          <input
            type="number"
            value={localConfig.maxTokens}
            onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
            min="100"
            max="4000"
            step="100"
            className="w-full bg-military-700 border border-military-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-tactical-500"
          />
        </div>

        {/* Reset to Defaults */}
        <div className="pt-4 border-t border-military-600">
          <button
            onClick={() => {
              const defaultConfig: TacSenseConfig = {
                chunkSize: 0,
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
              setLocalConfig(defaultConfig);
              onConfigChange(defaultConfig);
            }}
            className="w-full bg-military-700 hover:bg-military-600 text-military-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
} 