# backend/src/app/db/crud.py
import uuid
from sqlalchemy.orm import Session
from ..models.strategy import Strategy, StrategyStatus
from ..models.backtest import Backtest
from ..models.guru import GuruCall, GuruScore
from ..models.nft import NFT
from ..models.agent_log import AgentLog
from ..models.user import User

def create_user(db: Session, user_id: str, email: str = None, display_name: str = None):
    u = User(id=user_id, email=email, display_name=display_name)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u

def create_strategy(db: Session, user_id: str, title: str, description_text: str):
    sid = str(uuid.uuid4())
    strategy = Strategy(
        id=sid, user_id=user_id, title=title, description_text=description_text, status=StrategyStatus.PARSING
    )
    db.add(strategy)
    db.commit()
    db.refresh(strategy)
    return strategy

def update_strategy_parsed(db: Session, strategy_id: str, structured_json: dict, code_text: str):
    s = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not s:
        return None
    s.structured_json = structured_json
    s.code_text = code_text
    s.status = StrategyStatus.BACKTESTING
    db.commit()
    db.refresh(s)
    return s

def complete_strategy(db: Session, strategy_id: str):
    s = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not s:
        return None
    s.status = StrategyStatus.COMPLETE
    db.commit()
    db.refresh(s)
    return s

def create_backtest(db: Session, strategy_id: str, start_date: str, end_date: str, metrics: dict, timeseries_path: str):
    bid = str(uuid.uuid4())
    b = Backtest(id=bid, strategy_id=strategy_id, start_date=start_date, end_date=end_date, metrics_json=metrics, pnl_timeseries_path=timeseries_path)
    db.add(b)
    db.commit()
    db.refresh(b)
    return b

def create_guru_call(db: Session, source: str, transcript_text: str, extracted_calls_json: dict):
    gid = str(uuid.uuid4())
    g = GuruCall(id=gid, source=source, transcript_text=transcript_text, extracted_calls_json=extracted_calls_json)
    db.add(g)
    db.commit()
    db.refresh(g)
    return g

def create_guru_score(db: Session, guru_identifier: str, calculated_score: float, metrics_json: dict, badge_tier: str):
    gid = str(uuid.uuid4())
    g = GuruScore(id=gid, guru_identifier=guru_identifier, calculated_score=str(calculated_score), metrics_json=metrics_json, badge_tier=badge_tier)
    db.add(g)
    db.commit()
    db.refresh(g)
    return g

def create_nft_record(db: Session, strategy_id: str, owner_user_id: str, solana_mint_address: str, metadata_json: dict):
    nid = str(uuid.uuid4())
    n = NFT(id=nid, strategy_id=strategy_id, owner_user_id=owner_user_id, solana_mint_address=solana_mint_address, metadata_json=metadata_json, network="devnet")
    db.add(n)
    db.commit()
    db.refresh(n)
    return n

def log_agent(db: Session, agent_name: str, job_id: str, input_json: dict, output_json: dict, status: str):
    aid = str(uuid.uuid4())
    log = AgentLog(id=aid, agent_name=agent_name, job_id=job_id, input_json=input_json, output_json=output_json, status=status)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
