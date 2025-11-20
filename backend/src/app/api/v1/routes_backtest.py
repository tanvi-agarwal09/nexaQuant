# backend/src/app/api/v1/routes_backtest.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...db.database import SessionLocal
from ...agents import strategy_agent
from ...services.ohlc_loader import load_ohlc_yahoo
from ...schemas.backtest import BacktestRequest, BacktestResultResp
from ...services.backtest_engine import run_backtest_with_ohlc
from ...db import crud

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/run", response_model=BacktestResultResp)
def run_backtest(payload: BacktestRequest, db: Session = Depends(get_db)):
    """
    Accepts a natural language description or structured instruction.
    For the hackathon MVP the agent will synthesize a signal plan for the last 365 days,
    we then run the simple backtest on the first ticker found.
    """
    # 1) Use strategy_agent to produce a synthetic signal plan (list of {date, ticker, signal})
    signal_plan = strategy_agent.generate_signal_plan(payload.description_text, ticker_hint=payload.ticker)
    if not signal_plan or len(signal_plan) == 0:
        raise HTTPException(status_code=400, detail="Agent could not produce a signal plan")

    # pick first ticker
    first_ticker = None
    for item in signal_plan:
        first_ticker = item.get("ticker")
        if first_ticker:
            break
    if not first_ticker:
        first_ticker = payload.ticker or "SPY"

    # Convert plan to list for the ticker
    plan_for_ticker = [ {"date": it["date"], "signal": int(it.get("signal",0))} for it in signal_plan if it.get("ticker", first_ticker)==first_ticker ]

    # 2) Load OHLC for ticker
    try:
        ohlc = load_ohlc_yahoo(first_ticker)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to load data for {first_ticker}: {e}")

    # prepare pandas Series of signals aligned to ohlc dates
    import pandas as pd
    ohlc["date"] = pd.to_datetime(ohlc["date"]).dt.normalize()
    signals = pd.Series(0, index=ohlc["date"])
    for p in plan_for_ticker:
        dt = pd.to_datetime(p["date"]).normalize()
        if dt in signals.index:
            signals.at[dt] = int(p["signal"])

    pnl_series, metrics = run_backtest_with_ohlc(ohlc.reset_index(drop=False), signals, starting_cash=10000.0)

    # persist backtest
    timeseries_path = f"backtests/{payload.request_id or 'anon'}_{first_ticker}_pnl.json"
    import os, pathlib
    pathlib.Path("backtests").mkdir(parents=True, exist_ok=True)
    pnl_series.to_json(timeseries_path, orient="index", date_format="iso")

    bt = crud.create_backtest(db, strategy_id=payload.request_id or "ad_hoc", start_date=str(ohlc['date'].iloc[0].date()), end_date=str(ohlc['date'].iloc[-1].date()), metrics=metrics, timeseries_path=timeseries_path)

    resp = {
        "backtest_id": bt.id,
        "metrics": metrics,
        "pnl_series_path": timeseries_path
    }
    return resp
