# backend/src/app/schema/market.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class OhlcRequest(BaseModel):
    ticker: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class OhlcResponse(BaseModel):
    ticker: str
    ohlc: List[Dict[str, Any]]
