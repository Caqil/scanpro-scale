from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, EmailStr

# Base schemas
class BaseResponse(BaseModel):
    """Base schema for API responses"""
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    
class UserCreate(UserBase):
    password: str
    
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    
class UserResponse(UserBase):
    id: str
    is_email_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Subscription schemas
class SubscriptionBase(BaseModel):
    tier: str
    status: str
    
class SubscriptionCreate(SubscriptionBase):
    user_id: str
    
class SubscriptionUpdate(BaseModel):
    tier: Optional[str] = None
    status: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    canceled_at: Optional[datetime] = None
    paypal_subscription_id: Optional[str] = None
    paypal_plan_id: Optional[str] = None
    
class SubscriptionResponse(SubscriptionBase):
    id: str
    user_id: str
    current_period_start: datetime
    current_period_end: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# API Key schemas
class ApiKeyBase(BaseModel):
    name: str
    permissions: List[str]
    
class ApiKeyCreate(ApiKeyBase):
    user_id: str
    
class ApiKeyResponse(ApiKeyBase):
    id: str
    key: str
    user_id: str
    last_used: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# File processing schemas
class FileProcessingBase(BaseModel):
    """Base schema for file processing requests"""
    pass

# Convert API schemas
class ConvertRequest(FileProcessingBase):
    input_format: Optional[str] = None
    output_format: str
    ocr: Optional[bool] = False
    quality: Optional[int] = 90
    password: Optional[str] = None

class ConvertResponse(BaseResponse):
    file_url: Optional[str] = None
    filename: Optional[str] = None
    original_name: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None

# Compress API schemas
class CompressRequest(FileProcessingBase):
    quality: Optional[str] = "medium"  # low, medium, high

class CompressResponse(BaseResponse):
    file_url: Optional[str] = None
    filename: Optional[str] = None
    original_name: Optional[str] = None
    original_size: Optional[int] = None
    compressed_size: Optional[int] = None
    compression_ratio: Optional[str] = None

# Merge API schemas
class MergeRequest(FileProcessingBase):
    order: Optional[List[int]] = None

class MergeResponse(BaseResponse):
    file_url: Optional[str] = None
    filename: Optional[str] = None
    merged_size: Optional[int] = None
    total_input_size: Optional[int] = None
    file_count: Optional[int] = None

# Split API schemas
class SplitRequest(FileProcessingBase):
    split_method: str  # range, extract, every
    page_ranges: Optional[str] = None
    every_n_pages: Optional[int] = None

class SplitPart(BaseModel):
    file_url: str
    filename: str
    pages: List[int]
    page_count: int

class SplitResponse(BaseResponse):
    original_name: Optional[str] = None
    total_pages: Optional[int] = None
    split_parts: Optional[List[SplitPart]] = None
    is_large_job: Optional[bool] = False
    job_id: Optional[str] = None
    status_url: Optional[str] = None

# PDF Operations schemas
class PageNumberRequest(FileProcessingBase):
    format: str  # numeric, roman, alphabetic
    position: str  # bottom-center, bottom-left, etc.
    font_family: Optional[str] = "Helvetica"
    font_size: Optional[int] = 12
    color: Optional[str] = "#000000"
    start_number: Optional[int] = 1
    prefix: Optional[str] = ""
    suffix: Optional[str] = ""
    margin_x: Optional[int] = 40
    margin_y: Optional[int] = 30
    selected_pages: Optional[str] = ""
    skip_first_page: Optional[bool] = False

class PageNumberResponse(BaseResponse):
    file_url: Optional[str] = None
    filename: Optional[str] = None
    original_name: Optional[str] = None
    total_pages: Optional[int] = None
    numbered_pages: Optional[int] = None

