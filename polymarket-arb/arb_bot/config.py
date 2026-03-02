from pathlib import Path
import yaml
from pydantic import BaseModel


class RuntimeCfg(BaseModel):
    poll_interval_seconds: int = 2
    log_level: str = "INFO"


class StrategyCfg(BaseModel):
    min_edge_bps: float = 40
    min_liquidity_usd: float = 200
    max_slippage_bps: float = 20
    fee_bps_per_leg: float = 15
    gas_bps_roundtrip: float = 5
    signal_cooldown_sec: int = 30


class RiskCfg(BaseModel):
    max_notional_per_trade_usd: float = 20
    max_total_exposure_usd: float = 200
    max_daily_loss_usd: float = 30
    kill_switch: bool = False


class PaperCfg(BaseModel):
    starting_balance_usd: float = 1000


class ExecutionCfg(BaseModel):
    mode: str = "paper"
    dry_run: bool = True


class SecretsCfg(BaseModel):
    polymarket_private_key: str = ""
    polymarket_api_key: str = ""


class AlertsCfg(BaseModel):
    telegram_enabled: bool = False
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    min_seconds_between_alerts: int = 60
    notify_skips: bool = False
    heartbeat_seconds: int = 0


class MarketPairCfg(BaseModel):
    name: str
    yes_asset_id: str
    no_asset_id: str


class MarketDataCfg(BaseModel):
    ws_url: str = "wss://ws-subscriptions-clob.polymarket.com/ws/market"
    asset_ids: list[str] = []
    market_pairs: list[MarketPairCfg] = []
    auto_discover_enabled: bool = True
    auto_discover_limit: int = 500
    auto_discover_refresh_sec: int = 120


class Settings(BaseModel):
    runtime: RuntimeCfg = RuntimeCfg()
    strategy: StrategyCfg = StrategyCfg()
    risk: RiskCfg = RiskCfg()
    paper: PaperCfg = PaperCfg()
    execution: ExecutionCfg = ExecutionCfg()
    market_data: MarketDataCfg = MarketDataCfg()
    alerts: AlertsCfg = AlertsCfg()
    secrets: SecretsCfg = SecretsCfg()


def load_settings(path: str) -> Settings:
    data = yaml.safe_load(Path(path).read_text())
    return Settings.model_validate(data)
