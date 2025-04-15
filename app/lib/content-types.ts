// lib/content-types.ts
/**
 * Utility functions for working with content types and file extensions
 */

// Define a mapping of file extensions to MIME types
const contentTypes: Record<string, string> = {
    // Documents
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    rtf: "application/rtf",
    txt: "text/plain",
    html: "text/html",
    htm: "text/html",
    xml: "application/xml",
    odt: "application/vnd.oasis.opendocument.text",
    
    // Spreadsheets
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    
    // Presentations
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ppt: "application/vnd.ms-powerpoint",
    odp: "application/vnd.oasis.opendocument.presentation",
    
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    tiff: "image/tiff",
    tif: "image/tiff",
    bmp: "image/bmp",
    
    // Archives
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
    
    // Other common types
    json: "application/json",
    js: "application/javascript",
    css: "text/css",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    wav: "audio/wav"
  };
  
  /**
   * Get the MIME content type for a given file extension
   * 
   * @param extension File extension (without the dot)
   * @returns MIME type string or default octet-stream if not found
   */
  export function getContentType(extension: string): string {
    // Normalize extension by removing leading dot and converting to lowercase
    const normalizedExt = extension.startsWith('.')
      ? extension.substring(1).toLowerCase()
      : extension.toLowerCase();
    
    return contentTypes[normalizedExt] || "application/octet-stream";
  }
  
  /**
   * Get the file extension for a given MIME type
   * 
   * @param mimeType MIME type string
   * @returns File extension (without dot) or empty string if not found
   */
  export function getExtensionFromMimeType(mimeType: string): string {
    const normalizedMimeType = mimeType.toLowerCase();
    
    for (const [ext, mime] of Object.entries(contentTypes)) {
      if (mime === normalizedMimeType) {
        return ext;
      }
    }
    
    return "";
  }
  
  /**
   * Get the file extension from a filename
   * 
   * @param filename Filename with extension
   * @returns File extension (without dot) or empty string if not found
   */
  export function getExtensionFromFilename(filename: string): string {
    if (!filename) return "";
    
    const parts = filename.split('.');
    if (parts.length < 2) return "";
    
    return parts[parts.length - 1].toLowerCase();
  }
  
  /**
   * Check if a file is of a specific type based on its extension
   * 
   * @param filename Filename to check
   * @param types Array of file extensions to check against
   * @returns Boolean indicating if file is of one of the specified types
   */
  export function isFileType(filename: string, types: string[]): boolean {
    const extension = getExtensionFromFilename(filename);
    return types.includes(extension);
  }
  
  /**
   * Group content types by category
   */
  export const contentTypeCategories = {
    documents: ['pdf', 'docx', 'doc', 'rtf', 'txt', 'html', 'odt'],
    spreadsheets: ['xlsx', 'xls', 'csv', 'ods'],
    presentations: ['pptx', 'ppt', 'odp'],
    images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'tiff', 'tif', 'bmp']
  };
  
  /**
   * Check if a file is in a specific category
   * 
   * @param filename Filename to check
   * @param category Category name from contentTypeCategories
   * @returns Boolean indicating if file is in the specified category
   */
  export function isInCategory(
    filename: string, 
    category: keyof typeof contentTypeCategories
  ): boolean {
    const extension = getExtensionFromFilename(filename);
    return contentTypeCategories[category].includes(extension);
  }
  
  export default {
    getContentType,
    getExtensionFromMimeType,
    getExtensionFromFilename,
    isFileType,
    isInCategory,
    contentTypeCategories
  };