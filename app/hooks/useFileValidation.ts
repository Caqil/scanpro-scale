"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  MAX_FILE_SIZE, 
  validateFileSize, 
  formatFileSize 
} from "@/lib/file-size-config";

interface UseFileValidationOptions {
  maxSize?: number;
  acceptedTypes?: string[];
  maxFiles?: number;
  onValidationError?: (error: string) => void;
}

interface ValidationResult {
  valid: boolean;
  errorMessage?: string;
}

/**
 * Hook for consistent file validation across the application
 * Enforces global 50MB file size limit by default
 */
export function useFileValidation({
  maxSize = MAX_FILE_SIZE,
  acceptedTypes = [".pdf", "application/pdf"],
  maxFiles = 1,
  onValidationError = (error) => toast.error(error)
}: UseFileValidationOptions = {}) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[] | FileList): ValidationResult => {
      // Clear previous errors
      setValidationError(null);

      // Convert FileList to array if needed
      const fileArray = Array.from(files);

      // Check number of files
      if (fileArray.length > maxFiles) {
        const errorMsg = `Maximum ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed.`;
        setValidationError(errorMsg);
        onValidationError(errorMsg);
        return { valid: false, errorMessage: errorMsg };
      }

      // Check file size for each file
      for (const file of fileArray) {
        const sizeValidation = validateFileSize(file);
        if (!sizeValidation.valid && sizeValidation.error) {
          setValidationError(sizeValidation.error);
          onValidationError(sizeValidation.error);
          return { valid: false, errorMessage: sizeValidation.error };
        }
      }

      // Check file type for each file
      for (const file of fileArray) {
        const fileType = file.type;
        const fileName = file.name;
        const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        
        const isValidType = acceptedTypes.some(type => 
          type === fileType || 
          type === fileExtension || 
          (type.startsWith('.') && fileExtension === type)
        );

        if (!isValidType) {
          const errorMsg = `Invalid file type: ${fileName}. Accepted types: ${acceptedTypes.join(', ')}`;
          setValidationError(errorMsg);
          onValidationError(errorMsg);
          return { valid: false, errorMessage: errorMsg };
        }
      }

      // All validations passed
      return { valid: true };
    },
    [maxSize, acceptedTypes, maxFiles, onValidationError]
  );

  // Function to handle files directly from input change event
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): File[] | null => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        return null;
      }

      const validation = validateFiles(files);
      if (!validation.valid) {
        // Reset the input value to clear the selection
        event.target.value = '';
        return null;
      }

      return Array.from(files);
    },
    [validateFiles]
  );

  return {
    validateFiles,
    handleFileInputChange,
    validationError,
    clearValidationError: () => setValidationError(null),
    maxFileSizeBytes: maxSize,
    maxFileSizeFormatted: formatFileSize(maxSize)
  };
}