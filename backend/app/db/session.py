"""
Database Session Management

Handles SQLAlchemy engine creation, session factory, and session lifecycle.
"""

from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings

settings = get_settings()

# SQLAlchemy Engine
engine = create_engine(
    settings.database_url,
    echo=settings.database_echo,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    pool_recycle=settings.database_pool_recycle,
    pool_pre_ping=True,  # Test connections before using
)

# Session Factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)

# Base class for ORM models
Base = declarative_base()


# ===== Event Listeners =====


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """
    Enable foreign keys for SQLite (if using SQLite instead of PostgreSQL).
    This is a no-op for PostgreSQL.
    """
    if "sqlite" in settings.database_url:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


# ===== Session Dependency =====


def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency for FastAPI endpoints.

    Yields:
        Session: SQLAlchemy session instance

    Example:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ===== Utility Functions =====


def init_db() -> None:
    """
    Initialize database tables.

    This should be called once during application startup.
    In production, use Alembic migrations instead.

    Example:
        >>> from app.db.session import init_db
        >>> init_db()
    """
    Base.metadata.create_all(bind=engine)


def drop_all_tables() -> None:
    """
    Drop all tables from the database.

    WARNING: This is destructive and should only be used in development/testing.

    Example:
        >>> from app.db.session import drop_all_tables
        >>> drop_all_tables()
    """
    Base.metadata.drop_all(bind=engine)
