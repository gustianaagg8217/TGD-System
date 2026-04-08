# TGd System - Installation Guide

Complete step-by-step installation guide for setting up TGd System locally.

## Prerequisites

Before you begin, ensure you have:

- **Python 3.8 or higher**
  - Download from https://www.python.org/
  - Add to PATH during installation

- **Node.js 16 or higher (with npm)**
  - Download from https://nodejs.org/
  - Verify: `node --version` and `npm --version`

- **PostgreSQL 12 or higher**
  - Download from https://www.postgresql.org/
  - Verify: `psql --version`

- **Git** (optional, for version control)
  - Download from https://git-scm.com/

- **Text Editor or IDE**
  - Visual Studio Code (recommended)
  - PyCharm
  - WebStorm
  - Or any editor of your choice

## Installation Steps

### Option 1: Automated Setup (Windows)

1. **Download and extract** the TGd System
2. **Double-click** `setup.bat` in the root directory
3. **Follow the prompts** and wait for completion
4. **Edit** `backend/.env` with your database credentials

**Estimated time: 3-5 minutes**

### Option 2: Automated Setup (Linux/macOS)

1. **Download and extract** the TGd System
2. **Run** `chmod +x setup.sh` to make script executable
3. **Execute** `./setup.sh` from the root directory
4. **Follow the prompts** and wait for completion
5. **Edit** `backend/.env` with your database credentials

**Estimated time: 3-5 minutes**

### Option 3: Manual Setup (All Platforms)

#### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Edit .env with your database settings
# Update: DATABASE_URL with your PostgreSQL connection

# Initialize database with sample data
python seed_data.py

# Start the backend server
uvicorn app.main:app --reload
```

The backend will start at `http://localhost:8000`

#### Step 2: Frontend Setup (New Terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Database Setup

### Using PostgreSQL locally

1. **Install PostgreSQL** (if not already installed)

2. **Create database and user**:
   ```sql
   -- Connect to PostgreSQL as admin
   -- Then run:
   
   CREATE USER tgd_user WITH PASSWORD 'tgd_password';
   CREATE DATABASE tgd_system OWNER tgd_user;
   GRANT ALL PRIVILEGES ON DATABASE tgd_system TO tgd_user;
   ```

3. **Update .env**:
   ```env
   DATABASE_URL=postgresql://tgd_user:tgd_password@localhost:5432/tgd_system
   ```

4. **Run seed script**:
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   python seed_data.py
   ```

### Using Docker PostgreSQL (Alternative)

```bash
# Run PostgreSQL in Docker
docker run \
  --name tgd-postgres \
  -e POSTGRES_USER=tgd_user \
  -e POSTGRES_PASSWORD=tgd_password \
  -e POSTGRES_DB=tgd_system \
  -p 5432:5432 \
  postgres:15-alpine
```

## Verification

### Backend Verification

1. **Check server is running**:
   ```bash
   curl http://localhost:8000/health
   ```
   
   Expected response: `{"status": "ok"}`

2. **View API Documentation**:
   - Open http://localhost:8000/docs
   - You should see the interactive Swagger UI

3. **Test API endpoint**:
   ```bash
   curl http://localhost:8000/api/v1/
   ```

### Frontend Verification

1. **Check app is loaded**:
   - Open http://localhost:5173 in browser
   - You should see the login page

2. **Try login with default credentials**:
   - Email: `admin@tgd.com`
   - Password: `admin@123456`

3. **Navigate to Dashboard**:
   - Click "Dashboard" in sidebar
   - Should show overview with sample data

## Troubleshooting

### Python Issues

**Error: "python command not found"**
- Install Python from https://www.python.org/
- Add Python to PATH
- Restart terminal/IDE

**Error: "No module named 'app'"**
- Ensure you're in the `backend` directory
- Activate virtual environment
- Reinstall requirements: `pip install -r requirements.txt`

### Node.js Issues

**Error: "npm command not found"**
- Install Node.js from https://nodejs.org/
- Restart terminal/IDE

**Error: Module not found**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

### Database Issues

**Error: "Connection refused" to PostgreSQL**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists: `psql -U tgd_user -d tgd_system`

**Error: "relation does not exist"**
- Run seed script: `python seed_data.py`
- Or use Alembic migrations (if set up)

### API Connection Issues

**Error: "Cannot POST /api/v1/auth/login"**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/config.py`
- Verify frontend API URL in `frontend/.env`

