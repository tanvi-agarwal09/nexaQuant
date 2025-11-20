
# # backend/src/app/schemas/nft.py
# from pydantic import BaseModel
# from typing import Optional, Dict, Any

# class MintRequest(BaseModel):
#     strategy_id: str
#     owner_user_id: Optional[str] = None

# class MintResp(BaseModel):
#     job_id: str
#     status: str
#     mint_address: Optional[str] = None
#     network: Optional[str] = None
#     metadata: Optional[Dict[str, Any]] = None
# backend/src/app/schemas/nft.py (UPDATED)
from pydantic import BaseModel
from typing import Optional, Dict, Any

class MintRequest(BaseModel):
    strategy_id: str
    owner_user_id: Optional[str] = None
    ticker: Optional[str] = None
    metrics: Optional[Dict[str, float]] = None

class MintResp(BaseModel):
    job_id: str
    status: str
    mint_address: Optional[str] = None
    network: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    strategy_name: Optional[str] = None
    strategy_description: Optional[str] = None