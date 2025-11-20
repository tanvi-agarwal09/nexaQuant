# # backend/src/app/agents/marketplace_agents.py
# import json
# import random
# from ..services.openrouter_adapter import openrouter_complete, OpenRouterError

# class BuyerAgent:
#     """Autonomous buyer agent that negotiates for strategy NFTs"""
    
#     def __init__(self, budget: float, requirements: dict):
#         self.budget = budget
#         self.requirements = requirements
#         self.negotiation_history = []
    
#     def create_initial_offer(self, strategy_metadata: dict) -> dict:
#         """Create initial offer based on strategy metrics"""
#         strategy_score = self._evaluate_strategy(strategy_metadata)
        
#         prompt = f"""
# You are a sophisticated buyer agent negotiating to purchase a trading strategy NFT.

# Your Budget: ${self.budget}
# Your Requirements:
# - Min Sharpe Ratio: {self.requirements.get('min_sharpe', 1.0)}
# - Max Drawdown Tolerance: {self.requirements.get('max_drawdown', -0.15)}
# - Min CAGR: {self.requirements.get('min_cagr', 0.10)}

# Strategy Being Offered:
# {json.dumps(strategy_metadata, indent=2)}

# Strategy meets your criteria with a score of {strategy_score}/100.

# Create an initial offer. Consider:
# 1. Strategy performance vs your requirements
# 2. Your budget constraints
# 3. Negotiation room for counter-offers
# 4. Risk-adjusted value

# Return ONLY a JSON object with:
# {{
#   "offer_price": <float>,
#   "reasoning": "<why this price>",
#   "conditions": ["<any special conditions>"],
#   "confidence": <0-1 float>
# }}
# """
        
#         try:
#             response = openrouter_complete(prompt, model="gpt-4o-mini", max_tokens=400, temperature=0.7)
#             offer = json.loads(response.strip())
#             self.negotiation_history.append({"type": "buyer_offer", "data": offer})
#             return offer
#         except Exception as e:
#             # Fallback offer
#             base_offer = self.budget * 0.6 * (strategy_score / 100)
#             return {
#                 "offer_price": base_offer,
#                 "reasoning": f"Initial offer based on {strategy_score}/100 strategy score",
#                 "conditions": ["Performance guarantee for 30 days"],
#                 "confidence": 0.7
#             }
    
#     def counter_offer(self, seller_response: dict, iteration: int) -> dict:
#         """Generate counter-offer based on seller's response"""
#         prompt = f"""
# You are a buyer agent in negotiation round {iteration}/6.

# Negotiation History:
# {json.dumps(self.negotiation_history, indent=2)}

# Seller's Latest Response:
# {json.dumps(seller_response, indent=2)}

# Your Budget: ${self.budget}
# Your Requirements: {json.dumps(self.requirements)}

# Decide your next move:
# 1. Accept the seller's offer if it's reasonable
# 2. Make a counter-offer
# 3. Walk away if deal is impossible

# Return ONLY a JSON object:
# {{
#   "action": "accept" | "counter" | "walk_away",
#   "offer_price": <float if counter>,
#   "reasoning": "<strategic explanation>",
#   "conditions": ["<modified conditions>"],
#   "confidence": <0-1 float>
# }}
# """
        
#         try:
#             response = openrouter_complete(prompt, model="gpt-4o-mini", max_tokens=400, temperature=0.7)
#             counter = json.loads(response.strip())
#             self.negotiation_history.append({"type": "buyer_counter", "data": counter})
#             return counter
#         except Exception:
#             # Fallback: Meet halfway if reasonable
#             if seller_response.get("counter_price", 0) <= self.budget:
#                 return {
#                     "action": "counter",
#                     "offer_price": (self.negotiation_history[-1]["data"]["offer_price"] + seller_response["counter_price"]) / 2,
#                     "reasoning": "Meeting halfway",
#                     "conditions": [],
#                     "confidence": 0.6
#                 }
#             else:
#                 return {"action": "walk_away", "reasoning": "Price exceeds budget"}
    
#     def _evaluate_strategy(self, metadata: dict) -> float:
#         """Score strategy from 0-100 based on requirements"""
#         metrics = metadata.get("metrics", {})
#         score = 0
        
