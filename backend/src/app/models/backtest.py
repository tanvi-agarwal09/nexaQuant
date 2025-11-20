# backend/src/app/models/backtest.py
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.sql import func
from ..db.database import Base

class Backtest(Base):
    __tablename__ = "backtests"
    id = Column(String, primary_key=True, index=True)
    strategy_id = Column(String, index=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    metrics_json = Column(JSON, nullable=True)
    pnl_timeseries_path = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