**Fix**: Update frontend `.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Port Already in Use

**Error: "Address already in use"**

Kill existing process (Windows):
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Or change port (Linux/macOS):
```bash
uvicorn app.main:app --port 8001 --reload
```

## Default Credentials

The seed script creates three test users:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@tgd.com | admin@123456 | Admin | Full system access |
| engineer@tgd.com | eng@123456 | Engineer | Asset and maintenance access |
| viewer@tgd.com | view@123456 | Viewer | Read-only access |

## Next Steps

1. **Explore the Dashboard**
   - View asset overview
   - Check maintenance logs
   - See inventory status

2. **Create Your Own Data**
   - Add assets
   - Log maintenance operations
   - Manage inventory

3. **Customize Configuration**
   - Edit `backend/.env` for settings
   - Modify `frontend/.env` for frontend config
   - Check `backend/app/config.py` for all options

4. **Review Documentation**
   - Backend: [backend/README.md](../backend/README.md)
   - Frontend: [frontend/README.md](../frontend/README.md)
   - Architecture: [project-plan.md](../project-plan.md)

5. **Deploy to Production**
   - Configure production database
   - Generate secure SECRET_KEY
   - Set ENVIRONMENT=production
   - Use environment-specific configurations
   - Deploy with Docker or cloud platform

## Getting Help

If you encounter issues:

1. **Check the logs**:
   ```bash
   # Terminal output shows detailed errors
   # Check backend: logs/tdd_system.log (if configured)
   # Check frontend: Browser console (F12)
   ```

2. **Review Documentation**:
   - This installation guide
   - Backend README
   - Frontend README
   - Code comments

3. **Test API Endpoints**:
   - Go to http://localhost:8000/docs
   - Try endpoints manually
   - Check response status and error messages

4. **Common Fixes**:
   1. Restart both frontend and backend servers
   2. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
   3. Delete and reinstall dependencies
   4. Check environment variables are set correctly

## System Requirements Summary

| Component | Requirement |
|-----------|-------------|
| Python | 3.8+ |
| Node.js | 16+ |
| PostgreSQL | 12+ |
| RAM | 2+ GB |
| Disk Space | 500 MB+ |
| Browser | Modern (Chrome, Firefox, Safari, Edge) |

## Development Workflow

### Making Changes

**Backend**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
# Make code changes
# Server auto-reloads with --reload flag
```

**Frontend**:
```bash
cd frontend
# Make code changes
# Browser automatically hot-reloads
```

### Testing

```bash
# Backend (when available)
cd backend
pytest

# Frontend (when available)
cd frontend
npm test
```

### Code Formatting

```bash
# Backend
cd backend
pip install black isort
black app/
isort app/

# Frontend
cd frontend
npm run format
npm run lint
```

## Performance Tips

1. **Use production builds** for final deployment
2. **Enable caching** with Redis for better performance
3. **Optimize database queries** with proper indexing
4. **Use CDN** for static assets in production
5. **Monitor logs** for performance issues

## Security Checklist

Before deploying to production:

- [ ] Change all default credentials
- [ ] Generate new SECRET_KEY (random 32+ chars)
- [ ] Set ENVIRONMENT=production
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Review CORS settings
- [ ] Use environment secrets (not in .env)
- [ ] Keep dependencies updated

## Support

For additional help:
- Review code comments and docstrings
- Check API documentation at http://localhost:8000/docs
- Refer to [project-plan.md](../project-plan.md)

---

**Happy coding! 🚀**
