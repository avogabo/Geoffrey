# Geoffrey MVP

## MVP objective

Desplegar Geoffrey, abrir una UI web y gestionar colecciones Plex sin depender de bot conversacional ni LLM.

## Required capabilities

### 1. Connectivity

- connect to one Plex server
- expose a local web UI
- run in a single Docker service

### 2. Plex collection operations

- list libraries
- search items by title
- create collection from explicit titles
- delete collection
- apply poster by URL or file upload

### 3. Guided UX

- show clear collection summary before creation
- mark temporary collections and expiration date
- preview search results visually
- confirm destructive actions

### 4. Temporary collections

- create temporary collections
- attach expiration date
- auto-delete on expiration

## Installable MVP scope

Current MVP target:

- Docker deployment
- env-based config
- Plex connectivity
- web UI for libraries, recipes, search and collections
- structured local memory file
- poster previews fetched from Plex
- poster override by URL or upload
- temporary collection cleanup loop

## Non-goals for MVP

- full Kometa parity
- conversational LLM flows
- multi-user RBAC
- external poster scraping/generation in v1
- advanced metadata editing
