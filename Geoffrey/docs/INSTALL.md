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
