from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from pathlib import Path

from app.core.config import settings
from app.core.middleware import APIKeyMiddleware, WebUIDetectionMiddleware
from app.api import convert, compress, merge, split
from app.api.pdf import (
    info, process, repair, unlock, watermark, 
    sign, rotate, protect, pagenumber, chat
)
from app.api.keys import routes as key_routes
from app.services.cleanup_service import ensure_directories

# Initialize the FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    docs_url="/api/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT == "development" else None,
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middlewares
app.add_middleware(WebUIDetectionMiddleware)
app.add_middleware(APIKeyMiddleware)

# Include API routes
app.include_router(convert.router, prefix="/api", tags=["Convert"])
app.include_router(compress.router, prefix="/api", tags=["Compress"])
app.include_router(merge.router, prefix="/api", tags=["Merge"])
app.include_router(split.router, prefix="/api", tags=["Split"])

# Include PDF-related routes
app.include_router(info.router, prefix="/api/pdf", tags=["PDF Info"])
app.include_router(process.router, prefix="/api/pdf", tags=["PDF Process"])
app.include_router(repair.router, prefix="/api/pdf", tags=["PDF Repair"])
app.include_router(unlock.router, prefix="/api/pdf", tags=["PDF Unlock"])
app.include_router(watermark.router, prefix="/api/pdf", tags=["PDF Watermark"])
app.include_router(sign.router, prefix="/api/pdf", tags=["PDF Sign"])
app.include_router(rotate.router, prefix="/api/pdf", tags=["PDF Rotate"])
app.include_router(protect.router, prefix="/api/pdf", tags=["PDF Protect"])
app.include_router(pagenumber.router, prefix="/api/pdf", tags=["PDF Page Numbers"])
app.include_router(chat.router, prefix="/api/pdf", tags=["PDF Chat"])

# Include API key management routes
app.include_router(key_routes.router, prefix="/api/keys", tags=["API Keys"])

# Mount static files for public access
for dir_name in ["conversions", "compressions", "merges", "splits", "watermarks", 
                "rotations", "protected", "unlocked", "edited", "pagenumbers"]:
    dir_path = Path("public") / dir_name
    dir_path.mkdir(parents=True, exist_ok=True)
    app.mount(f"/{dir_name}", StaticFiles(directory=f"public/{dir_name}"), name=dir_name)

# Health check endpoint
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": settings.VERSION}

# Create necessary directories on startup
@app.on_event("startup")
async def startup_event():
    ensure_directories()

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host=settings.HOST, 
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )