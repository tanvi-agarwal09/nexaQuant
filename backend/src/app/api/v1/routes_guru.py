# backend/src/app/api/v1/routes_guru.py (UPDATED)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...db.database import SessionLocal
from ...agents import guru_agent
from ...schemas.backtest import GuruAnalyzeRequest, GuruAnalyzeResp
from ...db import crud
import datetime as _dt

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/analyze", response_model=GuruAnalyzeResp)
def analyze_guru(req: GuruAnalyzeRequest, db: Session = Depends(get_db)):
    """
    Analyze a guru: either 'generate' sample calls, or extract calls from pasted transcript.
    Returns aggregated metrics and a score based on profitability, risk-adjusted returns, consistency, and risk management.
    """
    if req.source_type not in ("paste", "generate"):
        raise HTTPException(status_code=400, detail="source_type must be 'paste' or 'generate'")

    if req.source_type == "generate":
        calls = guru_agent.generate_sample_calls(days=req.days or 90)
    else:
        if not req.transcript_text:
            raise HTTPException(status_code=400, detail="transcript_text required for paste mode")
        calls = guru_agent.extract_calls_from_transcript(req.transcript_text)

    # Compute performance using backtest engine per call
    samples = []
    detailed_calls = []
    
    for idx, c in enumerate(calls):
        ticker = c.get("ticker", "SPY")
        call_date = c.get("date")
        action = c.get("action", "buy").lower()
        
        try:
            from ...services.ohlc_loader import load_ohlc_yahoo
            from ...services.backtest_engine import run_backtest_with_ohlc
            import pandas as pd
            
            # Parse date
            if call_date:
                dt = _dt.datetime.fromisoformat(call_date)
            else:
                # Use a date within the period
                dt = _dt.datetime.now() - _dt.timedelta(days=(req.days or 90) - (idx * 7))
            
            # Load data for small window around trade
            start_date = (dt.date() - _dt.timedelta(days=10)).isoformat()
            end_date = (dt.date() + _dt.timedelta(days=20)).isoformat()
            
            ohlc = load_ohlc_yahoo(ticker, start=start_date, end=end_date)
            
            if ohlc.empty:
                continue
            
            # Create simple trade plan: buy on date, sell 7 days later
            buy_date = dt.date().isoformat()
            sell_date = (dt + _dt.timedelta(days=7)).date().isoformat()
            
            plan = [
                {"date": buy_date, "signal": 1 if action == "buy" else -1},
                {"date": sell_date, "signal": -1 if action == "buy" else 1}
            ]
            
            ohlc["date"] = pd.to_datetime(ohlc["date"]).dt.normalize()
            signals = pd.Series(0, index=ohlc["date"])
            
            for p in plan:
                d = pd.to_datetime(p["date"]).normalize()
                if d in signals.index:
                    signals.at[d] = int(p["signal"])
            
            pnl, metrics = run_backtest_with_ohlc(ohlc.reset_index(drop=False), signals, starting_cash=1000.0)
            
            # Store detailed call info
            detailed_call = {
                "trade_number": idx + 1,
                "ticker": ticker,
                "date": call_date or dt.date().isoformat(),
                "action": action,
                "entry_price": c.get("entry_price", ohlc.iloc[0]["close"] if not ohlc.empty else 0),
                "target_price": c.get("target_price"),
                "confidence": c.get("confidence", 0.7),
                "metrics": metrics,
                "is_profitable": metrics.get("cagr", 0) > 0
            }
            detailed_calls.append(detailed_call)
            samples.append(metrics)
            
        except Exception as e:
            print(f"Error processing call {idx}: {e}")
            continue

    # Calculate comprehensive guru score
    if samples:
        score_data = guru_agent.calculate_guru_score(samples, starting_capital=1000.0)
        score = score_data["score"]
        breakdown = score_data["breakdown"]
    else:
        score = 10
        breakdown = {
            "profitability": {"score": 0, "total_return_pct": 0, "absolute_profit": 0, "final_portfolio": 1000.0},
            "risk_adjusted": {"score": 0, "avg_sharpe": 0},
            "consistency": {"score": 0, "win_rate": 0, "wins": 0, "total_trades": 0},
            "risk_management": {"score": 0, "avg_max_drawdown_pct": 0}
        }

    # Store in DB
    bt = crud.create_backtest(
        db, 
        strategy_id=f"guru_{req.guru_identifier or 'anon'}", 
        start_date=None, 
        end_date=None, 
        metrics={
            "score": score, 
            "samples": samples,
            "breakdown": breakdown,
            "detailed_calls": detailed_calls
        }, 
        timeseries_path=None
    )

    return {
        "guru_identifier": req.guru_identifier or "anonymous", 
        "score": score,
        "samples": samples,
        "breakdown": breakdown,
        "detailed_calls": detailed_calls if detailed_calls else []
    }