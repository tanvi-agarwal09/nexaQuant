# backend/src/app/models/strategy.py
from sqlalchemy import Column, String, Text, DateTime, Enum
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.sql import func
from ..db.database import Base
import enum

class StrategyStatus(str, enum.Enum):
    PARSING = "parsing"
    BACKTESTING = "backtesting"
    COMPLETE = "complete"
    FAILED = "failed"

class Strategy(Base):
    __tablename__ = "strategies"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    title = Column(String, nullable=True)
    description_text = Column(Text, nullable=True)
    structured_json = Column(JSON, nullable=True)
    code_text = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    status = Column(Enum(StrategyStatus), default=StrategyStatus.PARSING)
