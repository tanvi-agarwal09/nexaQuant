# backend/src/app/agents/strategy_agent.py
import json
from ..services.openrouter_adapter import openrouter_complete, OpenRouterError

def generate_signal_plan(nl_text: str, ticker_hint: str = None):
    """
    Ask the LLM to produce a synthetic list of signals for the last 365 days.
    Output format: JSON array of objects {"date":"YYYY-MM-DD","ticker":"SPY","signal":1|-1|0}
    """
    prompt = f"""
You are an assistant that converts plain English trading rules into a synthetic historical signal plan.
Return ONLY a JSON array of objects with fields: date (YYYY-MM-DD), ticker (e.g. SPY), signal (1 for buy, -1 for sell, 0 for hold).
The plan should be plausible for the last 365 days and include at least 20 events. The rule is:

\"\"\"{nl_text}\"\"\"

If the user provided a ticker hint use that ticker, otherwise use a reasonable ETF like SPY.
"""
    if ticker_hint:
        prompt += f"\nPrefer ticker: {ticker_hint}\n"

    try:
        out = openrouter_complete(prompt, model="gpt-4o-mini", max_tokens=800, temperature=0.0)
    except OpenRouterError:
        return []

    try:
        parsed = json.loads(out)
        # ensure list of dicts
        if isinstance(parsed, list):
            return parsed
        else:
            return []
    except Exception:
        # try to extract JSON substring
        try:
            import re
            m = re.search(r'(\[.*\])', out, re.S)
            if m:
                return json.loads(m.group(1))
        except Exception:
            return []
    return []
