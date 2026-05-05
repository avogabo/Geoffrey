# Geoffrey

Geoffrey is a Telegram-first AI butler focused on Plex collections, intended to ship as a specialized PicoClaw-based product.

## Goal

Ultra-simple install:

1. Deploy one Docker container
2. Set a few env vars
3. Start chatting on Telegram

User-facing setup should require only:

- Telegram bot token
- LLM API key
- Plex base URL
- Plex token

## Intended UX

Examples:

- "Créame una colección Marvel por orden de visionado"
- "Hazme una colección de películas de gorilas"
- "Crea una colección temporal Halloween de risa"
- "Hazme una colección Navidad TV"
- "Añade Gremlins a Navidad TV"
- "Borra la colección Halloween de risa el 2 de noviembre"

## Product stance

- Specialized, not general-purpose
- Conversation-first, not YAML-first
- Low-resource and easy to deploy
- Telegram-first
- Built on PicoClaw, trimmed to the Plex collections use case

## Repo contents

- `docker-compose.yml` example deployment
- `.env.example` minimal configuration
- `picoclaw.env.example` PicoClaw-oriented minimal env contract
- `picoclaw.geoffrey.json5.example` PicoClaw runtime config example
- `geoffrey.prompt.md` Geoffrey system prompt draft
- `docs/ARCHITECTURE.md` system shape
- `docs/MVP.md` first milestone
- `docs/INSTALL.md` ultra-simple install flow
- `docs/MEMORY-AND-CONTEXT.md` domain memory strategy
- `docs/PICOCLAW-STRATEGY.md` packaging direction
- `docs/INSTALL-PICOCLAW.md` correct install path on top of PicoClaw
- `docs/V1-STATUS.md` current readiness summary

## Current status

Bootstrap plus first real code stage.

The exploratory local MVP runtime has already been smoke-tested successfully against a real Plex server for:

- startup
- env loading
- Plex library detection
- recipe bootstrap

Implemented so far:

- env-based config loading
- domain memory store
- Plex library listing
- Plex search primitives
- Plex collection list/create/delete primitives
- first domain methods to create/delete collections by title list
- CLI modes for local smoke testing and first installable MVP
- default recipe bootstrap for focused collection patterns
- library resolution by key or title
- minimal Telegram bridge with first real collection actions
- simple delete confirmation flow
- temporary collection creation path
- basic natural-intent bridge
- expiration cleanup loop for temporary collections
- PicoClaw-oriented packaging strategy and prompt draft
- PicoClaw runtime config example and install path
