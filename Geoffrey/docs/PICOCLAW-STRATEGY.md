# Geoffrey on PicoClaw Strategy

## Decision

Geoffrey should be built as a vertical Plex-collections product on top of PicoClaw, not as a large standalone assistant runtime that duplicates what PicoClaw already does well.

## Why this pivot is correct

PicoClaw already gives a strong base for:

- lightweight runtime
- Telegram integration
- LLM provider plumbing
- low resource usage
- easy Docker deployment

Trying to rebuild all of that from scratch inside Geoffrey would be wasteful and would blur the product.

## Geoffrey's real value

Geoffrey should focus on the parts PicoClaw does not give for free:

- Plex collection domain logic
- collection-safe actions and guardrails
- reusable recipe memory
- temporary collection lifecycle
- natural-language prompts specific to collection building
- simple packaging and onboarding for this exact use case

## Mental model

### PicoClaw provides the engine

- chat transport
- LLM session loop
- lightweight execution base

### Geoffrey provides the specialization

- system prompt / persona
- Plex tools
- recipe store
- domain memory
- opinionated install flow

## Packaging target

The Geoffrey container should ideally feel like:

- one specialized PicoClaw image
- one env file
- one Telegram bot
- one Plex server target
- zero YAML automation burden on the user

## First practical deliverable

A first user-facing Geoffrey release should contain:

- Docker image
- `.env.example`
- PicoClaw-oriented runtime/config wrapper
- Geoffrey system prompt focused on Plex collections
- Geoffrey memory schema for recipes and collection history
- Geoffrey Plex actions:
  - list libraries
  - search items
  - list collections
  - create collection
  - delete collection
- basic Telegram interaction

## What can remain outside v1

- advanced recommendation intelligence
- external provider enrichment
- artwork/poster workflows
- multi-user policy layers
- full natural conversation planner for every edge case

## Product framing

Geoffrey is not “a generic AI assistant that happens to call Plex”.

Geoffrey is a dedicated butler for curating and managing Plex collections.

That difference should be visible in:

- installation simplicity
- memory model
- commands
- prompts
- defaults
- documentation
