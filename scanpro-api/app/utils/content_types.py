from typing import Dict, List, Optional, Tuple

# Define a mapping of file extensions to MIME types
CONTENT_TYPES: Dict[str, str] = {
    # Documents
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "doc": "application/msword",
    "rtf": "application/rtf",
    "txt": "text/plain",
    "html": "text/html",
    "htm": "text/html",
    "xml": "application/xml",
    "odt": "application/vnd.oasis.opendocument.text",
    
    # Spreadsheets
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xls": "application/vnd.ms-excel",
    "csv": "text/csv",
    "ods": "application/vnd.oasis.opendocument.spreadsheet",
    
    # Presentations
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "ppt": "application/vnd.ms-powerpoint",
    "odp": "application/vnd.oasis.opendocument.presentation",
    
    # Images
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "svg": "image/svg+xml",
    "tiff": "image/tiff",
    "tif": "image/tiff",
    "bmp": "image/bmp",
    
    # Archives
    "zip": "application/zip",
    "rar": "application/x-rar-compressed",
    "tar": "application/x-tar",
    "gz": "application/gzip",
    
    # Other common types
    "json": "application/json",
    "js": "application/javascript",
    "css": "text/css",
    "mp4": "video/mp4",
    "mp3": "audio/mpeg",
    "wav": "audio/wav"
}

# Group content types by category
CONTENT_TYPE_CATEGORIES = {
    "documents": ["pdf", "docx", "doc", "rtf", "txt", "html", "odt"],
    "spreadsheets": ["xlsx", "xls", "csv", "ods"],
    "presentations": ["pptx", "ppt", "odp"],
    "images": ["jpg", "jpeg", "png", "gif", "webp", "svg", "tiff", "tif", "bmp"]
}

def get_content_type(extension: str) -> str:
    """
    Get the MIME content type for a given file extension
    
    Args:
        extension: File extension (without the dot)
        
    Returns:
        MIME type string or default octet-stream if not found
    """
    # Normalize extension by removing leading dot and converting to lowercase
    normalized_ext = extension.lstrip('.').lower()
    return CONTENT_TYPES.get(normalized_ext, "application/octet-stream")

def get_extension_from_mime_type(mime_type: str) -> str:
    """
    Get the file extension for a given MIME type
    
    Args:
        mime_type: MIME type string
        
    Returns:
        File extension (without dot) or empty string if not found
    """
    normalized_mime_type = mime_type.lower()
    
    for ext, mime in CONTENT_TYPES.items():
        if mime == normalized_mime_type:
            return ext
    
    return ""

def get_extension_from_filename(filename: str) -> str:
    """
    Get the file extension from a filename
    
    Args:
        filename: Filename with extension
        
    Returns:
        File extension (without dot) or empty string if not found
    """
    if not filename:
        return ""
    
    parts = filename.split('.')
    if len(parts) < 2:
        return ""
    
    return parts[-1].lower()

def is_file_type(filename: str, types: List[str]) -> bool:
    """
    Check if a file is of a specific type based on its extension
    
    Args:
        filename: Filename to check
        types: Array of file extensions to check against
        
    Returns:
        Boolean indicating if file is of one of the specified types
    """
    extension = get_extension_from_filename(filename)
    return extension in types

def is_in_category(filename: str, category: str) -> bool:
    """
    Check if a file is in a specific category
    
    Args:
        filename: Filename to check
        category: Category name from CONTENT_TYPE_CATEGORIES
        
    Returns:
        Boolean indicating if file is in the specified category
    """
    if category not in CONTENT_TYPE_CATEGORIES:
        return False
        
    extension = get_extension_from_filename(filename)
    return extension in CONTENT_TYPE_CATEGORIES[category]

def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename to prevent directory traversal and other issues
    
    Args:
        filename: Filename to sanitize
        
    Returns:
        Sanitized filename
    """
    # Replace characters that aren't alphanumeric, dash, underscore, or dot
    return ''.join(c for c in filename if c.isalnum() or c in '-_.')