'use client';

import { 
  WifiIcon, 
  ServerIcon, 
  UsersIcon, 
  ClockIcon,
  ActivityIcon,
  FileIcon,
  LoaderIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';

import { FileUpload, ProcessingStatus } from '@/types';
import { cn, formatFileSize } from '@/lib/utils';

interface StatusBarProps {
  systemStatus: 'operational' | 'degraded' | 'offline';
  uploadedFile: FileUpload | null;
  processingStatus: ProcessingStatus | null;
  activeConnections: number;
}

export default function StatusBar({ 
  systemStatus, 
  uploadedFile, 
  processingStatus, 
  activeConnections 
}: StatusBarProps) {
  const getSystemStatusColor = (status: typeof systemStatus) => {
    switch (status) {
      case 'operational':
        return 'text-success-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'offline':
        return 'text-danger-400';
      default:
        return 'text-military-400';
    }
  };

  const getSystemStatusText = (status: typeof systemStatus) => {
    switch (status) {
      case 'operational':
        return 'All Systems Operational';
      case 'degraded':
        return 'Performance Degraded';
      case 'offline':
        return 'Systems Offline';
      default:
        return 'Unknown Status';
    }
  };

  const getProcessingStatusIcon = (status: ProcessingStatus['stage']) => {
    switch (status) {
      case 'uploading':
      case 'analyzing':
      case 'generating':
        return LoaderIcon;
      case 'completed':
        return CheckCircleIcon;
      case 'error':
        return AlertCircleIcon;
      default:
        return FileIcon;
    }
  };

  const getProcessingStatusColor = (status: ProcessingStatus['stage']) => {
    switch (status) {
      case 'uploading':
      case 'analyzing':
      case 'generating':
        return 'text-yellow-400';
      case 'completed':
        return 'text-success-400';
      case 'error':
        return 'text-danger-400';
      default:
        return 'text-military-400';
    }
  };

  return (
    <div className="bg-military-800 border-t border-military-600 px-6 py-2">
      <div className="flex items-center justify-between text-sm">
        {/* Left side - System Status */}
        <div className="flex items-center space-x-6">
          {/* System Status */}
          <div className="flex items-center space-x-2">
            <div className={cn("w-2 h-2 rounded-full", {
              "bg-success-500": systemStatus === 'operational',
              "bg-yellow-500": systemStatus === 'degraded',
              "bg-danger-500": systemStatus === 'offline',
            })} />
            <span className={getSystemStatusColor(systemStatus)}>
              {getSystemStatusText(systemStatus)}
            </span>
          </div>

          {/* Active Connections */}
          <div className="flex items-center space-x-2 text-military-300">
            <UsersIcon className="w-4 h-4" />
            <span>{activeConnections} Connection{activeConnections !== 1 ? 's' : ''}</span>
          </div>

          {/* Server Status */}
          <div className="flex items-center space-x-2 text-military-300">
            <ServerIcon className="w-4 h-4" />
            <span>Backend Online</span>
          </div>
        </div>

        {/* Center - File/Processing Status */}
        <div className="flex items-center space-x-4">
          {uploadedFile && (
            <div className="flex items-center space-x-2 text-military-300">
              <FileIcon className="w-4 h-4" />
              <span className="truncate max-w-32">{uploadedFile.name}</span>
              <span className="text-xs">({formatFileSize(uploadedFile.size)})</span>
            </div>
          )}

          {processingStatus && (
            <div className="flex items-center space-x-2">
              {(() => {
                const StatusIcon = getProcessingStatusIcon(processingStatus.stage);
                const statusColor = getProcessingStatusColor(processingStatus.stage);
                
                return (
                  <>
                    <StatusIcon className={cn("w-4 h-4", statusColor, {
                      "animate-spin": ['uploading', 'analyzing', 'generating'].includes(processingStatus.stage)
                    })} />
                    <span className={statusColor}>
                      {processingStatus.message}
                    </span>
                    {processingStatus.stage !== 'error' && processingStatus.stage !== 'completed' && (
                      <span className="text-xs text-military-400">
                        ({processingStatus.progress}%)
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right side - System Info */}
        <div className="flex items-center space-x-6">
          {/* Current Time */}
          <div className="flex items-center space-x-2 text-military-300">
            <ClockIcon className="w-4 h-4" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>

          {/* Performance Monitor */}
          <div className="flex items-center space-x-2 text-military-300">
            <ActivityIcon className="w-4 h-4" />
            <span>CPU: 12%</span>
          </div>

          {/* Network Status */}
          <div className="flex items-center space-x-2 text-success-400">
            <WifiIcon className="w-4 h-4" />
            <span>Online</span>
          </div>
        </div>
      </div>

      {/* Processing Progress Bar */}
      {processingStatus && processingStatus.stage !== 'completed' && processingStatus.stage !== 'error' && (
        <div className="mt-2">
          <div className="w-full bg-military-700 rounded-full h-1">
            <div 
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                processingStatus.stage === 'uploading' && "bg-tactical-500",
                processingStatus.stage === 'analyzing' && "bg-yellow-500",
                processingStatus.stage === 'generating' && "bg-success-500"
              )}
              style={{ width: `${processingStatus.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 