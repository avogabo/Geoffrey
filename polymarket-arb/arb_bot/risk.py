from .config import RiskCfg


class RiskManager:
    def __init__(self, cfg: RiskCfg):
        self.cfg = cfg
        self.current_exposure = 0.0
        self.daily_pnl = 0.0

    def allow_trade(self, notional_usd: float) -> tuple[bool, str]:
        if self.cfg.kill_switch:
            return False, "kill_switch activo"
        if notional_usd > self.cfg.max_notional_per_trade_usd:
            return False, "notional por trade excedido"
        if self.current_exposure + notional_usd > self.cfg.max_total_exposure_usd:
            return False, "exposición total excedida"
        if self.daily_pnl <= -abs(self.cfg.max_daily_loss_usd):
            return False, "límite de pérdida diaria alcanzado"
        return True, "ok"

    def on_fill(self, notional_usd: float):
        self.current_exposure += notional_usd
