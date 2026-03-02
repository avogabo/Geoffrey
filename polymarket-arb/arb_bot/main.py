import argparse
import json
import time
import requests
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


def discover_market_pairs(limit: int = 30) -> list[dict]:
    out = []
    try:
        r = requests.get("https://gamma-api.polymarket.com/events?active=true&closed=false&limit=200", timeout=20)
        events = r.json()
        for e in events:
            for m in e.get("markets", []):
                if not (m.get("active") and not m.get("closed") and m.get("acceptingOrders", True)):
                    continue
                toks = m.get("clobTokenIds")
                if isinstance(toks, str):
                    try:
                        toks = json.loads(toks)
                    except Exception:
                        toks = []
                if not toks or len(toks) < 2:
                    continue
                out.append({
                    "name": m.get("slug") or m.get("question") or f"market-{m.get('id')}",
                    "yes_asset_id": toks[0],
                    "no_asset_id": toks[1],
                })
                if len(out) >= limit:
                    return out
    except Exception:
        return out
    return out


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
    pairs = [
        {
            "name": p.name,
            "yes_asset_id": p.yes_asset_id,
            "no_asset_id": p.no_asset_id,
        }
        for p in cfg.market_data.market_pairs
    ]
    if cfg.market_data.auto_discover_enabled:
        discovered = discover_market_pairs(cfg.market_data.auto_discover_limit)
        existing = {p["name"] for p in pairs}
        for d in discovered:
            if d["name"] not in existing:
                pairs.append(d)

    asset_ids = set(cfg.market_data.asset_ids)
    for p in pairs:
        asset_ids.add(p["yes_asset_id"])
        asset_ids.add(p["no_asset_id"])

    if asset_ids:
        collector = PolymarketMarketWSCollector(cfg.market_data.ws_url, list(asset_ids), pairs)
        collector.start()
        print(f"[green]WS collector activo[/green] assets={len(asset_ids)} pairs={len(pairs)}")

    notifier = TelegramNotifier(
        enabled=cfg.alerts.telegram_enabled,
        bot_token=cfg.alerts.telegram_bot_token,
        chat_id=cfg.alerts.telegram_chat_id,
        min_interval_sec=cfg.alerts.min_seconds_between_alerts,
    )

    print(f"[cyan]Bot iniciado[/cyan] mode={mode} poll={cfg.runtime.poll_interval_seconds}s")
    last_signal_at: dict[str, float] = {}
    last_heartbeat = 0.0
    last_discovery = time.time()

    while True:
        now_loop = time.time()
        if cfg.alerts.telegram_enabled and cfg.alerts.heartbeat_seconds > 0 and (now_loop - last_heartbeat) >= cfg.alerts.heartbeat_seconds:
            notifier.send(f"💓 polymarket-arb vivo | mode={mode} | pairs={len(pairs)}")
            last_heartbeat = now_loop
        if cfg.market_data.auto_discover_enabled and collector and cfg.market_data.auto_discover_refresh_sec > 0 and (now_loop - last_discovery) >= cfg.market_data.auto_discover_refresh_sec:
            newly = discover_market_pairs(cfg.market_data.auto_discover_limit)
            collector.add_pairs(newly)
            pairs = collector.market_pairs
            last_discovery = now_loop

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
                if cfg.alerts.notify_skips:
                    notifier.send(f"⏭️ SKIP {opp.market} ({opp.action}) -> {reason}")
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
