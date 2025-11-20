# # backend/src/app/api/v1/router.py
# from fastapi import APIRouter
# from .routes_backtest import router as backtest_router
# from .routes_market import router as market_router
# from .routes_mint import router as mint_router
# from .routes_guru import router as guru_router

# router = APIRouter()
# router.include_router(backtest_router, prefix="/backtest", tags=["backtest"])
# router.include_router(market_router, prefix="/market", tags=["market"])
# router.include_router(guru_router, prefix="/guru", tags=["guru"])
# router.include_router(mint_router, prefix="/mint", tags=["mint"])
# backend/src/app/api/v1/router.py (UPDATED)
from fastapi import APIRouter
from .routes_backtest import router as backtest_router
from .routes_market import router as market_router
from .routes_mint import router as mint_router
from .routes_guru import router as guru_router
from .routes_marketplace import router as marketplace_router

router = APIRouter()
router.include_router(backtest_router, prefix="/backtest", tags=["backtest"])
router.include_router(market_router, prefix="/market", tags=["market"])
router.include_router(guru_router, prefix="/guru", tags=["guru"])
router.include_router(mint_router, prefix="/mint", tags=["mint"])
router.include_router(marketplace_router, prefix="/marketplace", tags=["marketplace"])