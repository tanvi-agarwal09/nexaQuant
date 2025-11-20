from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./nexaquant.db"
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    REDIS_URL: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    SOLANA_RPC_URL: str = "https://api.devnet.solana.com"
    SOLANA_WALLET_PRIVATE_KEY: Optional[str] = None
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    # Agent settings
    AGENT_MAX_WORKERS: int = 4

    class Config:
        env_file = ".env"

settings = Settings()
