"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileIcon,
  Cross2Icon,
  CheckCircledIcon,
  UploadIcon,
  DownloadIcon,
  TrashIcon,
  MoveIcon,
} from "@radix-ui/react-icons";
import { AlertCircle, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/src/store/store";
import { UploadProgress } from "@/components/ui/upload-progress";
import useFileUpload from "@/hooks/useFileUpload";

// Interface for file with order
interface FileWithOrder {
  file: File;
  id: string;
  preview?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: Error | null;
}

export function PdfMerger() {
  const { t } = useLanguageStore();
  const [files, setFiles] = useState<FileWithOrder[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedFileUrl, setMergedFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  // Use our custom upload hook
  const {
    isUploading,
    progress: uploadProgress,
    error: uploadError,
    uploadFile,
    resetUpload,
    uploadStats,
  } = useFileUpload();

  // Generate a unique ID
  const generateId = () =>
    `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Set up dropzone for PDF files only
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB per file
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.file.size > 100 * 1024 * 1024) {
          setError(
            "One or more files are too large. Maximum size is 100MB per file."
          );
        } else {
          setError("Please upload valid PDF files only.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        // Clear any previous errors
        setError(null);
        resetUpload();
        // Add new files to the list, avoid duplicates
        setFiles((prev) => {
          const existingFileNames = new Set(prev.map((f) => f.file.name));
          const newFiles = acceptedFiles
            .filter((file) => !existingFileNames.has(file.name))
            .map((file) => ({
              file,
              id: generateId(),
              // Create preview URL for PDF files
              preview: URL.createObjectURL(file),
              isUploading: false,
              uploadProgress: 0,
              error: null,
            }));

          return [...prev, ...newFiles];
        });
      }
    },
    multiple: true,
  });

  // Clean up previews when component unmounts
  const cleanUpPreviews = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
  }, [files]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (isProcessing || isUploading) return;
    setDragId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId || isProcessing || isUploading) return;

    const newFiles = [...files];
    const draggedIndex = newFiles.findIndex((f) => f.id === dragId);
    const targetIndex = newFiles.findIndex((f) => f.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(targetIndex, 0, draggedItem);

    setFiles(newFiles);
    setDragId(null);
  };

  // Move file up in the list
  const moveFileUp = (index: number) => {
    if (index <= 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [
      newFiles[index],
      newFiles[index - 1],
    ];
    setFiles(newFiles);
  };

  // Move file down in the list
  const moveFileDown = (index: number) => {
    if (index >= files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + 1]] = [
      newFiles[index + 1],
      newFiles[index],
    ];
    setFiles(newFiles);
  };

  // Handle file removal
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  // Format file size for display
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // Process merging PDFs
  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please upload at least two PDF files to merge");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setMergedFileUrl(null);

    const formData = new FormData();

    // Append files in the correct order
    files.forEach((fileObj) => {
      formData.append("files", fileObj.file);
    });

    // Add the order of files as a separate field
    formData.append("order", JSON.stringify(files.map((_, index) => index)));

    // Use our custom upload hook
    uploadFile(files[0].file, formData, {
      url: "/api/merge",
      onProgress: (progress) => {
        // Update UI with upload progress
        setProgress(progress / 2); // First half is upload, second half is processing
      },
      onSuccess: (data) => {
        // Start processing progress simulation
        let processingProgress = 50; // Start at 50% (upload complete)
        const processingInterval = setInterval(() => {
          processingProgress += 2;
          setProgress(Math.min(processingProgress, 95));

          if (processingProgress >= 95) {
            clearInterval(processingInterval);
          }
        }, 200);

        // Complete the process
        setTimeout(() => {
          clearInterval(processingInterval);
          setProgress(100);
          setMergedFileUrl(data.filename);
          setIsProcessing(false);

          toast.success(t("mergePdf.ui.successMessage") || "Merge Successful");
        }, 1000); // Simulate some processing time
      },
      onError: (err) => {
        setProgress(0);
        setError(err.message || "An unknown error occurred");
        setIsProcessing(false);
        toast.error("Merge Failed");
      },
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{t("mergePdf.title") || "Merge PDF Files"}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* File Drop Zone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/10"
              : files.length > 0
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            (isProcessing || isUploading) && "pointer-events-none opacity-80"
          )}
        >
          <input {...getInputProps()} disabled={isProcessing || isUploading} />

          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <UploadIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-lg font-medium">
              {isDragActive
                ? t("fileUploader.dropHere") || "Drop your PDF files here"
                : t("fileUploader.dragAndDrop") || "Drag & drop your PDF files"}
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t("fileUploader.dropHereDesc") ||
                "Drop your PDF files here or click to browse."}{" "}
              {t("fileUploader.maxSize") || "Maximum size is 100MB per file."}
            </p>

            <Button type="button" variant="default" size="sm" className="mt-2">
              {t("fileUploader.browse") || "Browse Files"}
            </Button>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="border rounded-lg">
            <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
              <h3 className="font-medium">
                {t("mergePdf.ui.filesToMerge") || "Files to Merge"} (
                {files.length})
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                >
                  <MoveIcon className="h-3 w-3 mr-1" />{" "}
                  {t("mergePdf.ui.dragToReorder") || "Drag to reorder"}
                </Badge>
                {!isProcessing && !isUploading && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      cleanUpPreviews();
                      setFiles([]);
                    }}
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />{" "}
                    {t("ui.clearAll") || "Clear All"}
                  </Button>
                )}
              </div>
            </div>

            <div className="divide-y overflow-y-auto max-h-[400px]">
              {files.map((fileObj, index) => (
                <div
                  key={fileObj.id}
                  draggable={!isProcessing && !isUploading}
                  onDragStart={(e) => handleDragStart(e, fileObj.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, fileObj.id)}
                  className={cn(
                    "p-3 flex items-center justify-between gap-4 hover:bg-muted/30",
                    dragId === fileObj.id && "opacity-50 bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-center p-1 rounded hover:bg-muted cursor-move">
                    <MoveIcon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="h-9 w-9 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {fileObj.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileObj.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveFileUp(index)}
                      disabled={index === 0 || isProcessing || isUploading}
                      className="h-8 w-8"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveFileDown(index)}
                      disabled={
                        index === files.length - 1 ||
                        isProcessing ||
                        isUploading
                      }
                      className="h-8 w-8"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFile(fileObj.id)}
                      disabled={isProcessing || isUploading}
                    >
                      <Cross2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload/Processing Progress Indicator */}
        {(isUploading || isProcessing) && (
          <UploadProgress
            progress={progress}
            isUploading={isUploading}
            isProcessing={isProcessing}
            processingProgress={progress}
            error={uploadError}
            label={
              isUploading
                ? t("watermarkPdf.uploading")
                : t("splitPdf.splitting")
            }
            uploadStats={uploadStats}
          />
        )}

        {/* Results */}
        {mergedFileUrl && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircledIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-600 dark:text-green-400">
                  {t("mergePdf.ui.successMessage") ||
                    "PDFs successfully merged!"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  {t("mergePdf.ui.downloadReady") ||
                    "Your merged PDF file is now ready for download."}
                </p>
                <Button className="w-full sm:w-auto" asChild variant="default">
                  <a
                    href={`/api/file?folder=merges&filename=${encodeURIComponent(
                      mergedFileUrl
                    )}`}
                    download
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    {t("mergePdf.ui.downloadMerged") || "Download Merged PDF"}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between flex-col sm:flex-row gap-2">
        {files.length > 0 &&
          !isProcessing &&
          !isUploading &&
          !mergedFileUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                cleanUpPreviews();
                setFiles([]);
              }}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {t("ui.clear") || "Clear All"}
            </Button>
          )}

        <Button
          className={cn(
            "sm:ml-auto",
            files.length === 0 && !mergedFileUrl && "w-full"
          )}
          onClick={handleMerge}
          disabled={files.length < 2 || isProcessing || isUploading}
        >
          {isProcessing || isUploading
            ? t("ui.processing") || "Merging..."
            : t("mergePdf.ui.mergePdfs") || "Merge PDFs"}
        </Button>
      </CardFooter>
    </Card>
  );
}