#         # Sharpe ratio component (40 points)
#         sharpe = metrics.get("sharpe", 0)
#         if sharpe >= self.requirements.get("min_sharpe", 1.0):
#             score += min(40, sharpe * 20)
        
#         # CAGR component (30 points)
#         cagr = metrics.get("cagr", 0)
#         if cagr >= self.requirements.get("min_cagr", 0.10):
#             score += min(30, cagr * 150)
        
#         # Max drawdown component (30 points)
#         max_dd = abs(metrics.get("max_drawdown", 1))
#         if max_dd <= abs(self.requirements.get("max_drawdown", 0.15)):
#             score += 30 * (1 - max_dd)
        
#         return min(100, score)


# class SellerAgent:
#     """Autonomous seller agent that negotiates strategy NFT sales"""
    
#     def __init__(self, strategy_metadata: dict, min_price: float, personality: str = "balanced"):
#         self.strategy_metadata = strategy_metadata
#         self.min_price = min_price
#         self.personality = personality  # aggressive, balanced, cooperative
#         self.negotiation_history = []
    
#     def respond_to_offer(self, buyer_offer: dict, iteration: int) -> dict:
#         """Respond to buyer's offer with counter or acceptance"""
#         prompt = f"""
# You are a {self.personality} seller agent selling a trading strategy NFT.

# Your Strategy Metadata:
# {json.dumps(self.strategy_metadata, indent=2)}

# Your Minimum Acceptable Price: ${self.min_price}
# Negotiation Round: {iteration}/6

# Buyer's Latest Offer:
# {json.dumps(buyer_offer, indent=2)}

# Negotiation History:
# {json.dumps(self.negotiation_history, indent=2)}

# Personality: {self.personality}
# - Aggressive: Push for higher prices, less flexible
# - Balanced: Fair negotiation, moderate flexibility
# - Cooperative: More willing to compromise

# Decide your response:
# 1. Accept if offer meets your minimum and is reasonable
# 2. Make a counter-offer with justification
# 3. Reject if offer is too low and time to walk away

# Return ONLY a JSON object:
# {{
#   "action": "accept" | "counter" | "reject",
#   "counter_price": <float if counter>,
#   "reasoning": "<justify based on strategy performance>",
#   "adjustments": ["<concessions or additions>"],
#   "confidence": <0-1 float>
# }}
# """
        
#         try:
#             response = openrouter_complete(prompt, model="gpt-4o-mini", max_tokens=400, temperature=0.7)
#             seller_response = json.loads(response.strip())
#             self.negotiation_history.append({"type": "seller_response", "data": seller_response})
#             return seller_response
#         except Exception:
#             # Fallback logic
#             offer_price = buyer_offer.get("offer_price", 0)
            
#             if offer_price >= self.min_price * 1.2:
#                 return {
#                     "action": "accept",
#                     "reasoning": "Offer meets expectations",
#                     "confidence": 0.9
#                 }
#             elif offer_price >= self.min_price * 0.8:
#                 return {
#                     "action": "counter",
#                     "counter_price": (offer_price + self.min_price * 1.3) / 2,
#                     "reasoning": "Counter-offer closer to market value",
#                     "adjustments": ["Include 60-day performance tracking"],
#                     "confidence": 0.7
#                 }
#             else:
#                 return {
#                     "action": "reject",
#                     "reasoning": "Offer too far below minimum acceptable price",
#                     "confidence": 0.8
#                 }


# def run_marketplace_negotiation(strategy_metadata: dict, buyer_budget: float, buyer_requirements: dict) -> dict:
#     """
#     Run a full marketplace negotiation simulation between buyer and multiple sellers.
#     Returns negotiation transcript and final deal (if any).
#     """
    
#     # Create buyer
#     buyer = BuyerAgent(budget=buyer_budget, requirements=buyer_requirements)
    
#     # Create 3 sellers with different personalities and pricing
#     base_price = _estimate_strategy_value(strategy_metadata)
#     sellers = [
#         SellerAgent(strategy_metadata, min_price=base_price * 1.2, personality="aggressive"),
#         SellerAgent(strategy_metadata, min_price=base_price * 0.9, personality="balanced"),
#         SellerAgent(strategy_metadata, min_price=base_price * 0.7, personality="cooperative")
#     ]
    
