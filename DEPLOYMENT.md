# TGd System - Deployment Guide

## Overview

This guide covers deploying the TGd System (Phase 5) using Docker and Docker Compose. The system consists of:

- **Backend**: FastAPI application with real-time WebSocket, REST APIs
- **Frontend**: React application with real-time sensor monitoring
- **Database**: PostgreSQL for persistent storage
- **Cache**: Redis for caching and session management
- **MQTT**: Mosquitto broker for IoT sensor data ingestion
- **Adapters**: MQTT and Modbus TCP adapters for industrial sensor integration

## Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- At least 4GB RAM available
- Ports 3000, 8000, 5432, 6379, 1883 available

### Option 1: Development with Docker Compose (Recommended for Starting)

```bash
# Clone or navigate to repository
cd d:\TDd_System

# Create .env file from template
copy .env.example .env

# Edit .env if needed (optional - defaults work for local dev)
# nano .env  (or use your editor)

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Backend Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MQTT**: localhost:1883

### Option 2: Production Deployment

For production deployment, you'll want to use:

```yaml
# Key changes for production:
# 1. Use external managed databases (AWS RDS, DigitalOcean, etc.)
# 2. Enable authentication for MQTT
# 3. Use environment-specific .env files
# 4. Set DEBUG=false
# 5. Use strong SECRET_KEY
# 6. Configure proper CORS_ORIGINS for your domain
# 7. Use SSL/TLS certificates (Nginx reverse proxy)
```

## Detailed Setup

### 1. Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Key variables:

```env
# Database (use managed service in production)
DATABASE_URL=postgresql://user:password@postgres:5432/tgd_system

# Security (CHANGE IN PRODUCTION!)
SECRET_KEY=your-very-long-secret-key-min-32-chars

# CORS for your domain
CORS_ORIGINS=["https://yourdomain.com"]

# MQTT
MQTT_BROKER_HOST=mqtt
MQTT_BROKER_PORT=1883

# Modbus
MODBUS_ENABLED=true
MODBUS_HOST=modbus-simulator
```

### 2. Database Initialization

Migrations run automatically on first backend startup. To manually run migrations:

```bash
# Get into backend container
docker-compose exec backend /bin/bash

# Run Alembic migrations
alembic upgrade head

# Seed initial data (if available)
python -m app.seed_data
```

### 3. MQTT Broker Setup

Mosquitto configuration is at `mqtt/mosquitto.conf`. To enable authentication:

```bash
# Create password file
docker-compose exec mqtt mosquitto_passwd -c /mosquitto/config/passwd user password

# Update mosquitto.conf:
# allow_anonymous false
# password_file /mosquitto/config/passwd
```

### 4. Adapter Configuration

Edit `adapters_config.json` to configure MQTT subscriptions and Modbus mappings:

```json
{
  "mqtt": {
    "enabled": true,
    "broker_host": "mqtt",
    "subscriptions": [
      {
        "topic": "sensors/factory1/temperature",
        "asset_id": "asset-1",
        "sensor_type": "temperature"
      }
    ]
  },
  "modbus": {
    "enabled": true,
    "host": "modbus-simulator",
    "mappings": [
      {
        "register_address": 0,
        "asset_id": "asset-1",
        "sensor_type": "temperature",
        "data_type": "float32"
      }
    ]
  }
}
```

## Managing Services

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Access Containers

```bash
# Backend
docker-compose exec backend /bin/bash

# Database
docker-compose exec postgres psql -U tgd_user -d tgd_system

# MQTT
docker-compose exec mqtt /bin/sh
```

### Restart Services

```bash
# Single service
docker-compose restart backend

# All services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

### View Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U tgd_user -d tgd_system

# List tables
\dt

# Query sensor readings
SELECT asset_id, sensor_type, reading_value, timestamp 
FROM sensor_readings 
ORDER BY timestamp DESC 
LIMIT 20;
```

## Monitoring

### Health Checks

All services have built-in health checks. View status:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:8000/health
```

### Performance Monitoring

```bash
# CPU, Memory usage
docker stats

# View resource limits (if set)
docker inspect <container_name> | grep -i cpus
```

## Development Workflow

### Local Development (without Docker)

If you prefer local development without containers:

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python run_server.py

# Frontend (in separate terminal)
cd frontend
npm install
npm run dev
```

### Debugging

```bash
# Add breakpoint in Python code
import pdb; pdb.set_trace()

# Then in container shell
docker-compose exec backend python run_server.py

# Or use VS Code debugger (see .vscode/launch.json)
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Verify ports are not in use
netstat -an | grep :8000
netstat -an | grep :3000

# Check disk space
docker system df
```

### Database connection errors
```bash
# Verify postgres is healthy
docker-compose ps postgres

# Check if migrations ran
docker-compose logs postgres | grep "ready to accept"

# Manual migration
docker-compose exec backend alembic upgrade head
```

### MQTT not receiving data
```bash
# Check Mosquitto logs
docker-compose logs mqtt

# Test MQTT connection
docker-compose exec mqtt mosquitto_sub -h localhost -t "#"

# Publish test message
docker-compose exec mqtt mosquitto_pub -h localhost -t "sensors/test" -m "test"
```

### Frontend can't connect to backend
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check CORS configuration in .env
CORS_ORIGINS should include frontend URL

# Check browser console for CORS errors
# Clear browser cache and cookies
```

## Production Checklist

- [ ] Change `SECRET_KEY` to a secure random string (min 32 chars)
- [ ] Set `DEBUG=false`
- [ ] Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
- [ ] Use managed Redis (AWS ElastiCache, etc.)
- [ ] Enable HTTPS with proper SSL certificates
- [ ] Configure domain in `CORS_ORIGINS`
- [ ] Set strong passwords for all services
- [ ] Enable MQTT authentication
- [ ] Set up automated backups for database
- [ ] Enable logging to ELK/Datadog/etc
- [ ] Set up monitoring and alerting
- [ ] Test disaster recovery procedures
- [ ] Document any customizations

## Scaling

### Horizontal Scaling

For production with multiple instances:

```yaml
# Use load balancer (Nginx, HAProxy, etc)
# Point to multiple backend instances
backend1, backend2, backend3 -> Load Balancer -> PostgreSQL
```

### Vertical Scaling

Increase container resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

## Backup & Recovery

### Database Backup

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U tgd_user -d tgd_system > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U tgd_user -d tgd_system < backup.sql
```

### Persistent Volumes

All data is stored in Docker volumes:
- `postgres_data`: Database files
- `redis_data`: Cache data
- `mqtt_data`: MQTT message persistence

To backup volumes:

```bash
# List volumes
docker volume ls

# Inspect volume location
docker volume inspect tgd_postgres_data
```

## Support & Documentation

- API Documentation: http://localhost:8000/docs
- WebSocket Examples: See `frontend/src/hooks/useSensorStream.js`
- Backend Setup: See `backend/README.md`
- Frontend Setup: See `frontend/README.md`

## Next Steps

1. **Testing**: Run integration tests with `docker-compose` profile `testing`
2. **Monitoring**: Set up logging and metrics collection
3. **Automation**: Configure CI/CD pipeline (GitHub Actions, GitLab CI, etc)
4. **Optimization**: Profile and optimize for your workload

---

**Last Updated**: April 2026  
**Version**: 1.0.0
