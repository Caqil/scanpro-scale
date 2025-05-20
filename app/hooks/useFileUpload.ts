// hooks/useFileUpload.ts
import { useState, useRef } from 'react';

interface UploadOptions {
  url: string;
  onProgress?: (progress: number) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  headers?: Record<string, string>;
}

interface UploadStats {
  speed: number;         // Upload speed in KB/s
  elapsedTime: number;   // Elapsed time in milliseconds
  remainingTime: number; // Estimated remaining time in milliseconds
  loaded: number;        // Bytes loaded
  total: number;         // Total bytes
}

/**
 * Custom hook for handling file uploads with progress tracking and speed measurement
 * This hook abstracts the XMLHttpRequest logic for better control over uploads
 */
export default function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    speed: 0,
    elapsedTime: 0,
    remainingTime: 0,
    loaded: 0,
    total: 0
  });

  // Refs to track upload timing and progress
  const startTimeRef = useRef<number>(0);
  const lastLoadedRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const speedArrayRef = useRef<number[]>([]);

  /**
   * Upload a file with progress tracking
   * @param file The file to upload
   * @param formData The form data to send (must include the file)
   * @param options Upload options including callbacks
   */
  const uploadFile = (
    file: File,
    formData: FormData,
    options: UploadOptions
  ) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    // Initialize tracking vars
    startTimeRef.current = Date.now();
    lastLoadedRef.current = 0;
    lastTimeRef.current = startTimeRef.current;
    speedArrayRef.current = [];

    // Create and configure XHR request for progress tracking
    const xhr = new XMLHttpRequest();
    
    // Set up progress tracking
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
        options.onProgress?.(percentComplete);

        // Calculate upload speed
        const currentTime = Date.now();
        const elapsedTimeSinceLastUpdate = currentTime - lastTimeRef.current;
        
        // Only update stats every 500ms to avoid too frequent updates
        if (elapsedTimeSinceLastUpdate > 500) {
          const loadedSinceLastUpdate = event.loaded - lastLoadedRef.current;
          const totalElapsedTime = currentTime - startTimeRef.current;
          
          // Calculate speed in KB/s
          const instantSpeed = (loadedSinceLastUpdate / elapsedTimeSinceLastUpdate) * 1000 / 1024;
          
          // Keep last 5 speed measurements for averaging
          speedArrayRef.current.push(instantSpeed);
          if (speedArrayRef.current.length > 5) {
            speedArrayRef.current.shift();
          }
          
          // Calculate average speed
          const avgSpeed = speedArrayRef.current.reduce((sum, speed) => sum + speed, 0) / 
                           speedArrayRef.current.length;
          
          // Calculate remaining time
          const remainingBytes = event.total - event.loaded;
          const remainingTime = avgSpeed > 0 ? (remainingBytes / 1024) / avgSpeed * 1000 : 0;
          
          setUploadStats({
            speed: avgSpeed,
            elapsedTime: totalElapsedTime,
            remainingTime: remainingTime,
            loaded: event.loaded,
            total: event.total
          });
          
          // Update references for next calculation
          lastLoadedRef.current = event.loaded;
          lastTimeRef.current = currentTime;
        }
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      const totalTime = Date.now() - startTimeRef.current;
      
      // Final stats update
      setUploadStats(prev => ({
        ...prev,
        elapsedTime: totalTime,
        remainingTime: 0,
        speed: (file.size / totalTime) * 1000 / 1024, // Average overall speed
        loaded: file.size,
        total: file.size
      }));
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setIsUploading(false);
          setProgress(100);
          options.onSuccess?.(data);
        } catch (e) {
          const parseError = new Error('Could not parse server response');
          setError(parseError);
          options.onError?.(parseError);
        }
      } else {
        let errorMessage: string;
        try {
          const response = JSON.parse(xhr.responseText);
          errorMessage = response.error || `Upload failed with status ${xhr.status}`;
        } catch (e) {
          errorMessage = `Upload failed with status ${xhr.status}`;
        }
        
        const uploadError = new Error(errorMessage);
        setError(uploadError);
        options.onError?.(uploadError);
      }
      setIsUploading(false);
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      const networkError = new Error('Network error occurred during upload');
      setError(networkError);
      setIsUploading(false);
      options.onError?.(networkError);
    });

    // Handle abortion
    xhr.addEventListener('abort', () => {
      const abortError = new Error('Upload was aborted');
      setError(abortError);
      setIsUploading(false);
      options.onError?.(abortError);
    });

    // Open and send the request
    xhr.open('POST', options.url);
    
    // Set custom headers if provided
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.send(formData);
  };

  /**
   * Reset the upload state
   */
  const resetUpload = () => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setUploadStats({
      speed: 0,
      elapsedTime: 0,
      remainingTime: 0,
      loaded: 0,
      total: 0
    });
  };

  // Format time for display (convert ms to readable time)
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes}m ${remainingSecs}s`;
  };
  
  // Format file size (bytes to KB/MB)
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return {
    isUploading,
    progress,
    error,
    uploadFile,
    resetUpload,
    uploadStats,
    formatTime,
    formatFileSize
  };
}