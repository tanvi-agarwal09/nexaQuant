# backend/src/app/models/user.py
from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from ..db.database import Base
from sqlalchemy.dialects.sqlite import BLOB

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)  # use uuid strings
    email = Column(String, unique=True, index=True, nullable=True)
    display_name = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
