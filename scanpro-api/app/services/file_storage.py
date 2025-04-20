import os
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple, BinaryIO
import uuid
import aiofiles
import aiofiles.os

from fastapi import UploadFile
from app.core.config import settings

class FileStorageService:
    """Service for managing file storage operations"""
    
    def __init__(self):
        """Initialize the file storage service with configured directories"""
        self.root_path = settings.BASE_DIR
        self.upload_dir = settings.UPLOAD_DIR
        self.conversion_dir = settings.CONVERSIONS_DIR
        self.compression_dir = settings.COMPRESSIONS_DIR
        self.merges_dir = settings.MERGES_DIR
        self.splits_dir = settings.SPLITS_DIR
        self.watermarks_dir = settings.WATERMARKS_DIR
        self.rotations_dir = settings.ROTATIONS_DIR
        self.protected_dir = settings.PROTECTED_DIR
        self.unlocked_dir = settings.UNLOCKED_DIR
        self.edited_dir = settings.EDITED_DIR
        self.pagenumbers_dir = settings.PAGENUMBERS_DIR
        self.temp_dir = settings.TEMP_DIR

    async def ensure_directories(self) -> None:
        """Ensure all required directories exist"""
        dirs = [
            self.upload_dir,
            self.conversion_dir,
            self.compression_dir,
            self.merges_dir,
            self.splits_dir,
            self.watermarks_dir,
            self.rotations_dir,
            self.protected_dir,
            self.unlocked_dir,
            self.edited_dir,
            self.pagenumbers_dir,
            self.temp_dir
        ]
        
        for dir_path in dirs:
            if not dir_path.exists():
                os.makedirs(dir_path, exist_ok=True)
    
    def generate_unique_id(self) -> str:
        """Generate a unique ID for a file"""
        return str(uuid.uuid4())
    
    def get_upload_path(self, filename: str) -> Path:
        """Get the full path for an uploaded file"""
        return self.upload_dir / filename
    
    def get_conversion_path(self, filename: str) -> Path:
        """Get the full path for a converted file"""
        return self.conversion_dir / filename
    
    def get_compression_path(self, filename: str) -> Path:
        """Get the full path for a compressed file"""
        return self.compression_dir / filename
    
    def get_merges_path(self, filename: str) -> Path:
        """Get the full path for a merged file"""
        return self.merges_dir / filename
    
    def get_splits_path(self, filename: str) -> Path:
        """Get the full path for a split file"""
        return self.splits_dir / filename
    
    def get_watermarks_path(self, filename: str) -> Path:
        """Get the full path for a watermarked file"""
        return self.watermarks_dir / filename
    
    def get_rotations_path(self, filename: str) -> Path:
        """Get the full path for a rotated file"""
        return self.rotations_dir / filename
    
    def get_protected_path(self, filename: str) -> Path:
        """Get the full path for a protected file"""
        return self.protected_dir / filename
    
    def get_unlocked_path(self, filename: str) -> Path:
        """Get the full path for an unlocked file"""
        return self.unlocked_dir / filename
    
    def get_edited_path(self, filename: str) -> Path:
        """Get the full path for an edited file"""
        return self.edited_dir / filename
    
    def get_pagenumbers_path(self, filename: str) -> Path:
        """Get the full path for a file with page numbers"""
        return self.pagenumbers_dir / filename
    
    def get_temp_path(self, filename: str) -> Path:
        """Get the full path for a temporary file"""
        return self.temp_dir / filename
    
    def get_conversion_url(self, filename: str) -> str:
        """Get the URL for a converted file"""
        return f"/api/file?folder=conversions&filename={filename}"
    
    def get_compression_url(self, filename: str) -> str:
        """Get the URL for a compressed file"""
        return f"/api/file?folder=compressions&filename={filename}"
    
    def get_merges_url(self, filename: str) -> str:
        """Get the URL for a merged file"""
        return f"/api/file?folder=merges&filename={filename}"
    
    def get_splits_url(self, filename: str) -> str:
        """Get the URL for a split file"""
        return f"/api/file?folder=splits&filename={filename}"
    
    def get_watermarks_url(self, filename: str) -> str:
        """Get the URL for a watermarked file"""
        return f"/api/file?folder=watermarks&filename={filename}"
    
    def get_rotations_url(self, filename: str) -> str:
        """Get the URL for a rotated file"""
        return f"/api/file?folder=rotations&filename={filename}"
    
    def get_protected_url(self, filename: str) -> str:
        """Get the URL for a protected file"""
        return f"/api/file?folder=protected&filename={filename}"
    
    def get_unlocked_url(self, filename: str) -> str:
        """Get the URL for an unlocked file"""
        return f"/api/file?folder=unlocked&filename={filename}"
    
    def get_edited_url(self, filename: str) -> str:
        """Get the URL for an edited file"""
        return f"/api/file?folder=edited&filename={filename}"
    
    def get_pagenumbers_url(self, filename: str) -> str:
        """Get the URL for a file with page numbers"""
        return f"/api/file?folder=pagenumbers&filename={filename}"
    
    async def save_uploaded_file(self, file: UploadFile, filename: str) -> Path:
        """Save an uploaded file to the uploads directory"""
        file_path = self.get_upload_path(filename)
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
            
        return file_path
    
    async def save_buffer_as_file(self, buffer: bytes, filename: str, directory: str = "uploads") -> Path:
        """Save a buffer as a file in the specified directory"""
        if directory == "uploads":
            file_path = self.get_upload_path(filename)
        elif directory == "conversions":
            file_path = self.get_conversion_path(filename)
        elif directory == "compressions":
            file_path = self.get_compression_path(filename)
        elif directory == "merges":
            file_path = self.get_merges_path(filename)
        elif directory == "splits":
            file_path = self.get_splits_path(filename)
        elif directory == "watermarks":
            file_path = self.get_watermarks_path(filename)
        elif directory == "rotations":
            file_path = self.get_rotations_path(filename)
        elif directory == "protected":
            file_path = self.get_protected_path(filename)
        elif directory == "unlocked":
            file_path = self.get_unlocked_path(filename)
        elif directory == "edited":
            file_path = self.get_edited_path(filename)
        elif directory == "pagenumbers":
            file_path = self.get_pagenumbers_path(filename)
        elif directory == "temp":
            file_path = self.get_temp_path(filename)
        else:
            raise ValueError(f"Unknown directory: {directory}")
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            await out_file.write(buffer)
            
        return file_path
    
    async def save_converted_file(self, buffer: bytes, filename: str) -> Path:
        """Save a converted file to the conversions directory"""
        return await self.save_buffer_as_file(buffer, filename, "conversions")
    
    async def save_compressed_file(self, buffer: bytes, filename: str) -> Path:
        """Save a compressed file to the compressions directory"""
        return await self.save_buffer_as_file(buffer, filename, "compressions")
    
    async def save_merged_file(self, buffer: bytes, filename: str) -> Path:
        """Save a merged file to the merges directory"""
        return await self.save_buffer_as_file(buffer, filename, "merges")
    
    async def save_split_file(self, buffer: bytes, filename: str) -> Path:
        """Save a split file to the splits directory"""
        return await self.save_buffer_as_file(buffer, filename, "splits")
    
    async def save_watermarked_file(self, buffer: bytes, filename: str) -> Path:
        """Save a watermarked file to the watermarks directory"""
        return await self.save_buffer_as_file(buffer, filename, "watermarks")
    
    async def save_rotated_file(self, buffer: bytes, filename: str) -> Path:
        """Save a rotated file to the rotations directory"""
        return await self.save_buffer_as_file(buffer, filename, "rotations")
    
    async def save_protected_file(self, buffer: bytes, filename: str) -> Path:
        """Save a protected file to the protected directory"""
        return await self.save_buffer_as_file(buffer, filename, "protected")
    
    async def save_unlocked_file(self, buffer: bytes, filename: str) -> Path:
        """Save an unlocked file to the unlocked directory"""
        return await self.save_buffer_as_file(buffer, filename, "unlocked")
    
    async def save_edited_file(self, buffer: bytes, filename: str) -> Path:
        """Save an edited file to the edited directory"""
        return await self.save_buffer_as_file(buffer, filename, "edited")
    
    async def save_pagenumbers_file(self, buffer: bytes, filename: str) -> Path:
        """Save a file with page numbers to the pagenumbers directory"""
        return await self.save_buffer_as_file(buffer, filename, "pagenumbers")
    
    async def read_file(self, file_path: Path) -> bytes:
        """Read a file from any of the managed directories"""
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        async with aiofiles.open(file_path, 'rb') as file:
            return await file.read()
    
    async def file_exists(self, file_path: Path) -> bool:
        """Check if a file exists"""
        return file_path.exists()
    
    async def list_files(self, directory_path: Path) -> List[str]:
        """List all files in a directory"""
        if not directory_path.exists():
            return []
        
        return [str(f.name) for f in directory_path.iterdir() if f.is_file()]
    
    async def get_file_stats(self, file_path: Path) -> Dict[str, int]:
        """Get file stats"""
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        stat = await aiofiles.os.stat(file_path)
        return {
            "size": stat.st_size,
            "created": int(stat.st_ctime),
            "modified": int(stat.st_mtime),
            "accessed": int(stat.st_atime)
        }
    
    async def delete_file(self, file_path: Path) -> bool:
        """Delete a file"""
        if not file_path.exists():
            return False
        
        try:
            await aiofiles.os.remove(file_path)
            return True
        except Exception:
            return False
    
    async def create_temp_directory(self, dir_name: str) -> Path:
        """Create a temporary directory"""
        temp_dir_path = self.temp_dir / dir_name
        os.makedirs(temp_dir_path, exist_ok=True)
        return temp_dir_path
    
    async def remove_temp_directory(self, dir_name: str) -> bool:
        """Remove a temporary directory and its contents"""
        temp_dir_path = self.temp_dir / dir_name
        if not temp_dir_path.exists():
            return False
        
        try:
            shutil.rmtree(temp_dir_path)
            return True
        except Exception:
            return False

# Create a singleton instance
file_storage = FileStorageService()