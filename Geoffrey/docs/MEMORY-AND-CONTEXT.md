# Geoffrey Memory and Context Strategy

## Principle

Geoffrey should not behave like a general assistant with broad, noisy memory.

It should behave like a highly specialized Plex collections butler with strong domain context.

## What Geoffrey should remember

### 1. Plex domain preferences

- preferred movie library
- preferred TV library
- naming preferences for collections
- whether temporary collections should auto-delete or auto-hide
- preferred ordering style when ambiguous
- preferred language/locale for collection titles

### 2. Reusable collection recipes

Examples:

- `marvel_visionado`
- `navidad_tv`
- `halloween_risa`
- `gorilas`
- `cine_familiar_domingo`

A recipe can store:

- title
- description
- inclusion rules
- exclusion rules
- ordering rules
- optional expiration defaults

### 3. Operational memory

- collections Geoffrey created
- when they were created
- why they were created
- whether they are temporary or persistent
- expiration dates
- last rebuild date

### 4. Clarification memory

If the user once clarified something like:

- “Marvel por orden de visionado significa MCU cronológico, no estreno”
- “Navidad TV debe excluir cine romántico pasteloso”
- “Halloween de risa tiene que ser más Scary Movie que terror serio”

Geoffrey should remember it and reuse it.

## What Geoffrey should NOT remember too much

- broad personal life context unrelated to Plex
- random chat trivia with no collection-management value
- large verbose histories that slow down interaction

## Memory shape

Geoffrey should probably use a small structured store, not freeform long memory first.

Suggested persisted objects:

### `user_preferences`
- default_movie_library
- default_show_library
- locale
- ordering_defaults
- tone_of_collection_titles

### `collection_recipes`
- id
- name
- prompt_aliases
- inclusion_rules
- exclusion_rules
- ordering_rules
- temporary_default

### `collection_history`
- collection_name
- plex_library
- created_at
- source_prompt
- recipe_id
- temporary
- expires_at
- last_updated_at

### `clarifications`
- topic
- interpretation
- examples
- updated_at

## Retrieval strategy

Before acting, Geoffrey should pull only the domain memory relevant to:

- this Plex library
- this collection family
- this named recipe
- this ambiguity

Not everything.

## Why this matters

This is what will make Geoffrey feel smart rather than just “LLM + API”.

The useful intelligence is not only in generating actions, but in remembering:

- how the user likes collections organized
- what a named concept means for this user
- which collection patterns should be reused

## Product consequence

A specialized memory layer is probably more important for Geoffrey than a giant general assistant framework.

That is another reason why a focused PicoClaw-based build makes sense.
