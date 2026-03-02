from rich import print
from .types import Opportunity


class PaperExecutor:
    def execute(self, opp: Opportunity):
        print(f"[green]PAPER EXEC[/green] {opp.market} edge={opp.est_net_edge_bps:.1f}bps notional=${opp.notional_usd}")
        est_profit = opp.notional_usd * (opp.est_net_edge_bps / 10000)
        return {
            "action": opp.action,
            "market": opp.market,
            "edge_bps": opp.est_net_edge_bps,
            "notional_usd": opp.notional_usd,
            "message": f"{opp.action} en {opp.market} | {opp.side_a}+{opp.side_b} | edge={opp.est_net_edge_bps:.1f}bps | notional=${opp.notional_usd} | est_profit=${est_profit:.4f}",
        }


class LiveExecutor:
    def execute(self, opp: Opportunity):
        raise NotImplementedError("Live executor pendiente de integrar con API/SDK de Polymarket")
