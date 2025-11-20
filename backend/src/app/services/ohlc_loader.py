# # backend/src/app/services/ohlc_loader.py
# import pandas as pd
# import datetime
# import yfinance as yf

# def load_ohlc_yahoo(ticker: str, start: str = None, end: str = None):
#     """
#     Load daily OHLC using yfinance. start/end in YYYY-MM-DD or None.
#     Returns a pandas.DataFrame with index as Date and columns: open, high, low, close, volume
#     """
#     if not start:
#         start = (datetime.date.today() - datetime.timedelta(days=365*5)).isoformat()
#     if not end:
#         end = datetime.date.today().isoformat()
#     df = yf.download(ticker, start=start, end=end, progress=False)
#     if df.empty:
#         raise ValueError(f"No data for ticker {ticker}")
#     df = df.loc[:, ["Open", "High", "Low", "Close", "Volume"]]
#     df.columns = [c.lower() for c in df.columns]
#     df.index.name = "date"
#     df = df.reset_index()
#     return df
# backend/src/app/services/ohlc_loader.py
import pandas as pd
import datetime
import yfinance as yf

def load_ohlc_yahoo(ticker: str, start: str = None, end: str = None):
    """
    Load daily OHLC using yfinance. start/end in YYYY-MM-DD or None.
    Returns a pandas.DataFrame with columns: date, open, high, low, close, volume
    """
    if not start:
        start = (datetime.date.today() - datetime.timedelta(days=365*5)).isoformat()
    if not end:
        end = datetime.date.today().isoformat()
    
    df = yf.download(ticker, start=start, end=end, progress=False)
    
    if df.empty:
        raise ValueError(f"No data for ticker {ticker}")
    
    # Handle MultiIndex columns from yfinance
    if isinstance(df.columns, pd.MultiIndex):
        # Flatten MultiIndex by taking the first level
        df.columns = df.columns.get_level_values(0)
    
    # Select and rename columns
    df = df.loc[:, ["Open", "High", "Low", "Close", "Volume"]].copy()
    df.columns = ["open", "high", "low", "close", "volume"]
    
    # Reset index to make date a column
    df = df.reset_index()
    df.columns = ["date", "open", "high", "low", "close", "volume"]
    
    return df