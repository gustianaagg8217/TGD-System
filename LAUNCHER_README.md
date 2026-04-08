# TGd System - One-Click Launcher

Launcher untuk menjalankan semua server (Backend, Frontend, Database) dengan satu klik.

## Cara Menggunakan

### Option 1: Double-Click BAT File (Paling Mudah)
1. Buka folder `D:\TDd_System`
2. Double-click file **`START_ALL.bat`**
3. Sistem akan otomatis:
   - ✅ Initialize database (jika belum ada)
   - ✅ Install frontend dependencies (jika belum ada)
   - ✅ Start Backend Server pada port 8000
   - ✅ Start Frontend Server pada port 5173
   - ✅ Buka browser otomatis ke UI

### Option 2: PowerShell Script
```powershell
cd D:\TDd_System
.\START_ALL.ps1
```

## Server yang Berjalan

| Service | URL | Port | Fungsi |
|---------|-----|------|--------|
| **Backend API** | http://localhost:8000 | 8000 | FastAPI Server |
| **API Docs** | http://localhost:8000/docs | 8000 | Swagger UI (test API) |
| **Frontend UI** | http://localhost:5173 | 5173 | React Dashboard |

## Default Credentials

```
Email:    admin@tgd.com
Password: admin@123456

Email:    engineer@tgd.com
Password: eng@123456

Email:    viewer@tgd.com
Password: view@123456
```

## Troubleshooting

### Error: "Python not found"
- Pastikan Python sudah installed: `python --version`
- Atau gunakan full path: `C:\Python311\python.exe`

### Error: "npm not found"
- Pastikan Node.js sudah installed: `npm --version`
- Download dari: https://nodejs.org/

### Error: "Port 8000 already in use"
- Tutup proses yang menggunakan port 8000
- Atau ubah port di `START_ALL.bat` (line dengan --port)

### Frontend tidak loading
- Tunggu sampai "npm run dev" selesai compile
- Check console di bagian "TGd Frontend Server" window
- Refresh browser dengan Ctrl+F5

## Manual Start (Jika Launcher Tidak Bekerja)

### Terminal 1: Backend
```bash
cd D:\TDd_System\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Terminal 2: Frontend
```bash
cd D:\TDd_System\frontend
npm run dev
```

### Terminal 3: Database (jika diperlukan)
```bash
cd D:\TDd_System\backend
python seed_data.py
```

## Struktur Project

```
TGd_System/
├── backend/              # FastAPI server
│   ├── app/             # Aplikasi FastAPI
│   ├── tgd_system_phase1.db  # Database SQLite
│   └── seed_data.py     # Database initialization
├── frontend/            # React dashboard
│   ├── src/             # Source code
│   └── package.json     # Dependencies
├── START_ALL.bat        # Launcher (Batch)
├── START_ALL.ps1        # Launcher (PowerShell)
└── docker-compose.yml   # Docker configuration
```

## Advanced: Docker Deployment

Untuk menjalankan dengan Docker Compose:
```bash
cd D:\TDd_System
docker-compose up -d
```

Services akan tersedia di:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

---

**Last Updated:** April 8, 2026
**System Version:** 1.0.0
