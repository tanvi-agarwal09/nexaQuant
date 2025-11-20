# backend/src/app/models/agent_log.py
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.sql import func
from ..db.database import Base

class AgentLog(Base):
    __tablename__ = "agent_logs"
    id = Column(String, primary_key=True, index=True)
    agent_name = Column(String, nullable=False)
    job_id = Column(String, nullable=True)
    input_json = Column(JSON, nullable=True)
    output_json = Column(JSON, nullable=True)
    status = Column(String, nullable=True)
    started_at = Column(DateTime, server_default=func.now())
    finished_at = Column(DateTime, nullable=True)
