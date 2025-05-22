// components/file-upload.tsx
"use client";

import { useState, useRef, ReactNode } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileSelected: (file: File) => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function FileUpload({
  accept = ".pdf",
  maxSize = 10, // Default 10MB
  onFileSelected,
  title = "Upload a file",
  subtitle = "Drag and drop or click to browse",
  icon = <Upload className="h-10 w-10 text-muted-foreground" />,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check file type if accept is specified
    if (
      accept &&
      !file.type.match(accept.replace(/\./g, "").replace(/,/g, "|"))
    ) {
      if (accept === ".pdf" && file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return false;
      }
      toast.error(`Please select a file of type: ${accept}`);
      return false;
    }

    // Check file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSize}MB limit`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileInputChange}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="mb-2">{icon}</div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {accept && `Accepted file types: ${accept}`} • Max size: {maxSize}MB
        </p>
      </div>
    </div>
  );
}
