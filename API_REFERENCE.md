# TGd System - API Reference Guide

Complete API reference for TGd System with examples.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <access_token>
```

### Get Token

**Endpoint:** `POST /auth/login`

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@tgd.com",
    "password": "admin@123456"
  }'
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Refresh Token

**Endpoint:** `POST /auth/refresh`

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "<refresh_token>"
  }'
```

## Assets API

### List Assets

**Endpoint:** `GET /assets`

**Parameters:**
- `skip` (optional): Number of items to skip (default: 0)
- `limit` (optional): Number of items to return (default: 20, max: 100)
- `type` (optional): Filter by asset type
- `status` (optional): Filter by status
- `location` (optional): Filter by location

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/assets?skip=0&limit=10&status=active"
```

**Response:**
```json
{
  "total": 5,
  "skip": 0,
  "limit": 10,
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "CNC Machining Center A",
      "type": "machinery",
      "location": "Factory Floor 1",
      "status": "active",
      "value": 500000.00,
      "acquisition_date": "2024-04-05T00:00:00+00:00",
      "created_at": "2024-04-05T12:00:00+00:00",
      "updated_at": "2024-04-05T12:00:00+00:00"
    }
  ]
}
```

### Get Asset by ID

**Endpoint:** `GET /assets/{id}`

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/assets/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "CNC Machining Center A",
  "type": "machinery",
  "location": "Factory Floor 1",
  "status": "active",
  "value": 500000.00,
  "acquisition_date": "2024-04-05T00:00:00+00:00",
  "created_at": "2024-04-05T12:00:00+00:00",
  "updated_at": "2024-04-05T12:00:00+00:00",
  "asset_metadata": {},
  "maintenance_logs_count": 2,
  "sensor_logs_count": 4,
  "documents_count": 0
}
```

### Create Asset

**Endpoint:** `POST /assets`

**Required:**
- `name`: Asset name
- `type`: Asset type (machinery, vehicle, facility, equipment, tool, other)
- `status`: Asset status (active, inactive, maintenance, retired)

**Optional:**
- `location`: Physical location
- `acquisition_date`: Date acquired (ISO format)
- `value`: Asset value
- `parent_asset_id`: For hierarchical assets
- `asset_metadata`: Custom JSON data

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/assets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hydraulic Press C",
    "type": "machinery",
    "location": "Factory Floor 3",
    "status": "active",
    "value": 150000,
    "acquisition_date": "2024-01-15T00:00:00Z",
    "asset_metadata": {"model": "HPW-3000"}
  }'
```

### Update Asset

**Endpoint:** `PUT /assets/{id}`

**Example:**
```bash
curl -X PUT http://localhost:8000/api/v1/assets/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "maintenance",
    "location": "Maintenance Shop"
  }'
```

### Delete Asset

**Endpoint:** `DELETE /assets/{id}`

**Parameters:**
- `hard_delete` (optional): Hard delete if true, soft delete if false (default: false)

**Example:**
```bash
curl -X DELETE http://localhost:8000/api/v1/assets/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

### Search Assets

**Endpoint:** `GET /assets/search`

**Parameters:**
- `q` (required): Search query
- `skip` (optional): Number to skip
- `limit` (optional): Number to return

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/assets/search?q=machinery&limit=20"
```

### Get Asset Hierarchy

**Endpoint:** `GET /assets/{id}/hierarchy`

Returns asset with all parent and child relationships.

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/assets/123e4567-e89b-12d3-a456-426614174000/hierarchy
```

## Dashboard API

### Overview Statistics

**Endpoint:** `GET /dashboard/overview`

Returns KPI statistics:
- Total assets count
- Total asset value
- Assets grouped by type
- Assets grouped by status

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/dashboard/overview
```

**Response:**
```json
{
  "total_assets": 5,
  "total_value": 2010000.00,
  "by_type": {
    "machinery": 2,
    "vehicle": 1,
    "facility": 1,
    "equipment": 1
  },
  "by_status": {
    "active": 4,
    "maintenance": 1
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate, circular reference) |
| 500 | Internal Server Error |

### Common Error Codes

- `INVALID_CREDENTIALS` - Wrong username/password
- `ASSET_NOT_FOUND` - Asset doesn't exist
- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - User doesn't have permission
- `VALIDATION_ERROR` - Request data validation failed
- `CIRCULAR_DEPENDENCY` - Hierarchical relationship creates circle

**Example Error Response:**
```json
{
  "error": {
    "code": "ASSET_NOT_FOUND",
    "message": "Asset with ID 'invalid-id' not found",
    "details": {}
  }
}
```

## Rate Limiting

Currently no rate limiting is enforced. Rate limiting may be added in production.

## Pagination

List endpoints support pagination with:
- `skip`: Number of items to skip
- `limit`: Number of items per page (max 100)

**Example:**
```bash
# Get items 20-40
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/assets?skip=20&limit=20"
```

## Filtering

Filter by query parameters on resource lists:

```bash
# Filter by multiple criteria
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/assets?type=machinery&status=active&location=Factory"
```

## Interactive API Documentation

Visit **http://localhost:8000/docs** for interactive Swagger UI where you can:
- Test endpoints directly
- See request/response schemas
- View all parameters and requirements

## Examples by Use Case

### Create and Manage Asset Hierarchy

```bash
# Create parent asset
curl -X POST http://localhost:8000/api/v1/assets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Building 1",
    "type": "facility",
    "status": "active"
  }'

# Create child asset with parent_asset_id
curl -X POST http://localhost:8000/api/v1/assets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Building 1 - Roof",
    "type": "facility",
    "status": "active",
    "parent_asset_id": "<parent_id>"
  }'
```

### Get All Active Machinery

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/assets?type=machinery&status=active"
```

### Search and Filter

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/assets/search?q=hydraulic&limit=50"
```

---

For more details, visit http://localhost:8000/docs or see [README.md](./README.md)
