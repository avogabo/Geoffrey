FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY arb_bot ./arb_bot

CMD ["python", "-m", "arb_bot.main", "--config", "/config/settings.yaml", "--mode", "paper"]
