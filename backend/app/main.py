"""
FastAPI Application Entry Point

Main application factory for TGd System.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api.routes import auth, assets, dashboard, sensors_iot, roles, websocket, users
from .config import get_settings
from .core.exceptions import AppException
from .db.session import engine, SessionLocal, get_db

settings = get_settings()
logger = logging.getLogger(__name__)


# ===== Lifespan Context Manager =====


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events.

    Handles startup and shutdown operations.
    """
    # Startup
    print(f"[START] Starting {settings.app_name} v{settings.app_version}")
    print(f"[ENV] Environment: {settings.environment}")
    print(f"[DEBUG] Debug: {settings.debug}")
    print("[INFO] Adapters can be started manually or via docker-compose")
    
    yield
    
    # Shutdown
    print(f"[STOP] Shutting down {settings.app_name}")


# ===== FastAPI App Factory =====


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.

    Returns:
        FastAPI: Configured FastAPI application instance
    """
    app = FastAPI(
        title=settings.app_name,
        description="Enterprise-grade asset monitoring and management platform",
        version=settings.app_version,
        debug=settings.debug,
        lifespan=lifespan,
    )

    # ===== CORS Middleware =====
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=settings.cors_credentials,
        allow_methods=settings.cors_methods,
        allow_headers=settings.cors_headers,
    )

    # ===== Exception Handlers =====

    @app.exception_handler(AppException)
    async def app_exception_handler(request, exc: AppException):
        """Handle custom application exceptions."""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.error_code,
                    "message": exc.message,
                    "details": exc.details,
                }
            },
        )

    # ===== API Routes =====
    app.include_router(
        auth.router,
        prefix=f"{settings.api_v1_str}/auth",
        tags=["Authentication"],
    )

    app.include_router(
        users.router,
        prefix=f"{settings.api_v1_str}/users",
        tags=["Users"],
    )

    app.include_router(
        roles.router,
        tags=["Roles"],
    )

    app.include_router(
        assets.router,
        prefix=f"{settings.api_v1_str}/assets",
        tags=["Assets"],
    )

    app.include_router(
        dashboard.router,
        prefix=f"{settings.api_v1_str}/dashboard",
        tags=["Dashboard"],
    )

    app.include_router(
        sensors_iot.router,
        tags=["IoT Sensors"],
    )

    app.include_router(
        websocket.router,
        tags=["WebSocket"],
    )

    # ===== Health Check =====

    @app.get("/health", tags=["Health"])
    async def health_check():
        """Health check endpoint."""
        return {
            "status": "healthy",
            "service": settings.app_name,
            "version": settings.app_version,
        }

    # ===== Root Endpoint =====

    @app.get("/", tags=["Root"])
    async def root():
        """Root endpoint."""
        return {
            "message": f"Welcome to {settings.app_name}",
            "docs": "/docs",
            "redoc": "/redoc",
            "version": settings.app_version,
        }

    return app


# ===== ASGI Application =====

app = create_app()


# ===== Development Entry Point =====

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
