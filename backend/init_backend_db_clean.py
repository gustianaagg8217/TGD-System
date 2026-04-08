"""Initialize TGd backend database with clean slate"""
from app.db.base import Base
from app.db.session import engine
from app.models import *  # Import all models to register with Base

def init_db_clean():
    """Drop all and create fresh database tables"""
    print("[INIT] Dropping all existing tables...")
    try:
        Base.metadata.drop_all(bind=engine)
        print("[OK] Dropped all tables")
    except Exception as e:
        print(f"[WARN] Drop error (likely ok): {str(e)[:100]}")
    
    print("[INIT] Creating fresh database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created successfully")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        raise

if __name__ == "__main__":
    init_db_clean()
