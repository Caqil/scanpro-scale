import os
import time
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import shutil
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.database import get_async_session
from app.db.models import PasswordResetToken
from app.services.file_storage import file_storage

# Define directories to clean
DIRECTORIES = [
    settings.UPLOAD_DIR,
    settings.CONVERSIONS_DIR,
    settings.COMPRESSIONS_DIR,
    settings.MERGES_DIR,
    settings.SPLITS_DIR,
    settings.WATERMARKS_DIR,
    settings.ROTATIONS_DIR,
    settings.PROTECTED_DIR,
    settings.UNLOCKED_DIR,
    settings.EDITED_DIR,
    settings.PAGENUMBERS_DIR,
    settings.TEMP_DIR,
]

def ensure_directories():
    """Ensure all required directories exist"""
    for dir_path in DIRECTORIES:
        os.makedirs(dir_path, exist_ok=True)

async def cleanup_expired_reset_tokens() -> Dict[str, int]:
    """
    Cleanup expired password reset tokens
    This should be run periodically to keep the database clean
    
    Returns:
        Dict with count of deleted tokens
    """
    try:
        async with get_async_session() as session:
            # Delete all tokens that have expired
            result = await session.execute(
                "DELETE FROM password_reset_tokens WHERE expires < :now",
                {"now": datetime.now()}
            )
            
            await session.commit()
            deleted_count = result.rowcount or 0
            
            print(f"Deleted {deleted_count} expired password reset tokens")
            return {"count": deleted_count}
    except Exception as e:
        print(f"Error cleaning up expired tokens: {e}")
        return {"count": 0, "error": str(e)}

async def cleanup_files(max_age_minutes: int = 60) -> Dict[str, any]:
    """
    Clean up old temporary files to free up disk space
    
    Args:
        max_age_minutes: Maximum age of files to keep (in minutes)
        
    Returns:
        Dict with cleanup statistics
    """
    try:
        now = time.time()
        max_age_seconds = max_age_minutes * 60
        stats = {
            "total_cleaned": 0,
            "by_dir": {},
            "total_size": 0,
        }

        # Process each directory
        for dir_path in DIRECTORIES:
            if not dir_path.exists():
                continue
            
            dir_name = dir_path.name
            stats["by_dir"][dir_name] = 0
            
            # Read all files in the directory
            for file_path in dir_path.glob("*"):
                if not file_path.is_file():
                    continue
                
                try:
                    # Get file stats
                    file_stat = file_path.stat()
                    
                    # Check if file is older than max age
                    file_age = now - file_stat.st_mtime
                    
                    if file_age > max_age_seconds:
                        # File is older than max age, delete it
                        file_size = file_stat.st_size
                        os.unlink(file_path)
                        
                        # Update stats
                        stats["total_cleaned"] += 1
                        stats["by_dir"][dir_name] += 1
                        stats["total_size"] += file_size
                except Exception as e:
                    # Skip files with errors
                    print(f"Error processing file {file_path}: {e}")
        
        return {
            "success": True,
            "stats": stats,
        }
    except Exception as e:
        print(f"Error cleaning up files: {e}")
        return {
            "success": False,
            "error": str(e),
        }

async def run_cleanup_tasks() -> Dict[str, any]:
    """
    Run all cleanup tasks
    
    Returns:
        Dict with results of all cleanup tasks
    """
    try:
        # Run all cleanup tasks
        token_cleanup_result = await cleanup_expired_reset_tokens()
        file_cleanup_result = await cleanup_files()
        
        return {
            "success": True,
            "results": {
                "expired_tokens": token_cleanup_result,
                "file_cleanup": file_cleanup_result,
            },
        }
    except Exception as e:
        print(f"Error running cleanup tasks: {e}")
        return {
            "success": False,
            "results": {
                "error": str(e),
            },
        }

# Function to schedule cleanup tasks
async def schedule_cleanup_tasks():
    """Schedule periodic cleanup tasks"""
    while True:
        await run_cleanup_tasks()
        # Run every 24 hours
        await asyncio.sleep(24 * 60 * 60)