# TGd System - Backend README

## Overview

TGd System backend is a production-ready FastAPI application for managing industrial assets with real-time monitoring, maintenance tracking, and analytics.

## Tech Stack

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 12+
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (PyJWT)
- **Validation**: Pydantic v2
- **Caching**: Redis (optional)

## Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip/virtualenv

### Installation

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database and settings
   ```

4. **Initialize database**:
   ```bash
   # Using Alembic migrations (recommended)
   alembic upgrade head

   # Or directly create tables with seed data
   python seed_data.py
   ```

5. **Run server**:
   ```bash
   uvicorn app.main:app --reload
   ```

   Server will be available at `http://localhost:8000`

## API Documentation

**Swagger UI**: http://localhost:8000/docs  
**ReDoc**: http://localhost:8000/redoc

## Project Structure

```
app/
├── main.py                 # FastAPI app entry point
├── config.py              # Configuration management
├── core/
│   ├── security.py        # JWT, password hashing
│   ├── exceptions.py      # Custom exceptions
│   └── constants.py       # Enums and constants
├── models/                # SQLAlchemy ORM models
│   ├── user.py
│   ├── asset.py
│   ├── maintenance.py
│   ├── inventory.py
│   ├── vehicle.py
│   ├── document.py
│   └── sensor.py
├── schemas/               # Pydantic request/response models
│   ├── user.py
│   ├── asset.py
│   ├── common.py
│   └── vehicle.py
├── repositories/          # Data access layer
│   ├── base.py           # Generic CRUD repository
│   ├── asset_repository.py
│   ├── maintenance_repository.py
│   ├── inventory_repository.py
│   ├── user_repository.py
│   └── vehicle_repository.py
├── services/              # Business logic layer
│   ├── asset_service.py
│   ├── auth_service.py
│   └── maintenance_service.py
├── api/
│   ├── routes/           # Route handlers
│   │   ├── auth.py
│   │   ├── assets.py
│   │   ├── maintenance.py
│   │   └── dashboard.py
│   └── deps.py           # Dependency injection
└── db/
    ├── session.py        # Database session management
    └── base.py           # Base model classes
```

## Key APIs

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Assets
- `GET /api/v1/assets` - List assets (paginated, filtered)
- `POST /api/v1/assets` - Create asset
- `GET /api/v1/assets/{id}` - Get asset details
- `PUT /api/v1/assets/{id}` - Update asset
- `DELETE /api/v1/assets/{id}` - Delete asset
- `GET /api/v1/assets/{id}/hierarchy` - Get asset hierarchy

### Dashboard
- `GET /api/v1/dashboard/overview` - Get dashboard statistics

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow

1. **Login** with credentials:
   ```bash
   POST /api/v1/auth/login
   {
     "username": "admin@tgd.com",
     "password": "password123"
   }
   ```

2. **Response**:
   ```json
   {
     "access_token": "eyJ...",
     "refresh_token": "eyJ...",
     "token_type": "bearer",
     "expires_in": 1800
   }
   ```

3. **Use token** in requests:
   ```bash
   Authorization: Bearer <access_token>
   ```

4. **Refresh token** before expiration:
   ```bash
   POST /api/v1/auth/refresh
   {
     "refresh_token": "eyJ..."
   }
   ```

## Database Schema

### Core Tables

- **users** - User accounts with role-based access
- **roles** - User roles (admin, engineer, viewer)
- **assets** - Physical and digital assets
- **asset_hierarchy** - Parent-child relationships
- **maintenance_logs** - Maintenance operations
- **inventory_items** - Spare parts inventory
- **vehicles** - Vehicle fleet
- **vehicle_usage_logs** - Vehicle usage history
- **documents** - Uploaded files and documents
- **sensor_logs** - IoT sensor readings

## Repository Pattern

The system uses a repository pattern for data access:

```python
# Example: Asset repository usage
from app.repositories.asset_repository import AssetRepository
from app.db.session import SessionLocal

db = SessionLocal()
repo = AssetRepository(db)

# CRUD operations
asset = repo.get_by_id("asset-id")
assets, total = repo.get_all(skip=0, limit=20)
new_asset = repo.create(asset_create_schema)
updated = repo.update(asset, asset_update_schema)
repo.delete(asset)

# Specialized queries
assets, total = repo.get_assets_by_type("machinery", skip=0, limit=20)
stats = repo.get_asset_count_by_type()
value = repo.get_total_asset_value()
```

## Service Layer

Services contain business logic and validation:

```python
# Example: Asset service usage
from app.services.asset_service import AssetService
from app.db.session import SessionLocal

db = SessionLocal()
service = AssetService(db)

# Create with validation
asset = service.create_asset(asset_create_schema, user_id)

# Get with related data
asset_detail = service.get_asset(asset_id)

# Get statistics
stats = service.get_asset_statistics()

# Search
results, total = service.search_assets(query, skip=0, limit=20)
```

## Testing

Run tests with pytest:

```bash
# All tests
pytest

# Specific file
pytest tests/test_assets.py

# Coverage
pytest --cov=app tests/
```

## Environment Variables

Key configuration variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tdd_system

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
API_HOST=0.0.0.0
API_PORT=8000

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

## Error Handling

The API uses standardized error responses:

```json
{
  "error": {
    "code": "ASSET_NOT_FOUND",
    "message": "Asset with ID 'xyz' not found",
    "details": {}
  }
}
```

## Deployment

### Docker

```bash
   docker build -t tgd-system-backend .
   docker run -p 8000:8000 --env-file .env tgd-system-backend

### Production Checklist

- [ ] Set `DEBUG=False` in `.env`
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure PostgreSQL for production
- [ ] Set up Redis for caching
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up logging and monitoring
- [ ] Configure database backups
- [ ] Set up CI/CD pipeline
- [ ] Run security checks

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes with tests
3. Ensure all tests pass: `pytest`
4. Format code: `black app/` and `isort app/`
5. Submit pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions, contact: support@tgdsystem.com
