# backend/src/app/api/v1/routes_market.py
from fastapi import APIRouter, HTTPException
from ...services.ohlc_loader import load_ohlc_yahoo
from ...schemas.market import OhlcRequest, OhlcResponse

router = APIRouter()

@router.post("/ohlc", response_model=OhlcResponse)
def get_ohlc(req: OhlcRequest):
    try:
        df = load_ohlc_yahoo(req.ticker, start=req.start_date, end=req.end_date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    # convert to records
    records = df.to_dict(orient="records")
    return {"ticker": req.ticker, "ohlc": records}
