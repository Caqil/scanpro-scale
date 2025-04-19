from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager

from app.core.config import settings

# Create the engine based on the configured database URL
if settings.DATABASE_URL:
    # Use SQLAlchemy 1.4's updated async syntax if using PostgreSQL
    if settings.DATABASE_URL.startswith('postgresql'):
        # Convert the sync URL to async URL
        async_database_url = settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')
        engine = create_async_engine(
            async_database_url,
            echo=settings.DEBUG,
            future=True,
        )
        async_session_factory = sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
    else:
        # For SQLite and other databases, use synchronous engine
        engine = create_engine(
            settings.DATABASE_URL, 
            connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith('sqlite') else {},
            echo=settings.DEBUG,
        )
        async_session_factory = sessionmaker(
            engine, expire_on_commit=False
        )
else:
    # Default to SQLite if no database URL is provided
    sqlite_file_name = "scanpro_api.db"
    sqlite_url = f"sqlite:///{sqlite_file_name}"
    
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG,
    )
    async_session_factory = sessionmaker(
        engine, expire_on_commit=False
    )

# Create a Base class for declarative models
Base = declarative_base()

@asynccontextmanager
async def get_async_session():
    """
    Async context manager for database sessions.
    Yields an async session and handles commit/rollback.
    """
    session = async_session_factory()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()

def get_db():
    """
    Generator function to get a new database session.
    """
    db = async_session_factory()
    try:
        yield db
    finally:
        db.close()