# Geoffrey PicoClaw Container

## Goal

Build Geoffrey as a container that carries PicoClaw inside and layers Geoffrey assets on top.

## Current scaffold

Files added:

- `Dockerfile.picoclaw`
- `docker-compose.picoclaw.yml`
- `picoclaw.geoffrey.json5.example`
- `geoffrey.prompt.md`

## What this scaffold does

- clones the OpenClaw repository as the current available base for PicoClaw-related packaging work
- builds the runtime with Node + pnpm
- places Geoffrey prompt/docs/config seed into the mounted OpenClaw workspace/config area
- starts the gateway runtime

## Important honesty note

This is a packaging scaffold, not yet the final polished Geoffrey image.

Why:

- it still clones the upstream repo during build
- it does not yet pin the exact PicoClaw distribution artifact Gaby wants
- Geoffrey-specific Plex tools are not yet wired as first-class runtime tools inside PicoClaw
- first-run config/bootstrap still needs simplification

## Next hardening steps

1. replace git-clone build with pinned PicoClaw source or image
2. add Geoffrey-specific workspace seed files automatically
3. wire Geoffrey prompt/config as the default runtime personality
4. expose the Geoffrey Plex actions through the runtime in a clean way
5. reduce install to one command plus env file
