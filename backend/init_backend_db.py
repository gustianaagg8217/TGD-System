"""Initialize TGd backend database with all models"""
from app.db.base import Base
from app.db.session import engine
from app.models import *  # Import all models to register with Base

def init_db():
    """Create all database tables"""
    print("[INIT] Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created successfully")
    except Exception as e:
        if "already exists" in str(e):
            print("[INFO] Some tables already exist, skipping...")
        else:
            print(f"[ERROR] {str(e)}")
            raise

if __name__ == "__main__":
    init_db()
