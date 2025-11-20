# backend/src/app/services/nft_metadata.py
import json
from datetime import datetime

def make_strategy_metadata(strategy, backtest_metrics, code_text=None):
    """
    strategy: dict containing title, description, structured_json...
    backtest_metrics: dict
    """
    meta = {
        "name": f"neXaQuant Strategy: {strategy.get('title') or 'Untitled'}",
        "description": strategy.get("description_text") or "",
        "attributes": [
            {"trait_type": "cagr", "value": backtest_metrics.get("cagr")},
            {"trait_type": "sharpe", "value": backtest_metrics.get("sharpe")},
            {"trait_type": "max_drawdown", "value": backtest_metrics.get("max_drawdown")},
            {"trait_type": "created_at", "value": datetime.utcnow().isoformat()},
        ],
        "strategy_structured": strategy.get("structured_json"),
        "strategy_code": code_text or None
    }
    return meta
