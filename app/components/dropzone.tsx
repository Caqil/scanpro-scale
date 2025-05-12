"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileIcon,
  FileText,
  AlertCircle,
  X as XIcon,
} from "lucide-react";

export interface FileDropzoneProps {
  className?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  acceptedFileTypes?: Record<string, string[]>;
  disabled?: boolean;
  maxFiles?: number;
  onFileAccepted: (files: File[]) => void;
  value?: File | File[] | null;
  onRemove?: () => void;
  renderFilePreview?: (file: File) => React.ReactNode;
  description?: string;
  title?: string;
  browseButtonText?: string;
  browseButtonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
  securityText?: string;
}

export function FileDropzone({
  className,
  multiple = false,
  maxSize = 100 * 1024 * 1024, // Default 100MB
  acceptedFileTypes = { "application/pdf": [".pdf"] },
  disabled = false,
  maxFiles = 1,
  onFileAccepted,
  value,
  onRemove,
  renderFilePreview,
  description = "Drop your files here or click to browse.",
  title = "Upload Files",
  browseButtonText = "Browse Files",
  browseButtonVariant = "default",
  securityText = "Your files are processed securely. All uploads are automatically deleted after processing.",
}: FileDropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.file.size > maxSize) {
          setError(
            `File is too large. Maximum size is ${formatFileSize(maxSize)}.`
          );
          toast.error(`File is too large. Maximum size is ${formatFileSize(maxSize)}.`);
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Invalid file type. Please upload a supported file type.");
          toast.error("Invalid file type. Please upload a supported file type.");
        } else {
          setError("File could not be processed. Please try again.");
          toast.error("File could not be processed. Please try again.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles);
      }
    },
    [maxSize, onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxSize,
    maxFiles,
    accept: acceptedFileTypes,
    disabled,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  const renderFile = (file: File) => {
    if (renderFilePreview) {
      return renderFilePreview(file);
    }

    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {!value || (Array.isArray(value) && value.length === 0) ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer",
            isDragActive || isDragOver
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            disabled && "opacity-60 cursor-not-allowed",
            className
          )}
        >
          <input {...getInputProps()} ref={fileInputRef} disabled={disabled} />

          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">
              {isDragActive ? "Drop files here" : title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>

            <Button
              type="button"
              variant={browseButtonVariant}
              size="sm"
              className="mt-2"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              {browseButtonText}
            </Button>
            
            {securityText && (
              <p className="mt-4 text-xs text-muted-foreground">
                {securityText}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-muted/10 rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between p-4">
            {Array.isArray(value) ? (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {value.length} {value.length === 1 ? "file" : "files"} selected
                </div>
                <div className="space-y-2">
                  {value.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between">
                      {renderFile(file)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              renderFile(value)
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-7 w-7"
                onClick={onRemove}
                disabled={disabled}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive mt-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}