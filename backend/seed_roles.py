"""
Seed default roles into the database - Simple version
"""

import os
import sys
import uuid
from pathlib import Path

# Set up environment
os.chdir(Path(__file__).parent)
sys.path.insert(0, str(Path(__file__).parent))

# Now import after path is set
import psycopg2
from psycopg2.extras import RealDictCursor

# Get database URL from environment or use default
DB_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/tdd_system')

# Parse connection string
parts = DB_URL.replace('postgresql://', '').split('@')
if len(parts) == 2:
    user_pass, host_db = parts
    user, password = user_pass.split(':')
    host, database = host_db.split('/')
else:
    print("ERROR: Could not parse DATABASE_URL")
    sys.exit(1)

try:
    conn = psycopg2.connect(
        host=host,
        database=database,
        user=user,
        password=password
    )
    cur = conn.cursor(cursor_factory=RealDictCursor)
    print(f"✅ Connected to {database} at {host}")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    sys.exit(1)

# Check if roles exist
cur.execute("SELECT COUNT(*) as count FROM roles")
result = cur.fetchone()
role_count = result['count'] if result else 0

if role_count > 0:
    print(f"📌 Database already has {role_count} roles. Fetching...")
    cur.execute("SELECT id, name FROM roles ORDER BY name")
    roles = cur.fetchall()
    print("\nExisting roles:")
    for role in roles:
        print(f"  - {role['name']}: {role['id']}")
else:
    print("🌱 Seeding default roles...")
    
    DEFAULT_ROLES = [
        ("Admin", "Full system access and administration capabilities"),
        ("Engineer", "View and edit assets maintenance capabilities"),
        ("Auditor", "Audit logs, view all, export reports"),
        ("Operator", "View and create records"),
        ("Viewer", "Read-only access"),
    ]
    
    for name, description in DEFAULT_ROLES:
        role_id = str(uuid.uuid4())
        cur.execute(
            "INSERT INTO roles (id, name, description, permissions, created_at, updated_at) VALUES (%s, %s, %s, %s, NOW(), NOW())",
            (role_id, name, description, '{}')
        )
        print(f"  ✅ Added role: {name} ({role_id})")
    
    conn.commit()
    print("\n✅ Seeding complete!")
    
    print("\nSeeded roles:")
    cur.execute("SELECT id, name FROM roles ORDER BY name")
    roles = cur.fetchall()
    for role in roles:
        print(f"  - {role['name']}: {role['id']}")

cur.close()
conn.close()

