# Geoffrey

Geoffrey is pivoting into a lightweight visual Plex collections app, with Telegram reduced to an optional side channel instead of the core product.

## Goal

Ultra-simple install:

1. Deploy one Docker container
2. Set a few env vars
3. Open Geoffrey in the browser

User-facing setup should require only:

- Plex base URL
- Plex token
- optional default library

## Intended UX

First UI flow:

- choose a Plex library
- search titles and pick exact matches
- create a collection, optionally temporary
- attach a poster by URL or upload
- review existing collections and delete with confirmation

## Product stance

- Specialized, not general-purpose
- UI-first, not chat-first
- Low-resource and easy to deploy
- Focused on Plex curation workflows
- Poster-aware and recipe-aware

## Repo contents

- `docker-compose.yml` example deployment
- `web/` React UI for Geoffrey
- `.env.example` minimal configuration
- `picoclaw.env.example` PicoClaw-oriented minimal env contract
- `picoclaw.geoffrey.json5.example` PicoClaw runtime config example
- `Dockerfile.picoclaw` first Geoffrey-on-PicoClaw container scaffold
- `docker-compose.picoclaw.yml` first Geoffrey-on-PicoClaw compose scaffold
- `geoffrey.prompt.md` Geoffrey system prompt draft
- `docs/ARCHITECTURE.md` system shape
- `docs/MVP.md` first milestone
- `docs/INSTALL.md` ultra-simple install flow
- `docs/MEMORY-AND-CONTEXT.md` domain memory strategy
- `docs/PICOCLAW-STRATEGY.md` packaging direction
- `docs/INSTALL-PICOCLAW.md` correct install path on top of PicoClaw
- `docs/PICOCLAW-CONTAINER.md` container packaging scaffold notes
- `docs/V1-STATUS.md` current readiness summary

## Current status

Pivot in progress from chat-first prototype to browser UI.

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
- first PicoClaw-container packaging scaffold
