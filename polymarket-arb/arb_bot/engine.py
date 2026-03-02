from .types import Opportunity
from .config import StrategyCfg


class ArbEngine:
    def __init__(self, cfg: StrategyCfg):
        self.cfg = cfg

    def detect(self, market_snapshots: list[dict]) -> list[Opportunity]:
        """
        Placeholder: aquí irá la lógica real con orderbooks de Polymarket.
        Debe devolver oportunidades con edge neto > min_edge_bps.
        """
        out: list[Opportunity] = []
        for snap in market_snapshots:
            edge = float(snap.get("est_net_edge_bps", 0))
            liq = float(snap.get("liquidity_usd", 0))
            if edge >= self.cfg.min_edge_bps and liq >= self.cfg.min_liquidity_usd:
                out.append(
                    Opportunity(
                        market=snap.get("market", "unknown"),
                        side_a=snap.get("side_a", "YES"),
                        side_b=snap.get("side_b", "NO"),
                        implied_edge_bps=float(snap.get("implied_edge_bps", edge)),
                        est_net_edge_bps=edge,
                        notional_usd=float(snap.get("notional_usd", 10)),
                    )
                )
        return out
