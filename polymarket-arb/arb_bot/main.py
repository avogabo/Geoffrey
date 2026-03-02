import argparse
import time
from rich import print

from .config import load_settings
from .engine import ArbEngine
from .risk import RiskManager
from .executor import PaperExecutor, LiveExecutor
from .collector import PolymarketMarketWSCollector
from .notifier import TelegramNotifier


def fake_market_feed() -> list[dict]:
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

    collector = None
    if cfg.market_data.asset_ids:
        pairs = [
            {
                "name": p.name,
                "yes_asset_id": p.yes_asset_id,
                "no_asset_id": p.no_asset_id,
            }
            for p in cfg.market_data.market_pairs
        ]
        collector = PolymarketMarketWSCollector(cfg.market_data.ws_url, cfg.market_data.asset_ids, pairs)
        collector.start()
        print(f"[green]WS collector activo[/green] assets={len(cfg.market_data.asset_ids)} pairs={len(pairs)}")

    notifier = TelegramNotifier(
        enabled=cfg.alerts.telegram_enabled,
        bot_token=cfg.alerts.telegram_bot_token,
        chat_id=cfg.alerts.telegram_chat_id,
        min_interval_sec=cfg.alerts.min_seconds_between_alerts,
    )

    print(f"[cyan]Bot iniciado[/cyan] mode={mode} poll={cfg.runtime.poll_interval_seconds}s")
    last_signal_at: dict[str, float] = {}

    while True:
        snapshots = collector.snapshots() if collector else fake_market_feed()
        opportunities = engine.detect(snapshots)

        for opp in opportunities:
            signal_key = f"{opp.market}:{opp.action}"
            now = time.time()
            last = last_signal_at.get(signal_key, 0)
            if now - last < cfg.strategy.signal_cooldown_sec:
                continue

            ok, reason = risk.allow_trade(opp.notional_usd)
            if not ok:
                print(f"[yellow]SKIP[/yellow] {opp.market} -> {reason}")
                continue

            if cfg.execution.dry_run and mode == "live":
                print(f"[yellow]DRY-RUN LIVE[/yellow] {opp}")
                last_signal_at[signal_key] = now
            else:
                result = executor.execute(opp)
                risk.on_fill(opp.notional_usd)
                last_signal_at[signal_key] = now
                if result and isinstance(result, dict):
                    notifier.send(f"[BOT] {result.get('message','Operación ejecutada')}")

        time.sleep(cfg.runtime.poll_interval_seconds)


if __name__ == "__main__":
    main()
