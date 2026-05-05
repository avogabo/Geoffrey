# Geoffrey Install

## Goal

Installation should feel extremely simple.

## User flow

1. Create a folder named `geoffrey`
2. Copy `.env.example` to `.env`
3. Fill in:
   - Telegram bot token
   - LLM API key
   - Plex base URL
   - Plex token
4. Run:

```bash
docker compose up -d
```

## Minimal config fields

- `TELEGRAM_BOT_TOKEN`
- `LLM_API_KEY`
- `PLEX_BASE_URL`
- `PLEX_TOKEN`

## First local validation

Before Telegram is wired in fully, the first installable MVP can already be smoke-tested via CLI.

Examples:

```bash
docker compose run --rm geoffrey /app/geoffrey -mode libraries

docker compose run --rm geoffrey /app/geoffrey -mode search -section "Películas" -query "King Kong"

docker compose run --rm geoffrey /app/geoffrey -mode collections -section "Películas"

docker compose run --rm geoffrey /app/geoffrey -mode recipes
```

Create a collection manually from known titles:

```bash
docker compose run --rm geoffrey /app/geoffrey \
  -mode create-collection \
  -section "Películas" \
  -name "Gorilas" \
  -titles "King Kong, Gorilas en la niebla"
```

## Nice-to-have defaults

- prefilled `TZ`
- sensible default model
- sensible log level

## Product expectation

A non-technical user should not need to:

- write YAML automations
- edit multiple files
- understand Plex internals
- configure schedulers manually

## Future install goal

Long-term ideal:

- one Docker image
- one setup wizard or one env file
- one Telegram bot conversation to finish onboarding
