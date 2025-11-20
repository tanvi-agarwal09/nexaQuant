# backend/src/app/api/v1/routes_marketplace.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ...agents.marketplace_agents import run_marketplace_negotiation

router = APIRouter()

class MarketplaceRequest(BaseModel):
    strategy_metadata: Dict[str, Any]
    buyer_budget: float = 1000.0
    buyer_requirements: Optional[Dict[str, Any]] = None

class MarketplaceResponse(BaseModel):
    status: str
    best_deal: Optional[Dict[str, Any]] = None
    all_negotiations: list
    summary: str

@router.post("/negotiate", response_model=MarketplaceResponse)
def simulate_marketplace(req: MarketplaceRequest):
    """
    Simulate an agent marketplace where a buyer negotiates with multiple sellers
    for a trading strategy NFT.
    """
    try:
        # Default buyer requirements if none provided
        if not req.buyer_requirements:
            req.buyer_requirements = {
                "min_sharpe": 1.0,
                "max_drawdown": -0.15,
                "min_cagr": 0.10
            }
        
        result = run_marketplace_negotiation(
            strategy_metadata=req.strategy_metadata,
            buyer_budget=req.buyer_budget,
            buyer_requirements=req.buyer_requirements
        )
        
        return MarketplaceResponse(**result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Marketplace simulation failed: {str(e)}")