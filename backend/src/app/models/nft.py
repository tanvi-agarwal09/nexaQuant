# backend/src/app/models/nft.py
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.sql import func
from ..db.database import Base

class NFT(Base):
    __tablename__ = "nfts"
    id = Column(String, primary_key=True, index=True)
    strategy_id = Column(String, nullable=True)
    owner_user_id = Column(String, nullable=True)
    solana_mint_address = Column(String, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    network = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
