# TGd System - Tin Grid Data System
## Enterprise-Grade Asset Monitoring & Management Platform

**Version**: 1.0.0  
**Status**: In Development  
**Last Updated**: 2026-04-05

---

## 📋 EXECUTIVE SUMMARY

TGd System is a scalable, enterprise-grade web application for grid-based asset monitoring and management. Designed for industrial use (mining, manufacturing, logistics), it provides real-time asset tracking, maintenance intelligence, inventory management, and analytics.

---

## 🎯 CORE REQUIREMENTS

The system must:
- ✅ Manage physical and digital assets with hierarchical relationships
- ✅ Support real-time monitoring via WebSocket (optional enhancements)
- ✅ Be modular and scalable (clean layered architecture)
- ✅ Implement separation of concerns (API/Service/Repository/Model layers)
- ✅ Be production-ready with proper error handling and logging
- ✅ Support role-based access control (Admin, Engineer, Viewer)
- ✅ Provide pagination, filtering, and advanced search
- ✅ Include comprehensive API documentation

---

## 🛠 TECH STACK

### Backend
- **Framework**: Python FastAPI (async-ready)
- **Database**: PostgreSQL 12+
- **ORM**: SQLAlchemy 2.0
- **Caching**: Redis
- **Authentication**: JWT (PyJWT)
- **Validation**: Pydantic v2
- **API Documentation**: Auto-generated OpenAPI/Swagger

### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: TailwindCSS 3+
- **HTTP Client**: Axios
- **State Management**: React Context / Zustand (if needed)
- **Charts**: Recharts or Chart.js
- **Form Handling**: React Hook Form + Zod

### DevOps (Optional)
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- PostgreSQL Docker image
- Redis Docker image

---

## 🏗 SYSTEM ARCHITECTURE

### Layered Architecture Pattern

```
┌─────────────────────────────────────┐
│  API Layer (Routes/Controllers)     │ ← FastAPI Routers
├─────────────────────────────────────┤
│  Service Layer (Business Logic)     │ ← Business rules, validation
├─────────────────────────────────────┤
│  Repository Layer (Data Access)     │ ← Database queries
├─────────────────────────────────────┤
│  Models (ORM / SQLAlchemy)          │ ← Database schema
├─────────────────────────────────────┤
│  Schemas (Pydantic)                 │ ← Request/Response validation
├─────────────────────────────────────┤
│  Database (PostgreSQL)              │ ← Persistent storage
└─────────────────────────────────────┘
```

### Key Design Principles
- **Dependency Injection**: Services receive repositories as dependencies
- **Single Responsibility**: Each layer has one reason to change
- **Testability**: Repositories can be mocked for unit tests
- **Scalability**: Stateless API design, horizontal scaling ready

---

## 📦 MAIN MODULES

### 1. **Asset Grid Registry**
**Purpose**: Core CRUD operations for physical and digital assets

**Fields**:
- `id`: UUID (Primary Key)
- `name`: String (Required)
- `type`: Enum (Machinery, Vehicle, Facility, Equipment, etc.)
- `location`: String (Grid location/warehouse)
- `status`: Enum (Active, Inactive, Maintenance, Retired)
- `acquisition_date`: DateTime
- `value`: Decimal (Asset value in currency)
- `parent_asset_id`: UUID (Optional, for hierarchy)
- `metadata`: JSON (Extensible custom fields)
- `created_at`, `updated_at`: Timestamps

**Operations**:
- Create, Read, Update, Delete assets
- Support asset hierarchy (parent-child relationships)
- Bulk operations
- Advanced filtering & search

---

### 2. **Maintenance Intelligence**
**Purpose**: Track and schedule preventive & corrective maintenance

**Fields**:
- `id`: UUID
- `asset_id`: UUID (FK)
- `maintenance_type`: Enum (Preventive, Corrective, Inspection)
- `date`: DateTime
- `technician`: String
- `cost`: Decimal
- `downtime`: Integer (minutes)
- `description`: Text
- `status`: Enum (Scheduled, In-Progress, Completed, Cancelled)
- `next_maintenance_date`: DateTime (Optional)

**Operations**:
- Schedule maintenance
- Log maintenance events
- Generate maintenance statistics
- Maintenance history reports

