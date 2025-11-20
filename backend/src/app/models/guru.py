# backend/src/app/models/guru.py
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.sql import func
from ..db.database import Base

class GuruCall(Base):
    __tablename__ = "guru_calls"
    id = Column(String, primary_key=True, index=True)
    source = Column(String, nullable=True)
    transcript_text = Column(String, nullable=True)
    extracted_calls_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class GuruScore(Base):
    __tablename__ = "guru_scores"
    id = Column(String, primary_key=True, index=True)
    guru_identifier = Column(String, nullable=True)
    calculated_score = Column(String, nullable=True)
    metrics_json = Column(JSON, nullable=True)
    badge_tier = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
