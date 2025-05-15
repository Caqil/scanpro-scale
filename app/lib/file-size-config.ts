// lib/file-size-config.ts
/**
 * Global file size configuration utility
 * Provides consistent file size limits and formatting across the application
 */

// Global file size limit: 50MB
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

// Format file size for display with appropriate units
export function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// Check if a file exceeds the maximum size
export function isFileTooLarge(file: File): boolean {
  return file.size > MAX_FILE_SIZE;
}

// Get error message for file too large
export function getFileTooLargeMessage(): string {
  return `File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`;
}

// Get a human-readable max file size (for display)
export function getMaxFileSizeFormatted(): string {
  return formatFileSize(MAX_FILE_SIZE);
}

// Validate a file against size limit
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  if (isFileTooLarge(file)) {
    return {
      valid: false,
      error: getFileTooLargeMessage()
    };
  }
  
  return { valid: true };
}