#     negotiations = []
    
#     # Negotiate with each seller
#     for idx, seller in enumerate(sellers):
#         negotiation = {
#             "seller_id": f"seller_{idx + 1}",
#             "personality": seller.personality,
#             "min_price": seller.min_price,
#             "rounds": []
#         }
        
#         # Initial buyer offer
#         initial_offer = buyer.create_initial_offer(strategy_metadata)
#         negotiation["rounds"].append({
#             "round": 1,
#             "buyer_action": "initial_offer",
#             "buyer_data": initial_offer
#         })
        
#         # Up to 5 rounds of negotiation
#         for round_num in range(2, 7):
#             # Seller responds
#             seller_response = seller.respond_to_offer(initial_offer if round_num == 2 else buyer_counter, round_num)
#             negotiation["rounds"].append({
#                 "round": round_num,
#                 "seller_action": seller_response["action"],
#                 "seller_data": seller_response
#             })
            
#             # Check if accepted or rejected
#             if seller_response["action"] == "accept":
#                 negotiation["outcome"] = "deal_accepted"
#                 negotiation["final_price"] = initial_offer.get("offer_price") if round_num == 2 else buyer_counter.get("offer_price")
#                 break
#             elif seller_response["action"] == "reject":
#                 negotiation["outcome"] = "deal_rejected"
#                 break
            
#             # Buyer counter-offers
#             if round_num < 6:
#                 buyer_counter = buyer.counter_offer(seller_response, round_num)
#                 negotiation["rounds"].append({
#                     "round": round_num,
#                     "buyer_action": buyer_counter["action"],
#                     "buyer_data": buyer_counter
#                 })
                
#                 if buyer_counter["action"] == "accept":
#                     negotiation["outcome"] = "deal_accepted"
#                     negotiation["final_price"] = seller_response.get("counter_price")
#                     break
#                 elif buyer_counter["action"] == "walk_away":
#                     negotiation["outcome"] = "buyer_walked_away"
#                     break
        
#         # If no outcome set, negotiation timed out
#         if "outcome" not in negotiation:
#             negotiation["outcome"] = "negotiation_timeout"
        
#         negotiations.append(negotiation)
    
#     # Find best deal
#     successful_deals = [n for n in negotiations if n["outcome"] == "deal_accepted"]
    
#     if successful_deals:
#         best_deal = min(successful_deals, key=lambda x: x["final_price"])
#         return {
#             "status": "success",
#             "best_deal": best_deal,
#             "all_negotiations": negotiations,
#             "summary": f"Deal reached with {best_deal['seller_id']} ({best_deal['personality']}) at ${best_deal['final_price']:.2f}"
#         }
#     else:
#         return {
#             "status": "no_deal",
#             "all_negotiations": negotiations,
#             "summary": "No deal reached with any seller. Buyer requirements or budget may be too restrictive."
#         }


# def _estimate_strategy_value(metadata: dict) -> float:
#     """Estimate fair market value of strategy based on performance"""
#     metrics = metadata.get("metrics", {})
    
#     base_value = 100  # Base price
    
#     # Add value based on performance
#     sharpe_bonus = max(0, metrics.get("sharpe", 0)) * 50
#     cagr_bonus = max(0, metrics.get("cagr", 0)) * 500
#     dd_penalty = abs(metrics.get("max_drawdown", 0)) * 200
    
#     estimated_value = base_value + sharpe_bonus + cagr_bonus - dd_penalty
    
#     return max(50, estimated_value)  # Minimum $50

# backend/src/app/agents/marketplace_agents.py
import json
import random
from ..services.openrouter_adapter import openrouter_complete, OpenRouterError

