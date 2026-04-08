# TGd System - Getting Started Guide

## Welcome to TGd System!

TGd System (Tin Grid Data System) is an enterprise-grade asset monitoring and management platform designed for industrial applications.

## What's Included

- **Backend**: Production-ready FastAPI application
- **Frontend**: Modern React UI with TailwindCSS
- **Database**: PostgreSQL with comprehensive schema
- **Documentation**: Complete API docs and guides

## Quick Setup (5 minutes)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python seed_data.py
uvicorn app.main:app --reload
```

**Access API**: http://localhost:8000  
**Swagger Docs**: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Access App**: http://localhost:5173

## Default Credentials

Use these test accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@tgd.com | admin@123456 | Admin |
| engineer@tgd.com | eng@123456 | Engineer |
| viewer@tgd.com | view@123456 | Viewer |

## Architecture Overview

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   React UI  │◄─────────►    FastAPI      │◄─────────►  PostgreSQL  │
│  (Frontend) │  (axios) │    (Backend)    │  (SQLAlchemy)  (Database)│
└─────────────┘         └──────────────────┘         └─────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │  Redis Cache     │
                        │  (Optional)      │
                        └──────────────────┘
```

## Core Modules

### 1. Asset Management
- Track physical and digital assets
- Organize in hierarchies
- Monitor asset status and location
- Historical asset data

**API Routes**:
- `GET /api/v1/assets` - List assets
- `POST /api/v1/assets` - Create asset
- `GET /api/v1/assets/{id}` - Get asset
- `PUT /api/v1/assets/{id}` - Update asset

### 2. Maintenance Tracking
- Schedule preventive maintenance
- Log corrective maintenance
- Track costs and downtime
- Maintenance history per asset

### 3. Inventory Management
- Track spare parts
- Monitor stock levels
- Reorder alerts
- Supplier management

### 4. Fleet Management
- Track vehicles
- Fuel consumption
- Usage logs
- Efficiency metrics

### 5. Document Hub
- Upload and manage documents
- Link to assets
- Full-text search
- Access control

### 6. Analytics Dashboard
- Real-time KPIs
- Asset distribution
- Maintenance costs
- Fleet efficiency metrics

## File Structure

```
tgd-system/
├── backend/                      # FastAPI Application
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── repositories/        # Data access layer
│   │   ├── services/            # Business logic
│   │   └── api/routes/          # API endpoints
│   ├── requirements.txt          # Python dependencies
│   ├── seed_data.py             # Sample data generator
│   └── README.md                # Backend documentation
│
├── frontend/                     # React Application
│   ├── src/
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   ├── services/            # API services
│   │   ├── hooks/               # Custom hooks
│   │   └── styles/              # TailwindCSS styles
│   ├── package.json             # npm dependencies
│   ├── vite.config.js           # Vite configuration
│   └── README.md                # Frontend documentation
│
├── project-plan.md              # Detailed architecture
└── README.md                    # This file
```

## Common Tasks

### Adding a New Asset

1. **Via API**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/assets \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "New Machinery",
       "type": "machinery",
       "location": "Factory",
       "status": "active",
       "value": 50000
     }'
   ```

2. **Via UI**:
   - Click "Assets" in navigation
   - Click "Add Asset" button
   - Fill form and submit

### Creating Maintenance Log

1. Navigate to Maintenance page
2. Select asset
3. Choose maintenance type
4. Add details (cost, technician, downtime)
5. Save

### Managing Inventory

1. Go to Inventory page
2. Add items or update quantities
3. System alerts when below reorder level
4. Track supplier information

## API Authentication

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@tgd.com",
    "password": "admin@123456"
  }'
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Using Token

All subsequent requests:
```bash
curl http://localhost:8000/api/v1/assets \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## Database

### Initial Schema

The system comes with a complete schema for:
- Users and roles
- Assets and hierarchies
- Maintenance logs
- Inventory items
- Vehicles and usage logs
- Documents
- Sensor readings

### Sample Data

Run `python seed_data.py` to populate with demo data:
- 5 sample assets
- 3 test users
- Maintenance logs
- Inventory items
- Vehicles

## Troubleshooting

### Backend Won't Start

**Issue**: Port 8000 already in use
```bash
# Change port
uvicorn app.main:app --port 8001 --reload
```

**Issue**: Database connection error
```bash
# Check DATABASE_URL in .env
# Verify PostgreSQL is running
# Check credentials
```

### Frontend Won't Start

**Issue**: Port 5173 in use
```bash
# Change port in vite.config.js
npm run dev -- --port 3000
```

**Issue**: API connection failed
- Check backend is running
- Verify VITE_API_URL in .env
- Check CORS settings in backend

### Authentication Issues

**Issue**: Token expired
- Refresh using refresh token
- Re-login to get new tokens

**Issue**: Unauthorized 401
- Verify token in Authorization header
- Check token hasn't expired
- Verify user is active

## Next Steps

1. **Explore the API**:
   - Open http://localhost:8000/docs
   - Try different endpoints
   - Test filtering and pagination

2. **Customize**:
   - Modify schemas for custom fields
   - Add new asset types
   - Create custom reports

3. **Deploy**:
   - Configure production database
   - Set up environment variables
   - Deploy with Docker or cloud platform

4. **Integrate**:
   - Connect to IoT sensors
   - Integrate with ERP systems
   - Add email notifications

## Resources

- **Project Plan**: [project-plan.md](./project-plan.md)
- **Backend Docs**: [backend/README.md](./backend/README.md)
- **Frontend Docs**: [frontend/README.md](./frontend/README.md)
- **API Docs**: http://localhost:8000/docs

## Support & Contribution

For questions or contributions:
1. Check documentation
2. Review code comments
3. Contact support team

## License

Proprietary - All rights reserved

---

**Happy asset managing! 🚀**
