import json
import threading
import time
from dataclasses import dataclass, field

from websocket import WebSocketApp


@dataclass
class AssetState:
    best_bid: float = 0.0
    best_ask: float = 1.0
    ts: float = field(default_factory=time.time)


class PolymarketMarketWSCollector:
    def __init__(self, ws_url: str, asset_ids: list[str], market_pairs: list[dict] | None = None):
        self.ws_url = ws_url
        self.asset_ids = list(dict.fromkeys(asset_ids))
        self.market_pairs = market_pairs or []
        self.state: dict[str, AssetState] = {a: AssetState() for a in self.asset_ids}
        self._thread = None
        self._ws = None

    def add_pairs(self, new_pairs: list[dict]):
        if not new_pairs:
            return
        known = {p.get("name") for p in self.market_pairs}
        added_assets = []
        for p in new_pairs:
            if p.get("name") in known:
                continue
            self.market_pairs.append(p)
            known.add(p.get("name"))
            for aid in (p.get("yes_asset_id"), p.get("no_asset_id")):
                if aid and aid not in self.state:
                    self.state[aid] = AssetState()
                    self.asset_ids.append(aid)
                    added_assets.append(aid)
        if added_assets and self._ws:
            try:
                self._ws.send(json.dumps({
                    "assets_ids": added_assets,
                    "type": "market",
                    "custom_feature_enabled": True,
                }))
            except Exception:
                pass

    def start(self):
        if self._thread and self._thread.is_alive():
            return

        def _run():
            def on_open(ws):
                ws.send(json.dumps({
                    "assets_ids": self.asset_ids,
                    "type": "market",
                    "custom_feature_enabled": True,
                }))

            def on_message(ws, message):
                try:
                    data = json.loads(message)
                except Exception:
                    return
                evt = data.get("event_type")

                if evt == "best_bid_ask":
                    aid = data.get("asset_id")
                    if aid in self.state:
                        self.state[aid] = AssetState(
                            best_bid=float(data.get("best_bid", 0) or 0),
                            best_ask=float(data.get("best_ask", 1) or 1),
                            ts=time.time(),
                        )

                elif evt == "book":
                    aid = data.get("asset_id")
                    if aid in self.state:
                        bids = data.get("bids") or []
                        asks = data.get("asks") or []
                        best_bid = max([float(b.get("price", 0) or 0) for b in bids], default=0.0)
                        best_ask = min([float(a.get("price", 1) or 1) for a in asks], default=1.0)
                        self.state[aid] = AssetState(best_bid=best_bid, best_ask=best_ask, ts=time.time())

            self._ws = WebSocketApp(self.ws_url, on_open=on_open, on_message=on_message)
            self._ws.run_forever(ping_interval=20, ping_timeout=10)

        self._thread = threading.Thread(target=_run, daemon=True)
        self._thread.start()

    def snapshots(self) -> list[dict]:
        out = []
        if self.market_pairs:
            for p in self.market_pairs:
                yes = self.state.get(p["yes_asset_id"], AssetState())
                no = self.state.get(p["no_asset_id"], AssetState())
                out.append(
                    {
                        "market": p.get("name", "unknown"),
                        "yes_asset_id": p["yes_asset_id"],
                        "no_asset_id": p["no_asset_id"],
                        "yes_best_bid": yes.best_bid,
                        "yes_best_ask": yes.best_ask,
                        "no_best_bid": no.best_bid,
                        "no_best_ask": no.best_ask,
                        "ask_sum": yes.best_ask + no.best_ask,
                        "bid_sum": yes.best_bid + no.best_bid,
                        "liquidity_usd": 1000,
                        "notional_usd": 10,
                    }
                )
            return out

        # Fallback when no pairs are configured
        for aid, s in self.state.items():
            spread = max(0.0, s.best_ask - s.best_bid)
            est_net_edge_bps = max(0.0, (0.02 - spread) * 10000)
            out.append(
                {
                    "market": aid,
                    "side_a": "BUY",
                    "side_b": "SELL",
                    "implied_edge_bps": est_net_edge_bps,
                    "est_net_edge_bps": est_net_edge_bps,
                    "liquidity_usd": 1000,
                    "notional_usd": 10,
                }
            )
        return out
