// components/ui/upload-progress.tsx
"use client";

import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowUp, Clock, Loader2 } from "lucide-react";
import { UploadStats } from "./upload-stats";

interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
  isProcessing?: boolean;
  processingProgress?: number;
  error?: Error | null;
  label?: string;
  // Upload stats
  uploadStats?: {
    speed: number;
    elapsedTime: number;
    remainingTime: number;
    loaded: number;
    total: number;
  };
}

export function UploadProgress({
  progress,
  isUploading,
  isProcessing = false,
  processingProgress = 0,
  error,
  label,
  uploadStats,
}: UploadProgressProps) {
  // Determine which progress to show
  const displayProgress = isUploading ? progress : processingProgress;

  // Determine which label to show
  const displayLabel =
    label ||
    (isUploading ? "Uploading..." : isProcessing ? "Processing..." : "");

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {isUploading ? (
              <ArrowUp className="h-4 w-4 animate-pulse text-blue-500" />
            ) : isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            <span>{displayLabel}</span>
          </div>
          <span className="text-sm font-medium">{displayProgress}%</span>
        </div>

        <Progress value={displayProgress} className="h-2" />

        {/* Add upload statistics if available */}
        {uploadStats && isUploading && (
          <UploadStats
            isUploading={isUploading}
            speed={uploadStats.speed}
            elapsedTime={uploadStats.elapsedTime}
            remainingTime={uploadStats.remainingTime}
            bytesLoaded={uploadStats.loaded}
            bytesTotal={uploadStats.total}
          />
        )}
      </div>
    </div>
  );
}
