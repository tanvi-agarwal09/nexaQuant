# backend/src/app/agents/explainer_agent.py
from ..services.openrouter_adapter import openrouter_complete, OpenRouterError

def explain_strategy(structured_json_or_text):
    prompt = f"""
You are a helpful assistant that explains a trading strategy concisely for retail users.
Input:
{structured_json_or_text}

Provide a short human-friendly explanation (3-5 sentences) describing entry conditions, exit conditions, expected behavior, and major risks.
Return only plain text.
"""
    try:
        out = openrouter_complete(prompt, model="gpt-4o-mini", max_tokens=300, temperature=0.2)
        return out.strip()
    except OpenRouterError:
        return "Explanation unavailable (LLM key not configured)."
