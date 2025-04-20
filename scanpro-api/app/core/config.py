import os
from pathlib import Path
from typing import List, Optional
from pydantic import model_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application settings
    PROJECT_NAME: str = "ScanPro API"
    PROJECT_DESCRIPTION: str = "API for ScanPro document processing services"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"  # development, production, test
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Directory paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    PUBLIC_DIR: Path = BASE_DIR / "public"
    TEMP_DIR: Path = BASE_DIR / "temp"
    CHAT_SESSIONS_DIR: Path = BASE_DIR / "chatsessions"
    
    # Public subdirectories
    CONVERSIONS_DIR: Path = PUBLIC_DIR / "conversions"
    COMPRESSIONS_DIR: Path = PUBLIC_DIR / "compressions" 
    MERGES_DIR: Path = PUBLIC_DIR / "merges"
    SPLITS_DIR: Path = PUBLIC_DIR / "splits"
    WATERMARKS_DIR: Path = PUBLIC_DIR / "watermarks"
    ROTATIONS_DIR: Path = PUBLIC_DIR / "rotations"
    PROTECTED_DIR: Path = PUBLIC_DIR / "protected"
    UNLOCKED_DIR: Path = PUBLIC_DIR / "unlocked"
    EDITED_DIR: Path = PUBLIC_DIR / "edited"
    PAGENUMBERS_DIR: Path = PUBLIC_DIR / "pagenumbers"
    STATUS_DIR: Path = PUBLIC_DIR / "status"
    
    # File size limits
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # Security settings
    SECRET_KEY: str = "your-secret-key-here-please-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: Optional[str] = None
    
    # Redis settings for rate limiting
    REDIS_HOST: Optional[str] = None
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_URL: Optional[str] = None
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["*"]
    
    # OpenAI for PDF chat
    OPENAI_API_KEY: Optional[str] = None
    
    # Rate limits by subscription tier (requests per hour)
    RATE_LIMITS: dict = {
        "free": {"limit": 100, "window": 3600},
        "basic": {"limit": 1000, "window": 3600},
        "pro": {"limit": 2000, "window": 3600},
        "enterprise": {"limit": 5000, "window": 3600},
    }
    
    # Usage limits by tier (operations per month)
    USAGE_LIMITS: dict = {
        "free": 100,
        "basic": 1000,
        "pro": 10000,
        "enterprise": 100000,
    }
    
    # List of valid API operations
    API_OPERATIONS: List[str] = [
        "convert", "compress", "merge", "split", "watermark", 
        "rotate", "protect", "unlock", "ocr", "sign", 
        "edit", "repair", "extract", "annotate", "redact", 
        "detect", "organize", "process", "chat"
    ]
    
    # List of API routes requiring authentication
    API_ROUTES: List[str] = [
        "/api/convert", "/api/compress", "/api/merge", "/api/split",
        "/api/pdf/watermark", "/api/rotate", "/api/pdf/protect",
        "/api/pdf/unlock", "/api/ocr", "/api/pdf/sign",
        "/api/pdf/edit", "/api/pdf/repair", "/api/pdf/extract",
        "/api/pdf/annotate", "/api/pdf/redact", "/api/pdf/redact/detect",
        "/api/pdf/organize", "/api/pdf/process", "/api/pdf/save",
        "/api/pdf/info", "/api/pdf/pagenumber",
    ]
    
    # Routes excluded from API key validation
    EXCLUDED_ROUTES: List[str] = [
        "/api/health",
        "/api/docs",
        "/api/redoc",
        "/api/openapi.json",
        "/api/file",
        "/api/convert/status",
        "/api/convert/download",
        "/api/compress/download",
    ]
    
    # For Web UI detection
    BROWSER_USER_AGENT_PATTERNS: List[str] = [
        "Mozilla/",
        "Chrome/",
        "Safari/",
        "Firefox/",
        "Edge/",
        "Opera/"
    ]
    
    @model_validator(mode="after")
    def setup_redis_url(self) -> "Settings":
        if not self.REDIS_URL and self.REDIS_HOST:
            auth_part = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
            self.REDIS_URL = f"redis://{auth_part}{self.REDIS_HOST}:{self.REDIS_PORT}"
        return self
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create a settings instance
settings = Settings()

# Map API route patterns to operation types
ROUTE_TO_OPERATION_MAP = {
    "/api/convert": "convert",
    "/api/compress": "compress",
    "/api/merge": "merge",
    "/api/split": "split",
    "/api/pdf/watermark": "watermark",
    "/api/rotate": "rotate",
    "/api/pdf/protect": "protect",
    "/api/pdf/unlock": "unlock",
    "/api/ocr": "ocr",
    "/api/pdf/sign": "sign",
    "/api/pdf/edit": "edit",
    "/api/pdf/repair": "repair",
    "/api/pdf/extract": "extract",
    "/api/pdf/annotate": "annotate",
    "/api/pdf/redact": "redact",
    "/api/pdf/redact/detect": "detect",
    "/api/pdf/organize": "organize",
    "/api/pdf/process": "process",
    "/api/pdf/save": "edit",
    "/api/pdf/info": "extract",
    "/api/pdf/pagenumber": "edit",
    "/api/pdf/chat": "chat",
}