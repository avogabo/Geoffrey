import argparse
import time
from rich import print

from .config import load_settings
from .engine import ArbEngine
from .risk import RiskManager
from .executor import PaperExecutor, LiveExecutor


def fake_market_feed() -> list[dict]:
    # Mock para validar pipeline end-to-end sin exchange real.
    return [
        {"market": "example-election", "est_net_edge_bps": 55, "liquidity_usd": 500, "notional_usd": 10},
        {"market": "example-macro", "est_net_edge_bps": 12, "liquidity_usd": 1500, "notional_usd": 10},
    ]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--mode", choices=["paper", "live"], default=None)
    args = ap.parse_args()

    cfg = load_settings(args.config)
    mode = args.mode or cfg.execution.mode

    engine = ArbEngine(cfg.strategy)
    risk = RiskManager(cfg.risk)
    executor = PaperExecutor() if mode == "paper" else LiveExecutor()

    print(f"[cyan]Bot iniciado[/cyan] mode={mode} poll={cfg.runtime.poll_interval_seconds}s")

    while True:
        snapshots = fake_market_feed()  # TODO: reemplazar por collector real
        opportunities = engine.detect(snapshots)

        for opp in opportunities:
            ok, reason = risk.allow_trade(opp.notional_usd)
            if not ok:
                print(f"[yellow]SKIP[/yellow] {opp.market} -> {reason}")
                continue

            if cfg.execution.dry_run and mode == "live":
                print(f"[yellow]DRY-RUN LIVE[/yellow] {opp}")
            else:
                executor.execute(opp)
                risk.on_fill(opp.notional_usd)

        time.sleep(cfg.runtime.poll_interval_seconds)


if __name__ == "__main__":
    main()
