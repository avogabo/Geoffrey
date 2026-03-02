import time
import requests


class TelegramNotifier:
    def __init__(self, enabled: bool, bot_token: str, chat_id: str, min_interval_sec: int = 60):
        self.enabled = enabled and bool(bot_token) and bool(chat_id)
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.min_interval_sec = max(1, int(min_interval_sec))
        self._last_sent_at = 0.0

    def send(self, text: str):
        if not self.enabled:
            return
        now = time.time()
        if now - self._last_sent_at < self.min_interval_sec:
            return
        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        try:
            requests.post(url, json={"chat_id": self.chat_id, "text": text}, timeout=8)
            self._last_sent_at = now
        except Exception:
            pass