class BuyerAgent:
    """Autonomous buyer agent that negotiates for strategy NFTs"""
    
    def __init__(self, budget: float, requirements: dict):
        self.budget = budget
        self.requirements = requirements
        self.negotiation_history = []
    
    def create_initial_offer(self, strategy_metadata: dict) -> dict:
        """Create initial offer based on strategy metrics"""
        strategy_score = self._evaluate_strategy(strategy_metadata)
        
        prompt = f"""
You are a sophisticated buyer agent negotiating to purchase a trading strategy NFT.

Your Budget: ${self.budget}
Your Requirements:
- Min Sharpe Ratio: {self.requirements.get('min_sharpe', 1.0)}
- Max Drawdown Tolerance: {self.requirements.get('max_drawdown', -0.15)}
- Min CAGR: {self.requirements.get('min_cagr', 0.10)}

Strategy Being Offered:
{json.dumps(strategy_metadata, indent=2)}

Strategy meets your criteria with a score of {strategy_score}/100.

Create an initial offer. Consider:
1. Strategy performance vs your requirements
2. Your budget constraints
3. Negotiation room for counter-offers
4. Risk-adjusted value

Return ONLY a JSON object with:
{{
  "offer_price": <float>,
  "reasoning": "<why this price>",
  "conditions": ["<any special conditions>"],
  "confidence": <0-1 float>
}}
"""
        
        try:
            response = openrouter_complete(prompt, model="gpt-4o-mini", max_tokens=400, temperature=0.7)
            offer = json.loads(response.strip())
            self.negotiation_history.append({"type": "buyer_offer", "data": offer})
            return offer
        except Exception as e:
            # Fallback offer
            base_offer = self.budget * 0.6 * (strategy_score / 100)
            return {
                "offer_price": base_offer,
                "reasoning": f"Initial offer based on {strategy_score}/100 strategy score",
                "conditions": ["Performance guarantee for 30 days"],
                "confidence": 0.7
            }
    
    def counter_offer(self, seller_response: dict, iteration: int) -> dict:
        """Generate counter-offer based on seller's response"""
        prompt = f"""
You are a buyer agent in negotiation round {iteration}/6.

Negotiation History:
{json.dumps(self.negotiation_history, indent=2)}

Seller's Latest Response:
{json.dumps(seller_response, indent=2)}

Your Budget: ${self.budget}
Your Requirements: {json.dumps(self.requirements)}

Decide your next move:
1. Accept the seller's offer if it's reasonable
2. Make a counter-offer
3. Walk away if deal is impossible

Return ONLY a JSON object:
{{
  "action": "accept" | "counter" | "walk_away",
  "offer_price": <float if counter>,
  "reasoning": "<strategic explanation>",
  "conditions": ["<modified conditions>"],
  "confidence": <0-1 float>
}}
"""
        
        try:
            response = openrouter_complete(prompt, model="gpt-4o-mini", max_tokens=400, temperature=0.7)
            counter = json.loads(response.strip())
            self.negotiation_history.append({"type": "buyer_counter", "data": counter})
            return counter
        except Exception:
            # Fallback: Meet halfway if reasonable
            if seller_response.get("counter_price", 0) <= self.budget:
                return {
                    "action": "counter",
                    "offer_price": (self.negotiation_history[-1]["data"]["offer_price"] + seller_response["counter_price"]) / 2,
                    "reasoning": "Meeting halfway",
                    "conditions": [],
                    "confidence": 0.6
                }
            else:
                return {"action": "walk_away", "reasoning": "Price exceeds budget"}
    
    def _evaluate_strategy(self, metadata: dict) -> float:
        """Score strategy from 0-100 based on requirements"""
        metrics = metadata.get("metrics", {})
        score = 0
        
        # Sharpe ratio component (40 points)
        sharpe = metrics.get("sharpe", 0)
        if sharpe >= self.requirements.get("min_sharpe", 1.0):
            score += min(40, sharpe * 20)
        
        # CAGR component (30 points)
        cagr = metrics.get("cagr", 0)
        if cagr >= self.requirements.get("min_cagr", 0.10):
            score += min(30, cagr * 150)
        
        # Max drawdown component (30 points)
        max_dd = abs(metrics.get("max_drawdown", 1))
        if max_dd <= abs(self.requirements.get("max_drawdown", 0.15)):
            score += 30 * (1 - max_dd)
        
        return min(100, score)


