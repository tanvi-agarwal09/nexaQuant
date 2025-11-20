# backend/src/app/services/solana_adapter.py
import os
import uuid
from ..config import settings
import logging

SOLANA_RPC = settings.SOLANA_RPC_URL
SOLANA_PRIVATE_KEY = settings.SOLANA_WALLET_PRIVATE_KEY

def mint_nft_mock(metadata: dict, owner_wallet: str = None):
    """
    For hackathon/demo: return a fake mint address and pretend to mint.
    """
    fake_mint = "MINT" + uuid.uuid4().hex[:24]
    return {"mint_address": fake_mint, "network": "devnet", "metadata": metadata}

def mint_nft_real(metadata: dict, owner_wallet: str = None):
    """
    If you want to implement real minting, use solana-py + metaplex libraries.
    This function will try to do a minimal RPC-based minting flow if credentials present.
    For now, we return the mock to keep the hack stable.
    """
    # TODO: implement real mint using solana-py / metaplex on production.
    return mint_nft_mock(metadata, owner_wallet)

def mint_strategy_nft(metadata: dict, owner_wallet: str = None):
    if SOLANA_PRIVATE_KEY and SOLANA_RPC:
        try:
            return mint_nft_real(metadata, owner_wallet)
        except Exception as e:
            logging.exception("Solana mint failed, falling back to mock")
            return mint_nft_mock(metadata, owner_wallet)
    else:
        return mint_nft_mock(metadata, owner_wallet)
