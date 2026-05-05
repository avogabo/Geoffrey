# Install Geoffrey on top of OpenClaw

## The correct architecture

Geoffrey should not ship as a separate general assistant runtime.

The correct product shape is:

- OpenClaw or PicoClaw as the runtime base
- Geoffrey as the specialized Plex-collections layer

That means:

- Telegram transport comes from OpenClaw
- natural language comes from OpenClaw
- session/memory mechanics come from OpenClaw
- Geoffrey adds prompt, domain memory, and Plex-specific tools/workflows

## First practical installation path

### 1. Prepare an OpenClaw config

Start from:

- `openclaw.geoffrey.json5.example`

Copy it to your real OpenClaw config location and adapt:

- Telegram bot token
- Plex token
- model/provider auth
- workspace path if needed

### 2. Put Geoffrey assets in the workspace

Minimum useful assets:

- `geoffrey.prompt.md`
- `docs/MEMORY-AND-CONTEXT.md`
- recipe/data files as they stabilize

### 3. Start OpenClaw

Typical path:

```bash
openclaw gateway
```

Or complete a proper setup with:

```bash
openclaw onboard
```

Relevant docs:

- `docs/channels/telegram.md`
- `docs/gateway/configuration-examples.md`
- `docs/reference/wizard.md`

## What Geoffrey still needs to become a clean OpenClaw distribution

To be fully honest, the remaining product work is now mostly packaging/integration work:

- Geoffrey-specific prompt wiring
- Geoffrey-specific Plex tool exposure inside OpenClaw
- stable Geoffrey workspace seed files
- a one-command or one-compose install path

## What already exists today

The current repository already contains:

- Geoffrey prompt draft
- Geoffrey product definition
- Geoffrey env contract ideas
- Geoffrey Plex domain prototype in Go
- Geoffrey Telegram behavior prototype

That is enough to define the product shape and guide the final OpenClaw packaging pass.
