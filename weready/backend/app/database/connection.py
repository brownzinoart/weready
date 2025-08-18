"""
Database Connection and Configuration
=====================================
SQLAlchemy database setup for WeReady authentication system.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./weready.db")

# For SQLite, add check_same_thread=False for development
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

def get_db():
    """
    Database dependency for FastAPI
    Creates a new database session for each request
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all database tables"""
    from app.models.user import Base
    from app.models import analysis  # Import to register tables
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all database tables (for development/testing)"""
    from app.models.user import Base
    from app.models import analysis  # Import to register tables
    Base.metadata.drop_all(bind=engine)

# Initialize database on import
def init_db():
    """Initialize database with tables"""
    create_tables()
    print(" Database initialized successfully")

if __name__ == "__main__":
    init_db()