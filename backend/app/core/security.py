"""
Security Module

Handles JWT token generation/validation, password hashing, and security utilities.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings
from app.core.exceptions import InvalidTokenException, TokenExpiredException

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

settings = get_settings()


# ===== Password Functions =====


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        str: Hashed password

    Example:
        >>> hashed = hash_password("mypassword")
        >>> verify_password("mypassword", hashed)
        True
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against

    Returns:
        bool: True if passwords match, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


# ===== JWT Token Functions =====


def create_access_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
    additional_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Create a JWT access token.

    Args:
        subject: Subject identifier (usually user ID)
        expires_delta: Token expiration time. Defaults to 30 minutes
        additional_claims: Additional claims to include in token

    Returns:
        str: Encoded JWT token

    Example:
        >>> token = create_access_token(subject="user123")
        >>> claims = decode_token(token)
        >>> claims["sub"]
        'user123'
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode = {"exp": expire, "sub": subject}

    if additional_claims:
        to_encode.update(additional_claims)

    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )
    return encoded_jwt


def create_refresh_token(subject: str) -> str:
    """
    Create a JWT refresh token.

    Args:
        subject: Subject identifier (usually user ID)

    Returns:
        str: Encoded JWT refresh token
    """
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    to_encode = {"exp": expire, "sub": subject, "type": "refresh"}
    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT token.

    Args:
        token: JWT token string

    Returns:
        Dict[str, Any]: Decoded token claims

    Raises:
        TokenExpiredException: If token has expired
        InvalidTokenException: If token is invalid or malformed

    Example:
        >>> token = create_access_token(subject="user123")
        >>> claims = decode_token(token)
        >>> claims["sub"]
        'user123'
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        return payload
    except JWTError as e:
        if "ExpiredSignatureError" in str(type(e)):
            raise TokenExpiredException(
                details={"original_error": str(e)},
            )
        else:
            raise InvalidTokenException(
                details={"original_error": str(e)},
            )


def get_subject_from_token(token: str) -> str:
    """
    Extract subject (user ID) from JWT token.

    Args:
        token: JWT token string

    Returns:
        str: Subject identifier

    Raises:
        TokenExpiredException: If token has expired
        InvalidTokenException: If token is invalid
    """
    payload = decode_token(token)
    subject = payload.get("sub")
    if not subject:
        raise InvalidTokenException(
            details={"reason": "Subject not found in token"},
        )
    return subject
