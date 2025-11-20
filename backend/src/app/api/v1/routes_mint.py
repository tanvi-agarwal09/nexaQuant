# # # backend/src/app/api/v1/routes_mint.py
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from ...db.database import SessionLocal
# from ...db import crud
# from ...services.solana_adapter import mint_strategy_nft
# from ...services.nft_metadata import make_strategy_metadata
# from ...schemas.nft import MintRequest, MintResp

# router = APIRouter()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @router.post("/strategy", response_model=MintResp)
# def mint_strategy(payload: MintRequest, db: Session = Depends(get_db)):
#     """
#     Mint an NFT for a strategy. For MVP, we use mock minting on Solana devnet.
#     """
#     # In a full implementation, you'd fetch the strategy and backtest from DB
#     # For now, create mock metadata
#     strategy_data = {
#         "title": f"Strategy {payload.strategy_id[:8]}",
#         "description_text": "AI-generated trading strategy",
#         "structured_json": {"type": "momentum", "indicators": ["SMA", "RSI"]}
#     }
    
#     backtest_metrics = {
#         "cagr": 0.15,
#         "sharpe": 1.2,
#         "max_drawdown": -0.08,
#         "volatility": 0.12
#     }
    
#     metadata = make_strategy_metadata(strategy_data, backtest_metrics, code_text="# Strategy code here")
    
#     # Mint NFT (mock for devnet)
#     try:
#         mint_result = mint_strategy_nft(metadata, owner_wallet=payload.owner_user_id)
        
#         # Store in DB
#         nft_record = crud.create_nft_record(
#             db,
#             strategy_id=payload.strategy_id,
#             owner_user_id=payload.owner_user_id or "anonymous",
#             solana_mint_address=mint_result["mint_address"],
#             metadata_json=metadata
#         )
        
#         return MintResp(
#             job_id=nft_record.id,
#             status="complete",
#             mint_address=mint_result["mint_address"],
#             network=mint_result["network"],
#             metadata=metadata
#         )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Minting failed: {str(e)}")

# backend/src/app/api/v1/routes_mint.py (UPDATED)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...db.database import SessionLocal
from ...db import crud
from ...services.solana_adapter import mint_strategy_nft
from ...services.nft_metadata import make_strategy_metadata
from ...services.strategy_naming import generate_strategy_name, generate_strategy_description
from ...schemas.nft import MintRequest, MintResp

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/strategy", response_model=MintResp)
def mint_strategy(payload: MintRequest, db: Session = Depends(get_db)):
    """
    Mint an NFT for a strategy with auto-generated name and description.
    """
    # In a full implementation, fetch strategy and backtest from DB
    # For now, create mock data with generated names
    
    # Generate fun strategy name
    strategy_name = generate_strategy_name(
        ticker=payload.ticker if hasattr(payload, 'ticker') else None,
        metrics=payload.metrics if hasattr(payload, 'metrics') else None,
        style="auto"
    )
    
    # Generate description
    strategy_description = generate_strategy_description(
        name=strategy_name,
        metrics=payload.metrics if hasattr(payload, 'metrics') else {
            "cagr": 0.15,
            "sharpe": 1.2,
            "max_drawdown": -0.08,
            "volatility": 0.12
        },
        ticker=payload.ticker if hasattr(payload, 'ticker') else None
    )
    
    strategy_data = {
        "title": strategy_name,
        "description_text": strategy_description,
        "structured_json": {"type": "momentum", "indicators": ["SMA", "RSI"]}
    }
    
    backtest_metrics = payload.metrics if hasattr(payload, 'metrics') else {
        "cagr": 0.15,
        "sharpe": 1.2,
        "max_drawdown": -0.08,
        "volatility": 0.12
    }
    
    metadata = make_strategy_metadata(strategy_data, backtest_metrics, code_text="# Strategy code here")
    
    # Mint NFT (mock for devnet)
    try:
        mint_result = mint_strategy_nft(metadata, owner_wallet=payload.owner_user_id)
        
        # Store in DB
        nft_record = crud.create_nft_record(
            db,
            strategy_id=payload.strategy_id,
            owner_user_id=payload.owner_user_id or "anonymous",
            solana_mint_address=mint_result["mint_address"],
            metadata_json=metadata
        )
        
        return MintResp(
            job_id=nft_record.id,
            status="complete",
            mint_address=mint_result["mint_address"],
            network=mint_result["network"],
            metadata=metadata,
            strategy_name=strategy_name,
            strategy_description=strategy_description
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Minting failed: {str(e)}")