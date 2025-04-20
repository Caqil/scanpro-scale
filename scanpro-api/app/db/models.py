import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, ForeignKey, 
    Text, JSON, Table, Float, Enum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=True)  # Hashed password
    image = Column(String, nullable=True)     # Profile image URL
    is_email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    api_keys = relationship("ApiKey", back_populates="user")
    usage_stats = relationship("UsageStats", back_populates="user")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    tier = Column(String, default="free")  # free, basic, pro, enterprise
    status = Column(String, default="active")  # active, pending, canceled, suspended
    current_period_start = Column(DateTime, default=datetime.utcnow)
    current_period_end = Column(DateTime, nullable=True)
    canceled_at = Column(DateTime, nullable=True)
    paypal_subscription_id = Column(String, nullable=True)
    paypal_plan_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscription")

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    key = Column(String, unique=True, index=True)  # The actual API key
    name = Column(String)  # Name given to this key by the user
    permissions = Column(JSON, default=list)  # List of operations this key can perform
    last_used = Column(DateTime, nullable=True)  # When this key was last used
    expires_at = Column(DateTime, nullable=True)  # When this key expires
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="api_keys")

class UsageStats(Base):
    __tablename__ = "usage_stats"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    operation = Column(String)  # The operation performed (convert, compress, etc.)
    count = Column(Integer, default=0)  # Number of operations performed
    date = Column(DateTime)  # Date of the operations
    
    # Relationships
    user = relationship("User", back_populates="usage_stats")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String, unique=True, index=True)
    expires = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)