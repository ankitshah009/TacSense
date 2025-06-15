'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  UploadIcon, 
  VideoIcon, 
  CameraIcon, 
  FileIcon,
  TrashIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LoaderIcon
} from 'lucide-react';

import { FileUpload, ProcessingStatus } from '@/types';
import { formatFileSize, cn } from '@/lib/utils';

interface FileUploadAreaProps {
  onFileUpload: (file: File) => void;
  uploadedFile: FileUpload | null;
  onDeleteFile: () => void;
  acceptedTypes: string;
  processingStatus: ProcessingStatus | null;
}

export default function FileUploadArea({
  onFileUpload,
  uploadedFile,
  onDeleteFile,
  acceptedTypes,
  processingStatus
}: FileUploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
      'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma']
    },
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false),
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension || '')) {
      return VideoIcon;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension || '')) {
      return CameraIcon;
    } else {
      return FileIcon;
    }
  };

  const getStatusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return LoaderIcon;
      case 'completed':
        return CheckCircleIcon;
      case 'error':
        return AlertCircleIcon;
      default:
        return FileIcon;
    }
  };

  const getStatusColor = (status: FileUpload['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'text-yellow-400';
      case 'completed':
        return 'text-success-400';
      case 'error':
        return 'text-danger-400';
      default:
        return 'text-military-400';
    }
  };

  if (uploadedFile) {
    const FileIcon = getFileIcon(uploadedFile.name);
    const StatusIcon = getStatusIcon(uploadedFile.status);
    const statusColor = getStatusColor(uploadedFile.status);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-military-300">📁 {uploadedFile.type.includes('video') ? 'Video' : 'File'}</h3>
          <button
            onClick={onDeleteFile}
            className="p-1 text-military-400 hover:text-danger-400 transition-colors"
            title="Delete File"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-military-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <FileIcon className="w-8 h-8 text-tactical-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-military-300">
                {formatFileSize(uploadedFile.size)}
              </p>
              
              <div className="flex items-center space-x-2 mt-2">
                <StatusIcon className={cn("w-4 h-4", statusColor, {
                  "animate-spin": uploadedFile.status === 'uploading' || uploadedFile.status === 'processing'
                })} />
                <span className={cn("text-xs font-medium", statusColor)}>
                  {uploadedFile.status === 'uploading' && 'Uploading...'}
                  {uploadedFile.status === 'processing' && 'Processing...'}
                  {uploadedFile.status === 'completed' && 'Complete'}
                  {uploadedFile.status === 'error' && 'Error'}
                </span>
              </div>

              {uploadedFile.uploadProgress !== undefined && uploadedFile.uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="bg-military-600 rounded-full h-2">
                    <div 
                      className="bg-tactical-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadedFile.uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-military-300 mt-1">
                    {uploadedFile.uploadProgress}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {processingStatus && (
          <div className="bg-military-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <LoaderIcon className="w-4 h-4 text-yellow-400 animate-spin" />
              <span className="text-sm font-medium text-yellow-400">
                {processingStatus.stage.charAt(0).toUpperCase() + processingStatus.stage.slice(1)}
              </span>
            </div>
            
            <p className="text-xs text-military-300 mb-2">
              {processingStatus.message}
            </p>
            
            {processingStatus.stage !== 'error' && (
              <div className="bg-military-600 rounded-full h-1.5">
                <div 
                  className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${processingStatus.progress}%` }}
                />
              </div>
            )}
            
            {processingStatus.details && (
              <p className="text-xs text-danger-400 mt-2">
                {processingStatus.details}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-military-300">
        📁 {acceptedTypes.includes('video') ? 'Video' : acceptedTypes.includes('image') ? 'Image' : 'File'}
      </h3>
      
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive || dragActive
            ? "border-tactical-400 bg-tactical-900/20"
            : "border-military-600 hover:border-military-500 hover:bg-military-700/50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="mb-4">
          <div className="w-12 h-12 bg-military-700 rounded-lg mx-auto flex items-center justify-center">
            <UploadIcon className={cn(
              "w-6 h-6 transition-colors",
              isDragActive || dragActive ? "text-tactical-400" : "text-military-400"
            )} />
          </div>
        </div>
        
        <p className={cn(
          "text-military-300 mb-2 transition-colors",
          isDragActive || dragActive && "text-tactical-300"
        )}>
          {isDragActive ? 'Drop file here' : 'Drop Video Here'}
        </p>
        
        <p className="text-sm text-military-400 mb-4">- or -</p>
        
        <button className="text-tactical-400 hover:text-tactical-300 text-sm font-medium transition-colors">
          Click to Upload
        </button>
        
        <div className="mt-4 text-xs text-military-500">
          <p>Supported formats:</p>
          <p>
            {acceptedTypes.includes('video') && 'Video: MP4, AVI, MOV, WMV, FLV, WebM, MKV'}
            {acceptedTypes.includes('image') && 'Image: JPG, PNG, GIF, BMP, SVG, WebP'}
          </p>
        </div>
      </div>
    </div>
  );
} 