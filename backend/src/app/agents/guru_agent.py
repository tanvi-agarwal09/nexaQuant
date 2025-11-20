# backend/src/app/agents/guru_agent.py
import json
from ..services.openrouter_adapter import openrouter_complete, OpenRouterError

def generate_sample_calls(days: int = 90):
    prompt = f"""
Generate a sample set of discrete trading calls over the last {days} days.
Return a JSON array of objects: {{\"ticker\":\"AAPL\",\"date\":\"YYYY-MM-DD\",\"action\":\"buy\"|\"sell\",\"confidence\":0-1.0,\"entry_price\":150.0,\"target_price\":165.0}}.
Make 8-20 calls with mixed tickers (AAPL, MSFT, GOOGL, TSLA, NVDA, SPY, QQQ, AMZN, META, NFLX).
Include realistic entry prices and optional target prices.
Return JSON only.
"""
    try:
        out = openrouter_complete(prompt, model="gpt-4o-mini", max_tokens=800, temperature=0.7)
    except OpenRouterError:
        # Fallback to mock data
        import datetime
        calls = []
        base_date = datetime.date.today() - datetime.timedelta(days=days)
        tickers = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "SPY", "QQQ", "AMZN", "META", "NFLX"]
        prices = [175, 380, 140, 250, 480, 450, 380, 145, 350, 480]
        
        for i in range(12):
            days_offset = i * (days // 12)
            call_date = base_date + datetime.timedelta(days=days_offset)
            ticker_idx = i % len(tickers)
            entry_price = prices[ticker_idx] * (1 + (i % 3 - 1) * 0.05)
            
            calls.append({
                "ticker": tickers[ticker_idx],
                "date": call_date.isoformat(),
                "action": "buy" if i % 2 == 0 else "sell",
                "confidence": 0.6 + (i % 4) * 0.1,
                "entry_price": round(entry_price, 2),
                "target_price": round(entry_price * 1.08, 2) if i % 2 == 0 else round(entry_price * 0.95, 2)
            })
        
        return calls
    
    try:
        parsed = json.loads(out)
        if isinstance(parsed, list) and len(parsed) > 0:
            return parsed
    except Exception:
        # Try to extract JSON substring
        import re
        m = re.search(r'(\[.*\])', out, re.S)
        if m:
            try:
                return json.loads(m.group(1))
            except:
                pass
    
    # Final fallback
    import datetime
    calls = []
    base_date = datetime.date.today() - datetime.timedelta(days=days)
    tickers = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "SPY", "QQQ", "AMZN"]
    prices = [175, 380, 140, 250, 480, 450, 380, 145]
    
    for i in range(10):
        days_offset = i * (days // 10)
        call_date = base_date + datetime.timedelta(days=days_offset)
        ticker_idx = i % len(tickers)
        entry_price = prices[ticker_idx]
        
        calls.append({
            "ticker": tickers[ticker_idx],
            "date": call_date.isoformat(),
            "action": "buy" if i % 2 == 0 else "sell",
            "confidence": 0.7,
            "entry_price": entry_price,
            "target_price": entry_price * 1.1 if i % 2 == 0 else entry_price * 0.9
        })
    
    return calls

def extract_calls_from_transcript(transcript_text: str):
    prompt = f"""
Extract discrete trading calls from the transcript below.
Return JSON array of objects: {{\"ticker\":\"AAPL\",\"date\":\"YYYY-MM-DD\",\"action\":\"buy\"|\"sell\",\"confidence\":0-1.0,\"entry_price\":100.0,\"target_price\":110.0}}.
Transcript:
\"\"\"{transcript_text}\"\"\"
Return JSON only.
"""
    try:
        out = openrouter_complete(prompt, model="gpt-4o-mini", max_tokens=512, temperature=0.0)
    except OpenRouterError:
        return []
    try:
        return json.loads(out)
    except Exception:
        import re
        m = re.search(r'(\[.*\])', out, re.S)
        if m:
            return json.loads(m.group(1))
    return []

def calculate_guru_score(samples: list, starting_capital: float = 1000.0) -> dict:
    """
    Calculate guru score based on:
    1. Profitability (40 points) - Total profit made
    2. Risk-adjusted returns (30 points) - Sharpe ratio
    3. Consistency (20 points) - Win rate
    4. Risk management (10 points) - Max drawdown control
    """
    if not samples or len(samples) == 0:
        return {"score": 10, "breakdown": {}}
    
    # Calculate portfolio performance
    portfolio_value = starting_capital
    trades = []
    
    for sample in samples:
        cagr = sample.get("cagr", 0)
        trade_return = cagr  # Simplified: treat each trade as independent
        profit = portfolio_value * trade_return
        portfolio_value += profit
        trades.append({
            "return": trade_return,
            "profit": profit,
            "is_win": trade_return > 0
        })
    
    total_return = ((portfolio_value - starting_capital) / starting_capital) * 100
    absolute_profit = portfolio_value - starting_capital
    
    # 1. Profitability Score (40 points)
    # Scale: 0% = 0 points, 50%+ = 40 points
    profitability_score = min(40, max(0, (total_return / 50) * 40))
    
    # 2. Risk-adjusted returns (30 points) - Based on Sharpe
    avg_sharpe = sum(s.get("sharpe", 0) for s in samples) / len(samples)
    # Scale: Sharpe 0 = 0 points, Sharpe 2+ = 30 points
    sharpe_score = min(30, max(0, (avg_sharpe / 2) * 30))
    
    # 3. Consistency (20 points) - Win rate
    wins = sum(1 for t in trades if t["is_win"])
    win_rate = (wins / len(trades)) * 100 if trades else 0
    # Scale: 50% win rate = 10 points, 70%+ = 20 points
    consistency_score = min(20, max(0, ((win_rate - 50) / 20) * 20))
    
    # 4. Risk management (10 points) - Max drawdown
    avg_max_dd = abs(sum(s.get("max_drawdown", 0) for s in samples) / len(samples))
    # Scale: 0% DD = 10 points, 30%+ DD = 0 points
    risk_score = min(10, max(0, 10 - (avg_max_dd / 0.30) * 10))
    
    total_score = int(profitability_score + sharpe_score + consistency_score + risk_score)
    
    return {
        "score": total_score,
        "breakdown": {
            "profitability": {
                "score": round(profitability_score, 1),
                "total_return_pct": round(total_return, 2),
                "absolute_profit": round(absolute_profit, 2),
                "final_portfolio": round(portfolio_value, 2)
            },
            "risk_adjusted": {
                "score": round(sharpe_score, 1),
                "avg_sharpe": round(avg_sharpe, 2)
            },
            "consistency": {
                "score": round(consistency_score, 1),
                "win_rate": round(win_rate, 1),
                "wins": wins,
                "total_trades": len(trades)
            },
            "risk_management": {
                "score": round(risk_score, 1),
                "avg_max_drawdown_pct": round(avg_max_dd * 100, 1)
            }
        }
    }