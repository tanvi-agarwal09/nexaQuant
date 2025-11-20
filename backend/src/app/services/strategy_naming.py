# backend/src/app/services/strategy_naming.py
import random

# Fun, memorable strategy name components
PREFIXES = [
    "Alpha", "Beta", "Gamma", "Delta", "Omega", "Sigma", "Quantum", "Turbo",
    "Hyper", "Ultra", "Mega", "Super", "Prime", "Elite", "Apex", "Peak",
    "Stealth", "Shadow", "Ghost", "Phantom", "Ninja", "Dragon", "Phoenix", "Titan"
]

CORE_TERMS = [
    "Momentum", "Trend", "Breakout", "Reversal", "Scalper", "Swinger", "Hunter",
    "Crusher", "Master", "Sentinel", "Guardian", "Predator", "Viper", "Falcon",
    "Thunder", "Lightning", "Storm", "Blitz", "Strike", "Surge", "Wave", "Flow"
]

SUFFIXES = [
    "Pro", "X", "Plus", "Max", "Prime", "Elite", "Edge", "Force",
    "One", "Zero", "Nexus", "Core", "AI", "Bot", "System", "Engine"
]

ADJECTIVES = [
    "Aggressive", "Steady", "Balanced", "Conservative", "Dynamic", "Adaptive",
    "Precise", "Tactical", "Strategic", "Calculated", "Smart", "Swift"
]


def generate_strategy_name(ticker: str = None, metrics: dict = None, style: str = "auto") -> str:
    """
    Generate a fun, memorable name for a trading strategy.
    
    Args:
        ticker: Stock ticker (e.g., "SPY", "AAPL")
        metrics: Performance metrics dict with sharpe, cagr, volatility
        style: "auto" (based on metrics), "aggressive", "conservative", or "random"
    
    Returns:
        Generated strategy name
    """
    
    if style == "auto" and metrics:
        style = _determine_style_from_metrics(metrics)
    elif style == "auto":
        style = "random"
    
    # Select components based on style
    if style == "aggressive":
        prefix = random.choice(["Turbo", "Hyper", "Ultra", "Dragon", "Thunder", "Blitz"])
        core = random.choice(["Crusher", "Predator", "Strike", "Surge", "Hunter"])
        suffix = random.choice(["X", "Max", "Force", "Engine"])
    elif style == "conservative":
        prefix = random.choice(["Steady", "Prime", "Elite", "Apex"])
        core = random.choice(["Guardian", "Sentinel", "Master", "Flow"])
        suffix = random.choice(["Pro", "Plus", "Core", "System"])
    else:  # balanced or random
        prefix = random.choice(PREFIXES)
        core = random.choice(CORE_TERMS)
        suffix = random.choice(SUFFIXES)
    
    # Include ticker if provided
    if ticker:
        # Random format selection
        formats = [
            f"{ticker} {prefix} {core}",
            f"{prefix} {ticker} {core}",
            f"{ticker} {core} {suffix}",
            f"{prefix} {core} {suffix} ({ticker})"
        ]
        name = random.choice(formats)
    else:
        name = f"{prefix} {core} {suffix}"
    
    return name


def _determine_style_from_metrics(metrics: dict) -> str:
    """Determine strategy style from performance metrics"""
    sharpe = metrics.get("sharpe", 0)
    volatility = metrics.get("volatility", 0)
    cagr = metrics.get("cagr", 0)
    max_dd = abs(metrics.get("max_drawdown", 0))
    
    # High returns, high volatility = aggressive
    if cagr > 0.20 and volatility > 0.25:
        return "aggressive"
    
    # Low drawdown, low volatility = conservative
    if max_dd < 0.10 and volatility < 0.15:
        return "conservative"
    
    # Otherwise balanced
    return "balanced"


def generate_strategy_description(name: str, metrics: dict, ticker: str = None) -> str:
    """Generate a catchy description for the strategy"""
    sharpe = metrics.get("sharpe", 0)
    cagr = metrics.get("cagr", 0) * 100
    max_dd = abs(metrics.get("max_drawdown", 0)) * 100
    
    descriptions = []
    
    # Sharpe-based descriptions
    if sharpe >= 2.0:
        descriptions.append(f"🔥 Exceptional risk-adjusted returns (Sharpe: {sharpe:.2f})")
    elif sharpe >= 1.5:
        descriptions.append(f"⭐ Strong risk-adjusted performance (Sharpe: {sharpe:.2f})")
    elif sharpe >= 1.0:
        descriptions.append(f"✅ Solid risk-adjusted returns (Sharpe: {sharpe:.2f})")
    
    # CAGR-based descriptions
    if cagr >= 25:
        descriptions.append(f"🚀 Outstanding {cagr:.1f}% annual returns")
    elif cagr >= 15:
        descriptions.append(f"📈 Impressive {cagr:.1f}% annual growth")
    elif cagr >= 10:
        descriptions.append(f"💰 Strong {cagr:.1f}% CAGR")
    
    # Drawdown-based descriptions
    if max_dd < 10:
        descriptions.append(f"🛡️ Minimal {max_dd:.1f}% drawdown")
    elif max_dd < 20:
        descriptions.append(f"✨ Controlled {max_dd:.1f}% max drawdown")
    
    # Combine descriptions
    if descriptions:
        full_desc = " | ".join(descriptions[:2])  # Take top 2
    else:
        full_desc = "A sophisticated algorithmic trading strategy"
    
    if ticker:
        full_desc = f"Trades {ticker} | {full_desc}"
    
    return full_desc