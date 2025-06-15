'use client';

import React from 'react';
import { 
  PlayIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  InfoIcon,
  TrendingUpIcon,
  UsersIcon,
  ShieldIcon,
  ClockIcon,
  BrainIcon,
  TargetIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoAnalysisResultsProps {
  analysisData: any;
  fileName: string;
}

interface AnalysisInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  priority: string;
  timestamp: number;
}

interface ThreatAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  confidence: number;
  timestamp: number;
  recommended_actions: string[];
}

export default function VideoAnalysisResults({ analysisData, fileName }: VideoAnalysisResultsProps) {
  if (!analysisData) {
    return (
      <div className="p-4 bg-military-800 rounded-lg border border-military-600">
        <p className="text-military-300">No analysis data available</p>
      </div>
    );
  }

  const {
    executive_summary,
    overall_confidence,
    total_frames_analyzed,
    analysis_duration,
    processing_method,
    insights = [],
    threats = [],
    recommendations = [],
    detailed_analysis
  } = analysisData;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success-400';
    if (confidence >= 0.6) return 'text-warning-400';
    return 'text-danger-400';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-danger-400 bg-danger-900/20 border-danger-500';
      case 'high': return 'text-warning-400 bg-warning-900/20 border-warning-500';
      case 'medium': return 'text-tactical-400 bg-tactical-900/20 border-tactical-500';
      case 'low': return 'text-success-400 bg-success-900/20 border-success-500';
      default: return 'text-military-300 bg-military-700/20 border-military-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return <AlertTriangleIcon className="w-4 h-4 text-danger-400" />;
      case 'medium':
        return <InfoIcon className="w-4 h-4 text-warning-400" />;
      case 'low':
        return <CheckCircleIcon className="w-4 h-4 text-success-400" />;
      default:
        return <InfoIcon className="w-4 h-4 text-military-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'tactical':
        return <TargetIcon className="w-4 h-4 text-tactical-400" />;
      case 'operational':
        return <TrendingUpIcon className="w-4 h-4 text-success-400" />;
      case 'safety':
        return <ShieldIcon className="w-4 h-4 text-warning-400" />;
      case 'personnel':
        return <UsersIcon className="w-4 h-4 text-tactical-400" />;
      default:
        return <BrainIcon className="w-4 h-4 text-military-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-military-800 rounded-lg border border-military-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <PlayIcon className="w-5 h-5 text-tactical-400" />
            <span>Video Analysis Results</span>
          </h3>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-military-300">Powered by</span>
            <span className="px-2 py-1 bg-tactical-600 text-white rounded text-xs font-medium">
              {processing_method === 'gemini-2.5-pro' ? 'Gemini 2.5-pro' : 'TacSense AI'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-military-700 rounded p-3">
            <div className="text-xs text-military-400 mb-1">Confidence</div>
            <div className={cn("text-lg font-semibold", getConfidenceColor(overall_confidence || 0))}>
              {Math.round((overall_confidence || 0) * 100)}%
            </div>
          </div>
          <div className="bg-military-700 rounded p-3">
            <div className="text-xs text-military-400 mb-1">Frames</div>
            <div className="text-lg font-semibold text-white">{total_frames_analyzed || 0}</div>
          </div>
          <div className="bg-military-700 rounded p-3">
            <div className="text-xs text-military-400 mb-1">Duration</div>
            <div className="text-lg font-semibold text-white">{analysis_duration || 'N/A'}</div>
          </div>
          <div className="bg-military-700 rounded p-3">
            <div className="text-xs text-military-400 mb-1">Insights</div>
            <div className="text-lg font-semibold text-tactical-400">{insights.length}</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-military-700 rounded p-4">
          <h4 className="text-sm font-medium text-military-300 mb-2 flex items-center space-x-2">
            <BrainIcon className="w-4 h-4" />
            <span>Executive Summary</span>
          </h4>
          <p className="text-white text-sm leading-relaxed">
            {executive_summary || detailed_analysis?.summary || 'Analysis completed successfully.'}
          </p>
        </div>
      </div>

      {/* Threats Section */}
      {threats.length > 0 && (
        <div className="bg-military-800 rounded-lg border border-military-600 p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangleIcon className="w-5 h-5 text-danger-400" />
            <span>Threat Assessment</span>
            <span className="px-2 py-1 bg-danger-600 text-white rounded-full text-xs">
              {threats.length}
            </span>
          </h4>
          <div className="space-y-3">
            {threats.map((threat: ThreatAlert, index: number) => (
              <div key={threat.id || index} className="bg-danger-900/20 border border-danger-500/30 rounded p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(threat.severity)}
                    <span className="font-medium text-white">{threat.title}</span>
                    <span className={cn("px-2 py-1 rounded text-xs border", getPriorityColor(threat.severity))}>
                      {threat.severity?.toUpperCase()}
                    </span>
                  </div>
                  <span className={cn("text-sm", getConfidenceColor(threat.confidence))}>
                    {Math.round(threat.confidence * 100)}%
                  </span>
                </div>
                <p className="text-military-300 text-sm mb-3">{threat.description}</p>
                {threat.recommended_actions && threat.recommended_actions.length > 0 && (
                  <div>
                    <div className="text-xs text-military-400 mb-1">Recommended Actions:</div>
                    <ul className="text-sm text-military-300 space-y-1">
                      {threat.recommended_actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start space-x-2">
                          <span className="text-tactical-400 mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="bg-military-800 rounded-lg border border-military-600 p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <TrendingUpIcon className="w-5 h-5 text-tactical-400" />
            <span>Tactical Insights</span>
            <span className="px-2 py-1 bg-tactical-600 text-white rounded-full text-xs">
              {insights.length}
            </span>
          </h4>
          <div className="grid gap-4">
            {insights.map((insight: AnalysisInsight, index: number) => (
              <div key={insight.id || index} className="bg-military-700 rounded p-4 border border-military-600">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(insight.type)}
                    <span className="font-medium text-white">{insight.title}</span>
                    <span className={cn("px-2 py-1 rounded text-xs border", getPriorityColor(insight.priority))}>
                      {insight.priority?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-3 h-3 text-military-400" />
                    <span className="text-xs text-military-400">
                      {insight.timestamp ? `${insight.timestamp.toFixed(1)}s` : 'N/A'}
                    </span>
                    <span className={cn("text-sm", getConfidenceColor(insight.confidence))}>
                      {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-military-300 text-sm">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="bg-military-800 rounded-lg border border-military-600 p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-success-400" />
            <span>Recommendations</span>
          </h4>
          <ul className="space-y-2">
            {recommendations.map((recommendation: string, index: number) => (
              <li key={index} className="flex items-start space-x-3 text-sm">
                <span className="text-success-400 mt-1">✓</span>
                <span className="text-military-300">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical Details */}
      <div className="bg-military-800 rounded-lg border border-military-600 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Technical Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-military-400">File:</span>
            <span className="text-white ml-2">{fileName}</span>
          </div>
          <div>
            <span className="text-military-400">Processing Method:</span>
            <span className="text-white ml-2">{processing_method || 'Standard'}</span>
          </div>
          <div>
            <span className="text-military-400">Analysis Type:</span>
            <span className="text-white ml-2">
              {detailed_analysis?.analysis_type || 'Comprehensive'}
            </span>
          </div>
          <div>
            <span className="text-military-400">Timestamp:</span>
            <span className="text-white ml-2">
              {analysisData.analysis_timestamp ? 
                new Date(analysisData.analysis_timestamp).toLocaleString() : 
                'N/A'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 