---

### 3. **Smart Inventory**
**Purpose**: Track spare parts and inventory levels

**Fields**:
- `id`: UUID
- `item_code`: String (Unique SKU)
- `name`: String
- `quantity`: Integer
- `reorder_level`: Integer
- `supplier`: String
- `price`: Decimal
- `category`: Enum
- `location`: String (Warehouse bin)
- `last_restock_date`: DateTime

**Operations**:
- CRUD inventory items
- Stock level alerts when below reorder level
- Inventory movements (add/remove)
- Low stock notifications

---

### 4. **Fleet Insight**
**Purpose**: Track vehicles and usage patterns

**Fields**:
- `id`: UUID
- `vehicle_type`: Enum (Truck, Car, Forklift, etc.)
- `registration_number`: String (Unique)
- `model`: String
- `fuel_type`: Enum (Diesel, Petrol, Electric)
- `current_mileage`: Float
- `fuel_capacity`: Float
- `status`: Enum (Active, Idle, Maintenance)

**Sub-module: Usage Logs**
- `id`: UUID
- `vehicle_id`: UUID (FK)
- `date`: DateTime
- `fuel_used`: Float
- `distance`: Float
- `driver`: String
- `trip_purpose`: String

---

### 5. **Document Hub**
**Purpose**: Upload, manage, and link documents to assets

**Fields**:
- `id`: UUID
- `asset_id`: UUID (FK, Optional)
- `file_name`: String
- `file_type`: Enum (PDF, Image, Document, etc.)
- `file_size`: Integer (bytes)
- `s3_url`: String (Cloud storage reference)
- `uploaded_by`: UUID (FK to User)
- `uploaded_date`: DateTime
- `description`: Text (Optional)
- `tags`: Array[String]

**Operations**:
- Upload documents
- Link documents to assets
- Search/filter by tags
- Delete documents (soft delete with audit trail)

---

### 6. **IoT & Sensor Engine**
**Purpose**: Simulate and process sensor data (extensible for real IoT)

**Fields**:
- `id`: UUID
- `asset_id`: UUID (FK)
- `sensor_type`: Enum (Temperature, Vibration, Pressure, Humidity)
- `reading_value`: Float
- `unit`: String (°C, g, PSI, %, etc.)
- `timestamp`: DateTime
- `status`: Enum (Normal, Warning, Critical)
- `threshold_high`: Float (Optional)
- `threshold_low`: Float (Optional)

**Features**:
- Mock sensor data generation
- Threshold-based alerts
- Sensor data aggregation
- Historical tracking

---

### 7. **Analytics Dashboard**
**Purpose**: Real-time insights and KPIs

**Metrics Tracked**:
- Total assets (by type, status)
- Active vs inactive assets
- Maintenance count (pending, completed this month)
- Downtime summary (by asset, by cause)
- Inventory status (low stock items)
- Fleet efficiency (fuel efficiency, mileage)
- Maintenance cost trends
- Asset utilization rates

---

### 8. **User & Role Management**
**Purpose**: Authentication, authorization, and user management

**Roles**:
- `Admin`: Full system access, user management, settings
- `Engineer`: Asset/maintenance management, read-only reports
- `Viewer`: Read-only access to dashboard and reports

**User Fields**:
- `id`: UUID
- `username`: String (Unique)
- `email`: String (Unique)
- `password_hash`: String (bcrypt)
- `full_name`: String
- `role_id`: UUID (FK)
- `is_active`: Boolean
- `last_login`: DateTime
- `created_at`, `updated_at`: Timestamps

**Features**:
- JWT token-based authentication
- Password hashing (bcrypt)
- Token refresh mechanism
- Role-based access control (RBAC)
- Audit logging for sensitive operations

---

## 🗄 DATABASE DESIGN

### Tables & Relationships

