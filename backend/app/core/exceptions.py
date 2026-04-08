"""
Custom Exception Classes

Defines application-specific exceptions for consistent error handling
across the entire application.
"""

from typing import Any, Dict, Optional


class AppException(Exception):
    """
    Base Exception for the application.
    All custom exceptions should inherit from this.
    """

    def __init__(
        self,
        message: str,
        error_code: str = "INTERNAL_ERROR",
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Initialize AppException.

        Args:
            message: Human-readable error message
            error_code: Machine-readable error code
            status_code: HTTP status code
            details: Additional error details
        """
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


# ===== Authentication & Authorization Exceptions =====


class AuthenticationException(AppException):
    """Raised when authentication fails."""

    def __init__(
        self,
        message: str = "Authentication failed",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            status_code=401,
            details=details,
        )


class InvalidCredentialsException(AuthenticationException):
    """Raised when credentials are invalid."""

    def __init__(self, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            message="Invalid username or password",
            details=details,
        )


class TokenExpiredException(AuthenticationException):
    """Raised when JWT token has expired."""

    def __init__(self, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            message="Token has expired",
            details=details,
        )


class InvalidTokenException(AuthenticationException):
    """Raised when JWT token is invalid or malformed."""

    def __init__(self, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            message="Invalid token",
            details=details,
        )


class AuthorizationException(AppException):
    """Raised when user lacks required permissions."""

    def __init__(
        self,
        message: str = "Insufficient permissions",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="AUTHORIZATION_ERROR",
            status_code=403,
            details=details,
        )


# ===== Resource Exceptions =====


class ResourceNotFoundException(AppException):
    """Raised when a requested resource is not found."""

    def __init__(
        self,
        resource_type: str,
        resource_id: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        message = f"{resource_type} with ID '{resource_id}' not found"
        super().__init__(
            message=message,
            error_code="RESOURCE_NOT_FOUND",
            status_code=404,
            details=details,
        )


class DuplicateResourceException(AppException):
    """Raised when attempting to create a duplicate resource."""

    def __init__(
        self,
        resource_type: str,
        field: str,
        value: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        message = f"{resource_type} with {field} '{value}' already exists"
        super().__init__(
            message=message,
            error_code="DUPLICATE_RESOURCE",
            status_code=409,
            details=details,
        )


# ===== Validation Exceptions =====


class ValidationException(AppException):
    """Raised when request data validation fails."""

    def __init__(
        self,
        message: str = "Validation failed",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            status_code=422,
            details=details,
        )


class InvalidOperationException(AppException):
    """Raised when attempting an invalid operation."""

    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="INVALID_OPERATION",
            status_code=400,
            details=details,
        )


# ===== Business Logic Exceptions =====


class BusinessLogicException(AppException):
    """Raised when a business rule is violated."""

    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="BUSINESS_LOGIC_ERROR",
            status_code=400,
            details=details,
        )


class InsufficientStockException(BusinessLogicException):
    """Raised when inventory is insufficient."""

    def __init__(
        self,
        item_name: str,
        required: int,
        available: int,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        message = (
            f"Insufficient stock for {item_name}. "
            f"Required: {required}, Available: {available}"
        )
        super().__init__(message=message, details=details)


# ===== Database Exceptions =====


class DatabaseException(AppException):
    """Raised when a database operation fails."""

    def __init__(
        self,
        message: str = "Database operation failed",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            status_code=500,
            details=details,
        )


class DatabaseConnectionException(DatabaseException):
    """Raised when unable to connect to the database."""

    def __init__(self, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            message="Failed to connect to database",
            details=details,
        )


# ===== External Service Exceptions =====


class ExternalServiceException(AppException):
    """Raised when an external service fails."""

    def __init__(
        self,
        service_name: str,
        message: str = "External service error",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        full_message = f"{service_name}: {message}"
        super().__init__(
            message=full_message,
            error_code="EXTERNAL_SERVICE_ERROR",
            status_code=502,
            details=details,
        )


# ===== File Operation Exceptions =====


class FileOperationException(AppException):
    """Raised when a file operation fails."""

    def __init__(
        self,
        message: str = "File operation failed",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="FILE_OPERATION_ERROR",
            status_code=400,
            details=details,
        )


class FileTooLargeException(FileOperationException):
    """Raised when file size exceeds limit."""

    def __init__(
        self, file_size: int, max_size: int, details: Optional[Dict[str, Any]] = None
    ) -> None:
        message = f"File size {file_size} exceeds maximum {max_size} bytes"
        super().__init__(message=message, details=details)


class InvalidFileTypeException(FileOperationException):
    """Raised when file type is not allowed."""

    def __init__(
        self, file_type: str, allowed: str, details: Optional[Dict[str, Any]] = None
    ) -> None:
        message = f"File type '{file_type}' not allowed. Allowed types: {allowed}"
        super().__init__(message=message, details=details)
