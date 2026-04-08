"""
Application Configuration Module

Handles all environment-based configuration using Pydantic Settings.
Supports multiple environments (development, staging, production).
"""

from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings.
    
    Load configuration from .env file and environment variables.
    Environment variables take precedence over .env values.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ===== Application Settings =====
    app_name: str = "TDd System"
    app_version: str = "1.0.0"
    debug: bool = True
    environment: str = "development"

    # ===== API Settings =====
    api_v1_str: str = "/api/v1"
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # ===== Database Settings =====
    database_url: str = "postgresql://tgd_user:tgd_password@localhost:5432/tgd_system"
    database_echo: bool = False
    database_pool_size: int = 20
    database_max_overflow: int = 10
    database_pool_recycle: int = 3600

    # ===== Redis Settings =====
    redis_url: str = "redis://localhost:6379/0"
    redis_cache_expire: int = 3600  # 1 hour

    # ===== Security Settings =====
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    jwt_subject: str = "access"

    # ===== CORS Settings =====
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "ws://localhost:8000",
        "ws://127.0.0.1:8000",
        "*",  # Allow all origins for development
    ]
    cors_credentials: bool = True
    cors_methods: List[str] = ["*"]
    cors_headers: List[str] = ["*"]

    # ===== File Upload Settings =====
    max_file_size: int = 52428800  # 50MB
    allowed_file_extensions: List[str] = [
        "pdf",
        "jpg",
        "jpeg",
        "png",
        "doc",
        "docx",
        "xls",
        "xlsx",
    ]

    # ===== AWS S3 Settings (Optional) =====
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_s3_bucket: Optional[str] = None
    aws_region: Optional[str] = "us-east-1"

    # ===== Logging Settings =====
    log_level: str = "INFO"
    log_format: str = "json"

    # ===== Telegram Settings (Optional) =====
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None

    # ===== Email Settings (Optional) =====
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    sender_email: Optional[str] = None

    # ===== Feature Flags =====
    enable_websocket: bool = False
    enable_sensor_simulation: bool = True
    enable_email_notifications: bool = False

    # ===== Computed Properties =====
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment == "development"

    @property
    def is_testing(self) -> bool:
        """Check if running in testing environment."""
        return self.environment == "testing"


@lru_cache()
def get_settings() -> Settings:
    """
    Cached Settings instance.
    
    Returns the same Settings object throughout the application lifecycle.
    
    Returns:
        Settings: Application configuration instance.
    """
    return Settings()