```sql
users
├── id (UUID, PK)
├── username (VARCHAR, UNIQUE)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── full_name (VARCHAR)
├── role_id (UUID, FK → roles.id)
├── is_active (BOOLEAN)
├── last_login (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

roles
├── id (UUID, PK)
├── name (VARCHAR, UNIQUE) → Admin, Engineer, Viewer
├── permissions (JSON)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

assets
├── id (UUID, PK)
├── name (VARCHAR)
├── type (VARCHAR) → Machinery, Vehicle, Equipment, etc.
├── location (VARCHAR)
├── status (VARCHAR) → Active, Inactive, Maintenance
├── acquisition_date (TIMESTAMP)
├── value (DECIMAL)
├── parent_asset_id (UUID, FK → assets.id)
├── metadata (JSONB)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID, FK → users.id)

maintenance_logs
├── id (UUID, PK)
├── asset_id (UUID, FK → assets.id)
├── maintenance_type (VARCHAR) → Preventive, Corrective
├── date (TIMESTAMP)
├── technician (VARCHAR)
├── cost (DECIMAL)
├── downtime (INTEGER)
├── description (TEXT)
├── status (VARCHAR)
├── next_maintenance_date (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

inventory_items
├── id (UUID, PK)
├── item_code (VARCHAR, UNIQUE)
├── name (VARCHAR)
├── quantity (INTEGER)
├── reorder_level (INTEGER)
├── supplier (VARCHAR)
├── price (DECIMAL)
├── category (VARCHAR)
├── location (VARCHAR)
├── last_restock_date (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

vehicles
├── id (UUID, PK)
├── vehicle_type (VARCHAR)
├── registration_number (VARCHAR, UNIQUE)
├── model (VARCHAR)
├── fuel_type (VARCHAR)
├── current_mileage (FLOAT)
├── fuel_capacity (FLOAT)
├── status (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

vehicle_usage_logs
├── id (UUID, PK)
├── vehicle_id (UUID, FK → vehicles.id)
├── date (TIMESTAMP)
├── fuel_used (FLOAT)
├── distance (FLOAT)
├── driver (VARCHAR)
├── trip_purpose (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

documents
├── id (UUID, PK)
├── asset_id (UUID, FK → assets.id, NULLABLE)
├── file_name (VARCHAR)
├── file_type (VARCHAR)
├── file_size (INTEGER)
├── s3_url (VARCHAR)
├── uploaded_by (UUID, FK → users.id)
├── uploaded_date (TIMESTAMP)
├── description (TEXT)
├── tags (TEXT[])
├── is_deleted (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

sensor_logs
├── id (UUID, PK)
├── asset_id (UUID, FK → assets.id)
├── sensor_type (VARCHAR) → Temperature, Vibration, etc.
├── reading_value (FLOAT)
├── unit (VARCHAR)
├── timestamp (TIMESTAMP)
├── status (VARCHAR) → Normal, Warning, Critical
├── threshold_high (FLOAT)
├── threshold_low (FLOAT)
└── created_at (TIMESTAMP)
```

### Key Constraints
- Foreign Key Relationships: Referential integrity
- Unique Constraints: username, email, item_code, registration_number
- Check Constraints: quantity ≥ 0, price ≥ 0, value ≥ 0
- Indexes: On frequently queried columns (asset_id, user_id, created_at)
- Timestamps: All tables have created_at & updated_at with defaults

---

## 🔌 API FEATURES

### RESTful API Conventions

```
Assets:
  POST   /api/v1/assets                    → Create asset
  GET    /api/v1/assets                    → List assets (paginated, filtered)
  GET    /api/v1/assets/{id}               → Get asset details
  PUT    /api/v1/assets/{id}               → Update asset
  DELETE /api/v1/assets/{id}               → Delete asset
  GET    /api/v1/assets/{id}/hierarchy     → Get asset hierarchy
  GET    /api/v1/assets/{id}/maintenance   → Get asset maintenance history

Maintenance:
  POST   /api/v1/maintenance               → Schedule maintenance
  GET    /api/v1/maintenance               → List maintenance logs
  PUT    /api/v1/maintenance/{id}          → Update maintenance log
  
Inventory:
  POST   /api/v1/inventory                 → Create inventory item
  GET    /api/v1/inventory                 → List inventory
  GET    /api/v1/inventory/low-stock       → List low stock items
  
Fleet:
  POST   /api/v1/vehicles                  → Add vehicle
  GET    /api/v1/vehicles                  → List vehicles
  POST   /api/v1/vehicles/{id}/usage-logs  → Log vehicle usage
  
Documents:
  POST   /api/v1/documents                 → Upload document
  GET    /api/v1/documents                 → List documents
  DELETE /api/v1/documents/{id}            → Delete document
  
Sensors:
  POST   /api/v1/sensors/readings          → Record sensor reading
  GET    /api/v1/sensors/readings          → Get recent readings
  
Auth:
  POST   /api/v1/auth/register             → Register user
  POST   /api/v1/auth/login                → Login (JWT token)
  POST   /api/v1/auth/refresh              → Refresh token
  
Dashboard:
  GET    /api/v1/dashboard/overview        → Get dashboard stats
```

