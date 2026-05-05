# Geoffrey MVP

## MVP objective

A user should be able to deploy Geoffrey, talk to it on Telegram, and manage Plex collections without touching YAML.

## Required capabilities

### 1. Connectivity

- connect to Telegram
- connect to one LLM provider
- connect to one Plex server

### 2. Plex collection operations

- list libraries
- search items by title
- create collection from explicit titles
- add items to an existing collection
- remove items from a collection
- delete collection

### 3. Conversational behaviors

- ask follow-up questions when ambiguous
- confirm destructive actions
- summarize what was created

### 4. Temporary collections

- create temporary collections
- attach expiration date/time
- auto-delete on expiration

## Examples Geoffrey should handle in MVP

- "Crea una colección de pelis de gorilas"
- "Hazme una colección Halloween de risa"
- "Añade Scary Movie a Halloween de risa"
- "Borra la colección Halloween de risa mañana"
- "Crea una colección Marvel para ver en orden"

## Installable MVP scope

The first installable MVP can ship with a minimal Telegram bridge, even if advanced conversation comes later.

Current MVP target:

- Docker deployment
- env-based config
- Plex connectivity
- library listing
- search
- collection create/delete via CLI
- structured local memory file
- basic Telegram commands for visibility and smoke testing
- first real Telegram actions for search/create/delete collection
- simple delete confirmation flow
- temporary collection creation path

## Non-goals for MVP

- full Kometa parity
- mass artwork/overlay management
- advanced metadata editing
- multi-user RBAC
- external list syncing beyond a simple prototype
