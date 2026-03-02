from dataclasses import dataclass


@dataclass
class Opportunity:
    market: str
    side_a: str
    side_b: str
    implied_edge_bps: float
    est_net_edge_bps: float
    notional_usd: float
    action: str = "long_bundle"
    strategy_name: str = "yes_no_parity_arb"
