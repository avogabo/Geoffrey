from rich import print
from .types import Opportunity


class PaperExecutor:
    def execute(self, opp: Opportunity):
        print(f"[green]PAPER EXEC[/green] {opp.market} edge={opp.est_net_edge_bps:.1f}bps notional=${opp.notional_usd}")
        gross_profit = opp.notional_usd * (opp.implied_edge_bps / 10000)
        costs = opp.notional_usd * (opp.total_cost_bps / 10000)
        net_profit = opp.notional_usd * (opp.est_net_edge_bps / 10000)
        return {
            "action": opp.action,
            "market": opp.market,
            "edge_bps": opp.est_net_edge_bps,
            "notional_usd": opp.notional_usd,
            "message": (
                f"{opp.action} en {opp.market} | {opp.side_a}+{opp.side_b} | "
                f"gross={opp.implied_edge_bps:.1f}bps costs={opp.total_cost_bps:.1f}bps net={opp.est_net_edge_bps:.1f}bps | "
                f"notional=${opp.notional_usd} | bruto=${gross_profit:.4f} tasas+gas=${costs:.4f} neto=${net_profit:.4f}"
            ),
        }


class LiveExecutor:
    def execute(self, opp: Opportunity):
        raise NotImplementedError("Live executor pendiente de integrar con API/SDK de Polymarket")
