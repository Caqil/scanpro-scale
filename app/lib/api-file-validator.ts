// lib/api-file-validator.ts
/**
 * API File validation utilities
 * For server-side file validation with consistent 50MB limit
 */

import { NextRequest, NextResponse } from "next/server";
import { MAX_FILE_SIZE, formatFileSize } from "./file-size-config";

/**
 * Validates file size for API uploads
 * Returns NextResponse with error if validation fails
 */
export function validateApiFileSize(
  file: File,
  maxSize: number = MAX_FILE_SIZE
): NextResponse | null {
  if (!file) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    );
  }

  if (file.size > maxSize) {
    return NextResponse.json(
      { 
        error: `File is too large. Maximum size is ${formatFileSize(maxSize)}.`,
        details: {
          providedSize: file.size,
          maxSize: maxSize,
          providedSizeFormatted: formatFileSize(file.size),
          maxSizeFormatted: formatFileSize(maxSize),
        }
      },
      { status: 400 }
    );
  }

  return null;
}

/**
 * Extracts and validates a PDF file from FormData
 * Returns the file if valid or NextResponse with error if validation fails
 */
export async function extractAndValidatePdfFile(
  request: NextRequest,
  formFieldName: string = "file"
): Promise<{ file: File; error?: null } | { file?: null; error: NextResponse }> {
  try {
    const formData = await request.formData();
    const file = formData.get(formFieldName) as File;

    if (!file) {
      return {
        error: NextResponse.json(
          { error: "No PDF file provided" },
          { status: 400 }
        )
      };
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return {
        error: NextResponse.json(
          { error: "Only PDF files can be processed" },
          { status: 400 }
        )
      };
    }

    // Validate file size
    const sizeError = validateApiFileSize(file);
    if (sizeError) {
      return { error: sizeError };
    }

    return { file };
  } catch (error) {
    console.error("Error extracting file from form data:", error);
    return {
      error: NextResponse.json(
        { 
          error: "Failed to process uploaded file",
          details: error instanceof Error ? error.message : undefined
        },
        { status: 500 }
      )
    };
  }
}