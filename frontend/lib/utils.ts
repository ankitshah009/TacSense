import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileType(fileName: string): 'video' | 'image' | 'audio' | 'document' | 'other' {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) return 'other';
  
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'ppt', 'pptx'];
  
  if (videoExtensions.includes(extension)) return 'video';
  if (imageExtensions.includes(extension)) return 'image';
  if (audioExtensions.includes(extension)) return 'audio';
  if (documentExtensions.includes(extension)) return 'document';
  
  return 'other';
}

export function isValidFileType(fileName: string, allowedTypes: string[]): boolean {
  const fileType = getFileType(fileName);
  return allowedTypes.includes(fileType);
}

// Date and time utilities
export function formatTimestamp(date: Date): string {
  return format(date, 'MMM dd, yyyy HH:mm:ss');
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// String utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  return words.filter(word => word.length > 3 && !stopWords.includes(word));
}

// URL utilities
export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Color utilities for status indicators
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'connected':
    case 'success':
    case 'completed':
      return 'bg-success-500';
    case 'warning':
    case 'moderate':
    case 'processing':
      return 'bg-yellow-500';
    case 'danger':
    case 'error':
    case 'failed':
    case 'high':
    case 'critical':
      return 'bg-danger-500';
    case 'inactive':
    case 'disconnected':
    case 'low':
      return 'bg-military-500';
    default:
      return 'bg-military-400';
  }
}

export function getUrgencyColor(urgency: 'low' | 'medium' | 'high'): string {
  switch (urgency) {
    case 'low':
      return 'text-success-400';
    case 'medium':
      return 'text-yellow-400';
    case 'high':
      return 'text-danger-400';
    default:
      return 'text-military-400';
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-success-400';
  if (confidence >= 0.6) return 'text-yellow-400';
  return 'text-danger-400';
}

// Audio utilities
export function formatAudioTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function normalizeAudioLevel(level: number): number {
  return Math.max(0, Math.min(100, level));
}

// ID generation
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Performance utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Local storage utilities
export function saveToLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Military/Tactical utilities
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
}

export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getMilitaryTimeFormat(date: Date): string {
  return format(date, 'HHmm');
}

export function getZuluTime(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
} 