### Advanced Features
- **Pagination**: limit, offset query parameters
- **Filtering**: status=active, type=machinery, etc.
- **Sorting**: sort=-created_at (descending)
- **Search**: q parameter for full-text search
- **Error Handling**: Standardized error responses with codes
- **Validation**: Pydantic schemas for request validation
- **Rate Limiting**: Optional (token bucket algorithm)

---

## 🎨 FRONTEND FEATURES

### Pages
| Page | Purpose | Features |
|------|---------|----------|
| Dashboard | Overview & KPIs | Stats cards, charts, alerts |
| Assets | Asset management | CRUD grid, hierarchy view, search |
| Maintenance | Maintenance tracking | Schedule, logs, history, reports |
| Inventory | Stock management | Item list, low stock alerts, reorder |
| Fleet | Vehicle tracking | Vehicle list, usage logs, reports |
| Documents | Document management | Upload, organize, link to assets |
| Users | User & role management | (Admin only) Create/edit users |
| Settings | System configuration | (Admin only) System settings |

### Key Components
- **Data Table**: Sortable, filterable, paginated grid
- **Forms**: CRUD forms with validation feedback
- **Charts**: Dashboard KPI visualizations
- **Modal Dialogs**: Confirmations, forms
- **Alerts**: Toast notifications for actions
- **Search Bar**: Global search across assets
- **Role-Based UI**: Show/hide features based on user role

### UI/UX Features
- Responsive design (mobile-friendly)
- Dark mode toggle (optional)
- Loading states and skeleton screens
- Error messages with helpful hints
- Success confirmations
- Undo/redo capabilities (optional)
- Keyboard shortcuts (optional)

---

## 📁 FOLDER STRUCTURE

### Backend Structure
```
tdd-system-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                      ← FastAPI app entry point
│   ├── config.py                    ← Configuration (env-based)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py              ← JWT, password hashing
│   │   ├── constants.py             ← App constants
│   │   └── exceptions.py            ← Custom exceptions
│   ├── models/                      ← SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── asset.py
│   │   ├── maintenance.py
│   │   ├── inventory.py
│   │   ├── vehicle.py
│   │   ├── document.py
│   │   └── sensor.py
│   ├── schemas/                     ← Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── asset.py
│   │   ├── maintenance.py
│   │   └── common.py                ← Pagination, filters
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/                  ← API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── assets.py
│   │   │   ├── maintenance.py
│   │   │   ├── inventory.py
│   │   │   ├── vehicles.py
│   │   │   ├── documents.py
│   │   │   ├── sensors.py
│   │   │   └── dashboard.py
│   │   └── deps.py                  ← Dependency injection
│   ├── services/                    ← Business logic layer
│   │   ├── __init__.py
│   │   ├── asset_service.py
│   │   ├── maintenance_service.py
│   │   ├── inventory_service.py
│   │   ├── vehicle_service.py
│   │   └── auth_service.py
│   ├── repositories/                ← Data access layer
│   │   ├── __init__.py
│   │   ├── base.py                  ← Base repository (CRUD generic)
│   │   ├── asset_repository.py
│   │   ├── maintenance_repository.py
│   │   ├── inventory_repository.py
│   │   └── user_repository.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py               ← Database session management
│   │   ├── base.py                  ← Base model class
│   │   └── migrations/              ← Alembic migrations
│   └── utils/
│       ├── __init__.py
│       ├── logger.py
│       ├── validators.py
│       └── helpers.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py                  ← Pytest fixtures
│   ├── test_assets.py
│   ├── test_auth.py
│   └── test_services/
├── requirements.txt                 ← Dependencies (pip)
├── .env.example                     ← Environment template
├── docker-compose.yml               ← Docker services
├── Dockerfile                       ← Backend container
├── alembic.ini                      ← Database migration config
└── README.md
```

