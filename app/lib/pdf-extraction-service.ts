// lib/pdf-extraction-service.ts
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PDFDocument } from 'pdf-lib';
import path from 'path';

const execPromise = promisify(exec);

/**
 * Service for extracting text and information from PDF files
 */
export class PDFExtractionService {
  /**
   * Extract text from a PDF file using multiple methods, with fallbacks
   * 
   * @param pdfPath - Path to the PDF file
   * @returns Extracted text content
   */
  static async extractText(pdfPath: string): Promise<string> {
    try {
      // First, check if pdftotext is available
      let pdftotextAvailable = false;
      try {
        await execPromise('which pdftotext || where pdftotext 2>/dev/null');
        pdftotextAvailable = true;
      } catch (err) {
        console.log('pdftotext not available on this system, skipping this extraction method');
      }
      
      // Try multiple extraction methods in order of preference
      
      // 1. Try pdftotext (most reliable for text extraction if available)
      if (pdftotextAvailable) {
        try {
          console.log('Attempting text extraction with pdftotext...');
          const tempOutputPath = `${pdfPath}.txt`;
          await execPromise(`pdftotext -layout "${pdfPath}" "${tempOutputPath}"`);
          
          if (existsSync(tempOutputPath)) {
            const text = await readFile(tempOutputPath, 'utf-8');
            // Clean up temp file
            try {
              await execPromise(`rm "${tempOutputPath}"`).catch(() => {
                // On Windows, use del instead of rm
                return execPromise(`del "${tempOutputPath}"`);
              });
            } catch (cleanupError) {
              console.warn('Failed to clean up temp file:', cleanupError);
            }
            
            if (text.trim().length > 0) {
              console.log('Successfully extracted text with pdftotext');
              return text;
            }
            console.log('pdftotext output was empty, trying next method');
          }
        } catch (pdftotextError) {
          console.warn('pdftotext extraction failed:', pdftotextError);
        }
      }
      
      // 2. Directly attempt PDF-lib text extraction
      // Unfortunately, pdf-lib doesn't support text extraction directly
      console.log('Using pdf-lib for basic PDF information');
      const pdfBytes = await readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();
      
      // Get basic PDF info
      const filename = path.basename(pdfPath);
      const size = (pdfBytes.length / (1024 * 1024)).toFixed(2);
      
      return `[PDF Content Extraction Limited]\n\nDocument Information:\n- Filename: ${filename}\n- Pages: ${pageCount}\n- Size: ${size} MB\n\nThe text content could not be fully extracted from this PDF using available methods. The document may be scanned, contain only images, or have security restrictions.`;
    } catch (error) {
      console.error('All PDF extraction methods failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract metadata from a PDF file
   * 
   * @param pdfPath - Path to the PDF file
   * @returns PDF metadata object
   */
  static async extractMetadata(pdfPath: string): Promise<Record<string, any>> {
    try {
      const pdfBytes = await readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Get basic metadata
      const metadata = {
        pageCount: pdfDoc.getPageCount(),
        creator: pdfDoc.getCreator(),
        producer: pdfDoc.getProducer(),
        title: pdfDoc.getTitle(),
        author: pdfDoc.getAuthor(),
        subject: pdfDoc.getSubject(),
        keywords: pdfDoc.getKeywords(),
        creationDate: pdfDoc.getCreationDate(),
        modificationDate: pdfDoc.getModificationDate(),
        fileSize: pdfBytes.length,
      };
      
      return metadata;
    } catch (error) {
      console.error('Metadata extraction failed:', error);
      throw new Error(`Failed to extract PDF metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Determine if the PDF is scannable (OCR would be beneficial)
   * 
   * @param pdfPath - Path to the PDF file 
   * @returns Boolean indicating if OCR would help
   */
  static async isScanneableDocument(pdfPath: string): Promise<boolean> {
    try {
      // Try to extract text with pdftotext
      try {
        const tempOutputPath = `${pdfPath}.txt`;
        await execPromise(`pdftotext "${pdfPath}" "${tempOutputPath}"`);
        
        if (existsSync(tempOutputPath)) {
          const text = await readFile(tempOutputPath, 'utf-8');
          // Clean up temp file
          try {
            await execPromise(`rm "${tempOutputPath}"`);
          } catch (err) {}
          
          // If text is very short compared to the PDF size, it might be a scanned document
          const pdfBytes = await readFile(pdfPath);
          const textLengthRatio = text.length / pdfBytes.length;
          
          return textLengthRatio < 0.01; // Threshold can be adjusted
        }
      } catch (err) {}
      
      // If pdftotext failed, we assume it might need OCR
      return true;
    } catch (error) {
      console.error('Scan check failed:', error);
      return true; // Default to true if we couldn't determine
    }
  }
}

export default PDFExtractionService;