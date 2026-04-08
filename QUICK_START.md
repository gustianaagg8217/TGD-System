# TGd System - Quick Start Guide

Get TGd System running in 5 minutes! This is the fastest way to get started.

## Prerequisites Check

Ensure you have:
- ✅ Python 3.11+
- ✅ Node.js 16+
- ✅ PostgreSQL 12+ (or Docker)

## Step 1: Start PostgreSQL

### Option A: Using Docker (Easiest)
```bash
docker run \
  --name tgd-postgres \
  -e POSTGRES_USER=tgd_user \
  -e POSTGRES_PASSWORD=tgd_password \
  -e POSTGRES_DB=tgd_system \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### Option B: Using Local PostgreSQL
Start your PostgreSQL service, then create the database:
```sql
CREATE USER tgd_user WITH PASSWORD 'tgd_password';
CREATE DATABASE tgd_system OWNER tgd_user;
```

## Step 2: Backend Setup (Terminal 1)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows: or use source venv/bin/activate on Mac/Linux

pip install -r requirements.txt
cp .env.example .env

# Create and seed database
python seed_data.py

# Start backend
uvicorn app.main:app --reload
```

**Backend ready at:** http://localhost:8000

## Step 3: Frontend Setup (Terminal 2)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Frontend ready at:** http://localhost:5173

## Step 4: Login & Explore

1. Open http://localhost:5173
2. Login with: `admin@tgd.com` / `admin@123456`
3. View the Dashboard with sample data

## What's Included?

✅ **Sample Data:**
- 5 assets (machinery, vehicles, equipment)
- 3 test users (admin, engineer, viewer)
- Maintenance logs, inventory, vehicles
- Sensor readings

✅ **API Documentation:**
- Interactive Swagger UI at http://localhost:8000/docs
- ReDoc at http://localhost:8000/redoc

✅ **Features:**
- Asset management & hierarchy
- Maintenance tracking
- Inventory management
- Fleet management
- Role-based access control

## Common Issues

### Database Connection Error
- Verify PostgreSQL is running
- Check `.env` DATABASE_URL is correct
- Try: `psql -U tgd_user -d tgd_system` to test

### Port Already in Use
```bash
# Kill existing process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different port
uvicorn app.main:app --port 8001 --reload
```

### Dependencies Error
```bash
# Reinstall
pip install --upgrade -r requirements.txt
npm install
```

## Test Default Users

| Email | Password | Role |
|-------|----------|------|
| admin@tgd.com | admin@123456 | Admin |
| engineer@tgd.com | eng@123456 | Engineer |
| viewer@tgd.com | view@123456 | Viewer |

## API Examples

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@tgd.com","password":"admin@123456"}'
```

### List Assets
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/assets
```

### Dashboard Overview
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/dashboard/overview
```

## Next Steps

1. **Explore API**: Visit http://localhost:8000/docs
2. **Create Assets**: Use the dashboard to add new assets
3. **Review Code**: Check `backend/app/` and `frontend/src/`
4. **Customize**: Edit configs in `backend/.env`
5. **Deploy**: Follow deployment guide in [INSTALLATION.md](./INSTALLATION.md)

## Documentation

- [Main README](./README.md) - System overview
- [Installation Guide](./INSTALLATION.md) - Detailed setup
- [Backend README](./backend/README.md) - API & architecture
- [Frontend README](./frontend/README.md) - UI & components
- [Project Plan](./project-plan.md) - Full specifications

## Support

- API Docs: http://localhost:8000/docs
- Issues: Check terminal logs
- Database: Run `python seed_data.py` again to reset

---

**Happy coding! 🚀**

For detailed information, see [README.md](./README.md)
