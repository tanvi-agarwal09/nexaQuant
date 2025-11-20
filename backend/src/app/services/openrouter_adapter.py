# # backend/src/app/services/openrouter_adapter.py
# import os
# import requests
# from ..config import settings

# OPENROUTER_API_KEY = settings.OPENROUTER_API_KEY

# class OpenRouterError(Exception):
#     pass

# def openrouter_complete(prompt: str, model: str = "gpt-4o-mini", max_tokens: int = 512, temperature: float = 0.0):
#     """
#     Sends a simple completion request to OpenRouter-compatible endpoint.
#     Expects OPENROUTER_API_KEY in env.
#     """
#     if not OPENROUTER_API_KEY:
#         raise OpenRouterError("OPENROUTER_API_KEY not configured. Set in .env.")

#     endpoint = "https://api.openrouter.ai/v1/chat/completions"
#     headers = {"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"}
#     payload = {
#         "model": model,
#         "messages": [
#             {"role": "system", "content": "You are a trading assistant that extracts structured signals."},
#             {"role": "user", "content": prompt}
#         ],
#         "temperature": temperature,
#         "max_tokens": max_tokens
#     }
#     r = requests.post(endpoint, json=payload, headers=headers, timeout=30)
#     if r.status_code != 200:
#         raise OpenRouterError(f"OpenRouter API error: {r.status_code} {r.text}")
#     data = r.json()
#     # OpenRouter response mapping may vary; attempt to extract text
#     try:
#         content = data["choices"][0]["message"]["content"]
#     except Exception:
#         content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
#     return content
# backend/src/app/services/openrouter_adapter.py
import os
import requests
from ..config import settings
import json

OPENROUTER_API_KEY = settings.OPENROUTER_API_KEY

class OpenRouterError(Exception):
    pass

def openrouter_complete(prompt: str, model: str = "gpt-4o-mini", max_tokens: int = 512, temperature: float = 0.0):
    """
    Sends a simple completion request to OpenRouter-compatible endpoint.
    Falls back to mock responses if API key is not configured or connection fails.
    """
    if not OPENROUTER_API_KEY:
        # Fallback to mock response for demo purposes
        return _mock_response(prompt, model)

    endpoint = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nexaquant.tech",  # Required by OpenRouter
        "X-Title": "neXaQuant"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a trading assistant that extracts structured signals."},
            {"role": "user", "content": prompt}
        ],
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    try:
        r = requests.post(endpoint, json=payload, headers=headers, timeout=30)
        if r.status_code != 200:
            # Fallback on API error
            return _mock_response(prompt, model)
        
        data = r.json()
        content = data["choices"][0]["message"]["content"]
        return content
    except Exception as e:
        # Network error or connection issue - use fallback
        print(f"OpenRouter API failed: {e}. Using mock response.")
        return _mock_response(prompt, model)

def _mock_response(prompt: str, model: str):
    """
    Generate mock responses based on prompt patterns for demo purposes.
    """
    prompt_lower = prompt.lower()
    
    # Mock strategy signal plan
    if "signal plan" in prompt_lower or "trading rules" in prompt_lower:
        import datetime
        signals = []
        base_date = datetime.date.today() - datetime.timedelta(days=365)
        
        # Generate 25 sample signals over the year
        for i in range(25):
            days_offset = i * 14  # Every 2 weeks
            signal_date = base_date + datetime.timedelta(days=days_offset)
            signal_type = 1 if i % 3 != 0 else -1  # Mostly buys, some sells
            
            signals.append({
                "date": signal_date.isoformat(),
                "ticker": "SPY",
                "signal": signal_type
            })
        
        return json.dumps(signals)
    
    # Mock guru calls generation
    elif "generate" in prompt_lower and "trading calls" in prompt_lower:
        import datetime
        calls = []
        base_date = datetime.date.today() - datetime.timedelta(days=90)
        tickers = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "SPY", "QQQ", "AMZN"]
        
        for i in range(12):
            days_offset = i * 7
            call_date = base_date + datetime.timedelta(days=days_offset)
            
            calls.append({
                "ticker": tickers[i % len(tickers)],
                "date": call_date.isoformat(),
                "action": "buy" if i % 2 == 0 else "sell",
                "confidence": 0.6 + (i % 4) * 0.1
            })
        
        return json.dumps(calls)
    
    # Mock guru calls extraction from transcript
    elif "extract" in prompt_lower and "transcript" in prompt_lower:
        calls = [
            {
                "ticker": "AAPL",
                "date": (datetime.date.today() - datetime.timedelta(days=30)).isoformat(),
                "action": "buy",
                "confidence": 0.8
            },
            {
                "ticker": "TSLA",
                "date": (datetime.date.today() - datetime.timedelta(days=20)).isoformat(),
                "action": "sell",
                "confidence": 0.7
            }
        ]
        return json.dumps(calls)
    
    # Default mock response
    return json.dumps({
        "signal": "mock",
        "message": "Using mock AI response for demo. Configure OPENROUTER_API_KEY for real AI."
    })