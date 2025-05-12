"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Download, CheckCircle } from "lucide-react";

export interface OperationStats {
  bytesUploaded?: number;
  bytesTotal?: number;
  estimatedTimeRemaining?: number;
  uploadSpeed?: number;
}

export interface ProcessingIndicatorProps {
  status: "idle" | "uploading" | "processing" | "success" | "error";
  progress: number;
  label?: string;
  error?: string | null;
  stats?: OperationStats;
  successMessage?: string;
  successDescription?: string;
  resultUrl?: string;
  downloadText?: string;
  onReset?: () => void;
  resetText?: string;
}

export function ProcessingIndicator({
  status,
  progress,
  label = "Processing...",
  error = null,
  stats,
  successMessage = "Operation completed successfully!",
  successDescription = "Your file has been processed and is ready for download.",
  resultUrl,
  downloadText = "Download Result",
  onReset,
  resetText = "Process Another File",
}: ProcessingIndicatorProps) {
  // Format uploaded size and speed
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format estimated time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  if (status === "error" && error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (status === "success" && resultUrl) {
    return (
      <Alert
        variant="default"
        className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900 my-4"
      >
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-600 dark:text-green-400">
          {successMessage}
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <p>{successDescription}</p>
          <div className="flex gap-2 mt-2">
            <Button asChild>
              <a href={resultUrl} download>
                <Download className="h-4 w-4 mr-2" />
                {downloadText}
              </a>
            </Button>
            {onReset && (
              <Button variant="outline" onClick={onReset}>
                {resetText}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "uploading" || status === "processing") {
    return (
      <div className="space-y-2 my-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">
              {status === "uploading" ? "Uploading..." : label}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {progress.toFixed(0)}%
          </span>
        </div>

        <Progress value={progress} className="h-2" />

        {stats && status === "uploading" && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {stats.bytesUploaded && stats.bytesTotal
                ? `${formatSize(stats.bytesUploaded)} of ${formatSize(
                    stats.bytesTotal
                  )}`
                : ""}
            </span>
            <div className="flex gap-3">
              {stats.uploadSpeed && (
                <span>{formatSize(stats.uploadSpeed)}/s</span>
              )}
              {stats.estimatedTimeRemaining && (
                <span>
                  ~{formatTimeRemaining(stats.estimatedTimeRemaining)} remaining
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default case (idle)
  return null;
}
