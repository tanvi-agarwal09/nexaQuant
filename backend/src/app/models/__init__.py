# backend/src/app/models/__init__.py
# import models to register with SQLAlchemy metadata at startup
from .user import User  # noqa: F401
from .backtest import Backtest  # noqa: F401
from .strategy import Strategy  # noqa: F401
from .guru import GuruCall, GuruScore  # noqa: F401
from .nft import NFT  # noqa: F401
from .agent_log import AgentLog  # noqa: F401
