from rich import print
from .types import Opportunity


class PaperExecutor:
    def execute(self, opp: Opportunity):
        print(f"[green]PAPER EXEC[/green] {opp.market} edge={opp.est_net_edge_bps:.1f}bps notional=${opp.notional_usd}")
        return {
            "action": "paper_trade",
            "market": opp.market,
            "edge_bps": opp.est_net_edge_bps,
            "notional_usd": opp.notional_usd,
            "message": f"He comprado/vendido en {opp.market}. Edge={opp.est_net_edge_bps:.1f}bps. Notional=${opp.notional_usd}",
        }


class LiveExecutor:
    def execute(self, opp: Opportunity):
        raise NotImplementedError("Live executor pendiente de integrar con API/SDK de Polymarket")