class SellerAgent:
    """Autonomous seller agent that negotiates strategy NFT sales"""
    
    def __init__(self, strategy_metadata: dict, min_price: float, personality: str = "balanced"):
        self.strategy_metadata = strategy_metadata
        self.min_price = min_price
        self.personality = personality  # aggressive, balanced, cooperative
        self.negotiation_history = []
    
    def respond_to_offer(self, buyer_offer: dict, iteration: int) -> dict:
        """Respond to buyer's offer with counter or acceptance"""
        prompt = f"""
You are a {self.personality} seller agent selling a trading strategy NFT.

Your Strategy Metadata:
{json.dumps(self.strategy_metadata, indent=2)}

Your Minimum Acceptable Price: ${self.min_price}
Negotiation Round: {iteration}/6

Buyer's Latest Offer:
{json.dumps(buyer_offer, indent=2)}

Negotiation History:
{json.dumps(self.negotiation_history, indent=2)}

Personality: {self.personality}
- Aggressive: Push for higher prices, less flexible
- Balanced: Fair negotiation, moderate flexibility
- Cooperative: More willing to compromise

Decide your response:
1. Accept if offer meets your minimum and is reasonable
2. Make a counter-offer with justification
3. Reject if offer is too low and time to walk away

Return ONLY a JSON object:
{{
  "action": "accept" | "counter" | "reject",
  "counter_price": <float if counter>,
  "reasoning": "<justify based on strategy performance>",
  "adjustments": ["<concessions or additions>"],
  "confidence": <0-1 float>
}}
"""
        
        try:
            response = openrouter_complete(prompt, model="gpt-4o-mini", max_tokens=400, temperature=0.7)
            seller_response = json.loads(response.strip())
            self.negotiation_history.append({"type": "seller_response", "data": seller_response})
            return seller_response
        except Exception:
            # Fallback logic
            offer_price = buyer_offer.get("offer_price", 0)
            
            if offer_price >= self.min_price * 1.2:
                return {
                    "action": "accept",
                    "reasoning": "Offer meets expectations",
                    "confidence": 0.9
                }
            elif offer_price >= self.min_price * 0.8:
                return {
                    "action": "counter",
                    "counter_price": (offer_price + self.min_price * 1.3) / 2,
                    "reasoning": "Counter-offer closer to market value",
                    "adjustments": ["Include 60-day performance tracking"],
                    "confidence": 0.7
                }
            else:
                return {
                    "action": "reject",
                    "reasoning": "Offer too far below minimum acceptable price",
                    "confidence": 0.8
                }