class WatermarkRequest(FileProcessingBase):
    watermark_type: str  # text, image
    position: str  # center, tile, top-left, etc.
    pages: str  # all, specific
    custom_pages: Optional[str] = None
    opacity: Optional[int] = 30
    rotation: Optional[int] = 45
    custom_x: Optional[float] = None
    custom_y: Optional[float] = None
    
    # For text watermark
    text: Optional[str] = None
    text_color: Optional[str] = "#FF0000"
    font_size: Optional[int] = 48
    font_family: Optional[str] = "Arial"
    
    # For image watermark
    scale: Optional[int] = 50

class WatermarkResponse(BaseResponse):
    file_url: Optional[str] = None
    filename: Optional[str] = None
    original_name: Optional[str] = None
    pages_watermarked: Optional[int] = None

class ProtectRequest(FileProcessingBase):
    password: str
    permission: Optional[str] = "restricted"  # all, restricted
    protection_level: Optional[str] = "256"
    
    # Permissions (if restricted)
    allow_printing: Optional[bool] = False
    allow_copying: Optional[bool] = False
    allow_editing: Optional[bool] = False

class ProtectResponse(BaseResponse):
    file_url: Optional[str] = None
    filename: Optional[str] = None
    original_name: Optional[str] = None
    method_used: Optional[str] = None

class UnlockRequest(FileProcessingBase):
    password: Optional[str] = None

class UnlockResponse(BaseResponse):
    file_url: Optional[str] = None
    filename: Optional[str] = None
    original_name: Optional[str] = None
    method_used: Optional[str] = None

class RepairRequest(FileProcessingBase):
    repair_mode: Optional[str] = "standard"  # standard, advanced, optimization
    
    # For password-protected PDFs
    password: Optional[str] = None
    
    # For optimization
    preserve_form_fields: Optional[bool] = True
    preserve_annotations: Optional[bool] = True
    preserve_bookmarks: Optional[bool] = True
    optimize_images: Optional[bool] = True

class RepairResponse(BaseResponse):
    file_url: Optional[str] = None
    filename: Optional[str] = None
    original_name: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class RotateRequest(FileProcessingBase):
    angle: int
    pages: Optional[str] = None  # Comma-separated page numbers or ranges

class RotationInfo(BaseModel):
    page_numbers: List[int]
    angle: int

class RotateResponse(BaseResponse):
    file_url: Optional[str] = None
    filename: Optional[str] = None
    angle: Optional[int] = None
    total_pages: Optional[int] = None
    rotated_pages: Optional[int] = None
    page_numbers: Optional[List[int]] = None

# OCR schemas
class OcrRequest(FileProcessingBase):
    language: Optional[str] = "eng"
    preserve_layout: Optional[bool] = True
    page_range: Optional[str] = "all"
    pages: Optional[str] = None

class OcrResponse(BaseResponse):
    text: Optional[str] = None
    file_url: Optional[str] = None
    pages_processed: Optional[int] = None
    total_pages: Optional[int] = None
    word_count: Optional[int] = None

# Chat schemas
class ChatSessionCreate(BaseModel):
    """Schema for creating a new chat session"""
    file: bytes  # This will be handled differently in FastAPI

class ChatSessionResponse(BaseResponse):
    session_id: Optional[str] = None
    original_name: Optional[str] = None
    message: Optional[str] = None

class ChatMessageRequest(BaseModel):
    """Schema for sending a chat message"""
    session_id: str
    message: str

class ChatMessageResponse(BaseResponse):
    message: Optional[str] = None

class ChatHistoryResponse(BaseResponse):
    session_id: Optional[str] = None
    messages: Optional[List[Dict[str, Any]]] = None
    created_at: Optional[str] = None

# API Key Management schemas
class ApiKeyCreateRequest(BaseModel):
    name: Optional[str] = "API Key"
    permissions: Optional[List[str]] = None

class ApiKeyCreateResponse(BaseResponse):
    key: Optional[Dict[str, Any]] = None

class ApiKeyListResponse(BaseResponse):
    keys: Optional[List[Dict[str, Any]]] = None

class ApiKeyDeleteResponse(BaseResponse):
    pass