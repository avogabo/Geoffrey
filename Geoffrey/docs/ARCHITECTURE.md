# Geoffrey Architecture

## Overview

Geoffrey is conceived as a specialized PicoClaw distribution for Plex collections.

## Layers

### 1. Runtime base

PicoClaw provides:

- lightweight runtime
- Telegram channel integration
- LLM provider integration
- simple persistence/memory primitives
- scheduling/automation hooks when needed

### 2. Geoffrey domain layer

A thin vertical layer focused only on Plex collections:

- list Plex libraries
- search movies/series
- create collection
- update collection
- delete collection
- add/remove items
- set collection ordering
- create temporary collections with expiration
- store reusable collection recipes

### 3. Data model

Minimal persisted state:

- collection recipes/templates
- temporary collection expiration timestamps
- optional action log
- optional per-user defaults

## Why not Kometa-first

Kometa is strong for declarative metadata automation, but Geoffrey is intended to be:

- conversational
- user-friendly
- low-friction
- not YAML-driven

Kometa-style config generation may be useful later, but should not be the core UX.

## Why PicoClaw-first

PicoClaw matches the desired deployment model:

- low RAM
- tiny footprint
- simple install
- Telegram-friendly
- purpose-built feel

## First implementation boundaries

Geoffrey should not initially try to do everything.

Initial scope:

- collections only
- one Plex server
- one Telegram bot
- one default movie library
- optional secondary TV library later
