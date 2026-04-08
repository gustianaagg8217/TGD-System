-- TGd System Database Initialization
-- This script runs automatically when PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "hstore";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;

-- Set default search path
ALTER DATABASE tgd_system SET search_path TO public;

-- Create initial indices
CREATE INDEX IF NOT EXISTS idx_assets_owner_id ON assets(owner_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_asset_timestamp ON sensor_readings(asset_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_type ON sensor_readings(sensor_type);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_asset_severity ON sensor_alerts(asset_id, severity);

-- Grant privileges
-- Note: Replace 'tgd_user' with your actual database user if different
GRANT CONNECT ON DATABASE tgd_system TO tgd_user;
GRANT USAGE ON SCHEMA public TO tgd_user;
GRANT CREATE ON SCHEMA public TO tgd_user;

-- Create sample data (optional - comment out for production)
-- This will be run by the backend seed_data scripts
