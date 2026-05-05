# Geoffrey

Geoffrey is a PicoClaw-based Telegram-first AI butler focused on Plex collections.

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
- `docs/ARCHITECTURE.md` system shape
- `docs/MVP.md` first milestone
- `docs/INSTALL.md` ultra-simple install flow
- `docs/MEMORY-AND-CONTEXT.md` domain memory strategy

## Current status

Bootstrap plus first real code stage.

Implemented so far:

- env-based config loading
- domain memory store
- Plex library listing
- Plex search primitives
- Plex collection list/create/delete primitives
- first domain methods to create/delete collections by title list
