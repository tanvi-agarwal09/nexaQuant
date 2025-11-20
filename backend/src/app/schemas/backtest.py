# backend/src/app/schema/backtest.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class BacktestRequest(BaseModel):
    request_id: Optional[str] = None
    user_id: Optional[str] = None
    description_text: str
    ticker: Optional[str] = None

class BacktestResultResp(BaseModel):
    backtest_id: str
    metrics: Dict[str, Any]
    pnl_series_path: Optional[str] = None

# class GuruAnalyzeRequest(BaseModel):
#     source_type: str  # 'paste' or 'generate'
#     transcript_text: Optional[str] = None
#     guru_identifier: Optional[str] = None
#     days: Optional[int] = 90

# class GuruAnalyzeResp(BaseModel):
#     guru_identifier: str
#     score: int
#     samples: List[Dict[str, Any]]
class GuruAnalyzeRequest(BaseModel):
    source_type: str  # 'paste' or 'generate'
    transcript_text: Optional[str] = None
    guru_identifier: Optional[str] = None
    days: Optional[int] = 90

class GuruAnalyzeResp(BaseModel):
    guru_identifier: str
    score: int
    samples: List[Dict[str, Any]]
    breakdown: Optional[Dict[str, Any]] = None
    detailed_calls: Optional[List[Dict[str, Any]]] = None