def run_marketplace_negotiation(strategy_metadata: dict, buyer_budget: float, buyer_requirements: dict) -> dict:
    """
    Run a full marketplace negotiation simulation between buyer and multiple sellers.
    Returns negotiation transcript and final deal (if any).
    """
    
    # Create buyer
    buyer = BuyerAgent(budget=buyer_budget, requirements=buyer_requirements)
    
    # Create 3 sellers with different personalities and pricing
    base_price = _estimate_strategy_value(strategy_metadata)
    sellers = [
        SellerAgent(strategy_metadata, min_price=base_price * 1.2, personality="aggressive"),
        SellerAgent(strategy_metadata, min_price=base_price * 0.9, personality="balanced"),
        SellerAgent(strategy_metadata, min_price=base_price * 0.7, personality="cooperative")
    ]
    
    negotiations = []
    buyer_strategy_summary = {
        "initial_budget": buyer_budget,
        "requirements": buyer_requirements,
        "strategy_evaluation": buyer._evaluate_strategy(strategy_metadata),
        "negotiation_approach": "Multi-seller competitive bidding"
    }
    
    # Negotiate with each seller
    for idx, seller in enumerate(sellers):
        negotiation = {
            "seller_id": f"seller_{idx + 1}",
            "personality": seller.personality,
            "min_price": seller.min_price,
            "starting_ask": base_price * (1.2 if seller.personality == "aggressive" else 0.9 if seller.personality == "balanced" else 0.7),
            "rounds": []
        }
        
        # Initial buyer offer
        initial_offer = buyer.create_initial_offer(strategy_metadata)
        negotiation["rounds"].append({
            "round": 1,
            "actor": "buyer",
            "action": "initial_offer",
            "data": initial_offer,
            "price": initial_offer.get("offer_price"),
            "reasoning": initial_offer.get("reasoning")
        })
        
        # Up to 5 rounds of negotiation
        for round_num in range(2, 7):
            # Seller responds
            seller_response = seller.respond_to_offer(initial_offer if round_num == 2 else buyer_counter, round_num)
            negotiation["rounds"].append({
                "round": round_num,
                "actor": "seller",
                "action": seller_response["action"],
                "data": seller_response,
                "price": seller_response.get("counter_price"),
                "reasoning": seller_response.get("reasoning")
            })
            
            # Check if accepted or rejected
            if seller_response["action"] == "accept":
                negotiation["outcome"] = "deal_accepted"
                negotiation["final_price"] = initial_offer.get("offer_price") if round_num == 2 else buyer_counter.get("offer_price")
                negotiation["savings"] = negotiation["starting_ask"] - negotiation["final_price"]
                negotiation["discount_percent"] = (negotiation["savings"] / negotiation["starting_ask"]) * 100
                break
            elif seller_response["action"] == "reject":
                negotiation["outcome"] = "deal_rejected"
                negotiation["rejection_reason"] = seller_response.get("reasoning")
                break
            
            # Buyer counter-offers
            if round_num < 6:
                buyer_counter = buyer.counter_offer(seller_response, round_num)
                negotiation["rounds"].append({
                    "round": round_num,
                    "actor": "buyer",
                    "action": buyer_counter["action"],
                    "data": buyer_counter,
                    "price": buyer_counter.get("offer_price"),
                    "reasoning": buyer_counter.get("reasoning")
                })
                
                if buyer_counter["action"] == "accept":
                    negotiation["outcome"] = "deal_accepted"
                    negotiation["final_price"] = seller_response.get("counter_price")
                    negotiation["savings"] = negotiation["starting_ask"] - negotiation["final_price"]
                    negotiation["discount_percent"] = (negotiation["savings"] / negotiation["starting_ask"]) * 100
                    break
                elif buyer_counter["action"] == "walk_away":
                    negotiation["outcome"] = "buyer_walked_away"
                    negotiation["walkaway_reason"] = buyer_counter.get("reasoning")
                    break
        
        # If no outcome set, negotiation timed out
        if "outcome" not in negotiation:
            negotiation["outcome"] = "negotiation_timeout"
            negotiation["last_buyer_offer"] = negotiation["rounds"][-1].get("price") if negotiation["rounds"][-1]["actor"] == "buyer" else None
            negotiation["last_seller_ask"] = negotiation["rounds"][-1].get("price") if negotiation["rounds"][-1]["actor"] == "seller" else None
        
        negotiations.append(negotiation)
    
    # Find best deal
    successful_deals = [n for n in negotiations if n["outcome"] == "deal_accepted"]
    
    if successful_deals:
        best_deal = min(successful_deals, key=lambda x: x["final_price"])
        return {
            "status": "success",
            "best_deal": best_deal,
            "all_negotiations": negotiations,
            "buyer_strategy": buyer_strategy_summary,
            "summary": f"Deal reached with {best_deal['seller_id']} ({best_deal['personality']}) at ${best_deal['final_price']:.2f} (saved ${best_deal['savings']:.2f}, {best_deal['discount_percent']:.1f}% discount)",
            "total_rounds": sum(len(n["rounds"]) for n in negotiations),
            "sellers_contacted": len(negotiations),
            "deals_successful": len(successful_deals)
        }
    else:
        return {
            "status": "no_deal",
            "all_negotiations": negotiations,
            "buyer_strategy": buyer_strategy_summary,
            "summary": "No deal reached with any seller. Buyer requirements or budget may be too restrictive.",
            "total_rounds": sum(len(n["rounds"]) for n in negotiations),
            "sellers_contacted": len(negotiations),
            "deals_successful": 0,
            "closest_deal": min(negotiations, key=lambda x: abs(x["rounds"][-1].get("price", float('inf')) - buyer_budget)) if negotiations else None
        }


def _estimate_strategy_value(metadata: dict) -> float:
    """Estimate fair market value of strategy based on performance"""
    metrics = metadata.get("metrics", {})
    
    base_value = 100  # Base price
    
    # Add value based on performance
    sharpe_bonus = max(0, metrics.get("sharpe", 0)) * 50
    cagr_bonus = max(0, metrics.get("cagr", 0)) * 500
    dd_penalty = abs(metrics.get("max_drawdown", 0)) * 200
    
    estimated_value = base_value + sharpe_bonus + cagr_bonus - dd_penalty
    
    return max(50, estimated_value)  # Minimum $50