### Frontend Structure
```
tdd-system-frontend/
├── src/
│   ├── index.jsx                    ← React entry point
│   ├── App.jsx                      ← Root component
│   ├── pages/                       ← Page components
│   │   ├── Dashboard.jsx
│   │   ├── AssetsPage.jsx
│   │   ├── MaintenancePage.jsx
│   │   ├── InventoryPage.jsx
│   │   ├── FleetPage.jsx
│   │   ├── DocumentsPage.jsx
│   │   ├── UsersPage.jsx
│   │   └── LoginPage.jsx
│   ├── components/                  ← Reusable components
│   │   ├── common/
│   │   │   ├── DataTable.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Loading.jsx
│   │   ├── forms/
│   │   │   ├── AssetForm.jsx
│   │   │   ├── MaintenanceForm.jsx
│   │   │   └── InventoryForm.jsx
│   │   ├── charts/
│   │   │   ├── AssetChart.jsx
│   │   │   ├── MaintenanceChart.jsx
│   │   │   └── InventoryChart.jsx
│   │   └── alerts/
│   │       ├── Toast.jsx
│   │       └── AlertBanner.jsx
│   ├── services/                    ← API calls (Axios)
│   │   ├── api.js                   ← Axios instance
│   │   ├── assetService.js
│   │   ├── maintenanceService.js
│   │   ├── authService.js
│   │   └── dashboardService.js
│   ├── hooks/                       ← Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   └── useForm.js
│   ├── context/                     ← React Context (Auth, Theme)
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── layouts/                     ← Layout components
│   │   ├── MainLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   └── AdminLayout.jsx
│   ├── styles/                      ← Global styles
│   │   ├── tailwind.config.js
│   │   └── globals.css
│   ├── utils/                       ← Helper functions
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── constants.js
│   └── assets/                      ← Static files (images, icons)
├── public/                          ← Public static files
├── package.json                     ← NPM dependencies
├── vite.config.js                   ← Vite configuration
├── tailwind.config.js               ← TailwindCSS config
└── README.md
```

---

## 📊 IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (FastAPI, React, PostgreSQL)
- [ ] Database schema & migrations
- [ ] User authentication (JWT)
- [ ] Base repository pattern
- [ ] API scaffolding

### Phase 2: Core Modules (Week 3-4)
- [ ] Asset management module
- [ ] Maintenance tracking module
- [ ] Inventory management module
- [ ] Basic API endpoints

### Phase 3: Advanced Features (Week 5-6)
- [ ] Fleet management
- [ ] Document hub
- [ ] Sensor simulation
- [ ] Analytics dashboard

### Phase 4: Frontend (Week 7-8)
- [ ] React UI components
- [ ] Dashboard & pages
- [ ] Forms & CRUD operations
- [ ] Charts & visualizations

### Phase 5: Polish & Deployment (Week 9-10)
- [ ] Testing (unit, integration)
- [ ] Docker setup
- [ ] Documentation
- [ ] Performance optimization

---

## 🚀 QUICK START (Post-Setup)

### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### Docker (All-in-One)
```bash
docker-compose up -d
```

---

## 📚 API DOCUMENTATION

Auto-generated Swagger UI:
- **Swagger**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## ✅ SUCCESS CRITERIA

The system is production-ready when:
- [ ] All CRUD operations work correctly
- [ ] Authentication & authorization enforced
- [ ] Pagination & filtering working
- [ ] Database transactions secure
- [ ] Error handling standardized
- [ ] API documented (OpenAPI/Swagger)
- [ ] Frontend responsive & accessible
- [ ] Docker build passes
- [ ] Unit tests coverage ≥ 80%
- [ ] No security vulnerabilities (SQL injection, XSS)

---

## 📝 NOTES

- This is a **production-ready structure**, not a prototype
- Code follows **SOLID principles** and **clean architecture**
- All modules are **loosely coupled** for scalability
- Database design supports **future enhancements**
- Frontend is **responsive** and **role-aware**
- System is **horizontally scalable** with proper stateless design

---

*Generated: 2026-04-05 | Project: TGd System v1.0.0*
