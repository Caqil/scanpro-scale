// components/ui/upload-stats.tsx
"use client";

import { ArrowUp, Clock, Timer } from "lucide-react";
import { useEffect, useState } from "react";

interface UploadStatsProps {
  isUploading: boolean;
  speed: number;
  elapsedTime: number;
  remainingTime: number;
  bytesLoaded: number;
  bytesTotal: number;
}

export function UploadStats({
  isUploading,
  speed,
  elapsedTime,
  remainingTime,
  bytesLoaded,
  bytesTotal,
}: UploadStatsProps) {
  const [animate, setAnimate] = useState(false);

  // Create animation effect for speed indicator
  useEffect(() => {
    if (isUploading && speed > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [speed, isUploading]);

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

  // Format speed
  const formatSpeed = (kbps: number): string => {
    if (kbps < 1000) return `${kbps.toFixed(1)} KB/s`;
    return `${(kbps / 1024).toFixed(1)} MB/s`;
  };

  // Determine speed indicator class
  const getSpeedClass = (speed: number): string => {
    if (speed < 100) return "text-red-500";
    if (speed < 500) return "text-yellow-500";
    return "text-green-500";
  };

  if (!isUploading || bytesTotal === 0) return null;

  const percentComplete = Math.round((bytesLoaded / bytesTotal) * 100);
  const speedClass = getSpeedClass(speed);

  return (
    <div className="text-xs text-muted-foreground mt-2 space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <ArrowUp
            className={`h-3 w-3 ${speedClass} ${
              animate ? "animate-pulse" : ""
            }`}
          />
          <span className={speedClass}>{formatSpeed(speed)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Timer className="h-3 w-3" />
          <span>Elapsed: {formatTime(elapsedTime)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Remaining: {formatTime(remainingTime)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>
          {formatFileSize(bytesLoaded)} / {formatFileSize(bytesTotal)}
        </span>
        <span>{percentComplete}% complete</span>
      </div>
    </div>
  );
}
