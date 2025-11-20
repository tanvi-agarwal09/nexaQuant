# backend/src/app/services/backtest_engine.py
import pandas as pd
import numpy as np
import json
import os
from ..services.ohlc_loader import load_ohlc_yahoo
from ..config import settings

def run_simple_backtest_from_signals(ticker: str, signals: pd.Series, starting_cash: float = 10000.0):
    """
    signals: pandas Series indexed by date with values: 1 (buy), 0 (hold), -1 (sell)
    Returns: pnl_timeseries (pd.Series), metrics dict
    """
    # For simplicity: allow only 1 position at a time. Buy full allocation on buy, sell on sell.
    df = signals.to_frame("signal").copy()
    df["close"] = signals.index.map(lambda d: signals.index._data)  # placeholder (not used)
    # But we actually need OHLC to compute nav. Here signals index will correspond to OHLC index in caller.
    # The caller should align signals index with ohlc['date'] and pass both.
    raise NotImplementedError("Use run_backtest_with_ohlc for full execution.")

def run_backtest_with_ohlc(ohlc: pd.DataFrame, signals: pd.Series, starting_cash: float = 10000.0):
    """
    ohlc: DataFrame with date, open, high, low, close
    signals: Series indexed by date aligned with ohlc['date'] with values 1, 0, -1
    """
    ohlc = ohlc.copy()
    if "date" not in ohlc.columns:
        raise ValueError("ohlc must have 'date' column")
    ohlc["date"] = pd.to_datetime(ohlc["date"]).dt.normalize()
    ohlc = ohlc.set_index("date")
    signals = signals.copy()
    signals.index = pd.to_datetime(signals.index).normalize()

    navs = []
    cash = starting_cash
    position = 0.0
    last_buy_price = None
    dates = sorted(list(set(ohlc.index).intersection(set(signals.index))))
    # iterate through ohlc date index in ascending order
    for dt in ohlc.index:
        signal = signals.get(dt, 0)
        price = float(ohlc.loc[dt, "close"])
        if signal == 1 and position == 0:
            # buy full
            position = cash / price
            cash = 0.0
            last_buy_price = price
        elif signal == -1 and position > 0:
            # sell all
            cash = position * price
            position = 0.0
            last_buy_price = None
        nav = cash + (position * price)
        navs.append({"date": dt.isoformat(), "nav": nav, "cash": cash, "position": position, "price": price})
    nav_df = pd.DataFrame(navs).set_index(pd.to_datetime([n["date"] for n in navs]))
    pnl_series = nav_df["nav"]
    metrics = compute_metrics_from_nav(pnl_series)
    return pnl_series, metrics

def compute_metrics_from_nav(nav_series: pd.Series):
    """
    Compute CAGR, Sharpe (approx), max drawdown, volatility
    """
    returns = nav_series.pct_change().dropna()
    if returns.empty:
        return {"cagr": 0.0, "sharpe": 0.0, "max_drawdown": 0.0, "volatility": 0.0}
    cumulative_return = nav_series.iloc[-1] / nav_series.iloc[0] - 1.0
    num_years = (nav_series.index[-1] - nav_series.index[0]).days / 365.25
    cagr = (1 + cumulative_return) ** (1 / num_years) - 1 if num_years > 0 else 0.0
    vol = returns.std() * np.sqrt(252)
    sharpe = (returns.mean() / returns.std()) * np.sqrt(252) if returns.std() != 0 else 0.0
    # max drawdown
    roll_max = nav_series.cummax()
    drawdown = (nav_series - roll_max) / roll_max
    max_dd = drawdown.min()
    return {
        "cagr": float(cagr),
        "sharpe": float(sharpe),
        "max_drawdown": float(max_dd),
        "volatility": float(vol),
    }
