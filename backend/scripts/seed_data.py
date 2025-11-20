# backend/scripts/seed_data.py
import os
import uuid
import sqlite3
from pathlib import Path

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./nexaquant.db").replace("sqlite:///", "")

def ensure_db_file():
    p = Path(DB_PATH)
    if not p.exists():
        # touch an empty file so SQLAlchemy can create tables on startup
        p.parent.mkdir(parents=True, exist_ok=True)
        p.touch()

def print_hint():
    print("Run the backend (uvicorn ...) and the DB tables will be created automatically via SQLAlchemy Base.metadata.create_all().")
    print("This script only ensures the sqlite file exists for local dev.")

if __name__ == "__main__":
    ensure_db_file()
    print_hint()
