# backend/src/app/services/metrics.py
import numpy as np
import pandas as pd

def sharpe_ratio(returns: pd.Series, annualization: int = 252):
    r = returns.dropna()
    if r.empty or r.std() == 0:
        return 0.0
    return float((r.mean() / r.std()) * np.sqrt(annualization))

def max_drawdown(nav: pd.Series):
    roll_max = nav.cummax()
    dd = (nav - roll_max) / roll_max
    return float(dd.min())
