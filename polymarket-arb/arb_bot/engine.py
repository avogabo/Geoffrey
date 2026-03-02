from .types import Opportunity
from .config import StrategyCfg


class ArbEngine:
    def __init__(self, cfg: StrategyCfg):
        self.cfg = cfg

    def detect(self, market_snapshots: list[dict]) -> list[Opportunity]:
        out: list[Opportunity] = []
        # Round-trip cost approximation: 2 legs + slippage buffer.
        total_cost_bps = (2 * self.cfg.fee_bps_per_leg) + self.cfg.max_slippage_bps

        for snap in market_snapshots:
            liq = float(snap.get("liquidity_usd", 0))
            if liq < self.cfg.min_liquidity_usd:
                continue

            if "ask_sum" in snap and "bid_sum" in snap:
                ask_sum = float(snap.get("ask_sum", 2))
                bid_sum = float(snap.get("bid_sum", 0))

                # Long bundle: buy YES+NO when sum asks < 1
                gross_long_bps = max(0.0, (1.0 - ask_sum) * 10000)
                net_long_bps = gross_long_bps - total_cost_bps
                if net_long_bps >= self.cfg.min_edge_bps:
                    out.append(
                        Opportunity(
                            market=snap.get("market", "unknown"),
                            side_a="BUY_YES",
                            side_b="BUY_NO",
                            implied_edge_bps=gross_long_bps,
                            est_net_edge_bps=net_long_bps,
                            notional_usd=float(snap.get("notional_usd", 10)),
                            action="long_bundle",
                        )
                    )

                # Short bundle: sell YES+NO when sum bids > 1
                gross_short_bps = max(0.0, (bid_sum - 1.0) * 10000)
                net_short_bps = gross_short_bps - total_cost_bps
                if net_short_bps >= self.cfg.min_edge_bps:
                    out.append(
                        Opportunity(
                            market=snap.get("market", "unknown"),
                            side_a="SELL_YES",
                            side_b="SELL_NO",
                            implied_edge_bps=gross_short_bps,
                            est_net_edge_bps=net_short_bps,
                            notional_usd=float(snap.get("notional_usd", 10)),
                            action="short_bundle",
                        )
                    )
                continue

            # Fallback legacy heuristic
            edge = float(snap.get("est_net_edge_bps", 0))
            if edge >= self.cfg.min_edge_bps:
                out.append(
                    Opportunity(
                        market=snap.get("market", "unknown"),
                        side_a=snap.get("side_a", "BUY"),
                        side_b=snap.get("side_b", "SELL"),
                        implied_edge_bps=float(snap.get("implied_edge_bps", edge)),
                        est_net_edge_bps=edge,
                        notional_usd=float(snap.get("notional_usd", 10)),
                    )
                )
        return out
