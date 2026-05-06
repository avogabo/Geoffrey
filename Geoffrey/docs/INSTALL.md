# Geoffrey Install

## Goal

Levantar Geoffrey como app visual de colecciones Plex en un solo `docker compose up`.

## User flow

1. Copia `.env.example` a `.env`
2. Rellena:
   - `PLEX_BASE_URL`
   - `PLEX_TOKEN`
   - opcionalmente `PLEX_DEFAULT_LIBRARY`
3. Arranca:

```bash
docker compose up -d --build
```

4. Abre Geoffrey en:

```text
http://localhost:18080
```

## Minimal config fields

- `PLEX_BASE_URL`
- `PLEX_TOKEN`

## What you get

- selector de bibliotecas Plex
- búsqueda de títulos
- creación de colecciones
- colecciones temporales con fecha
- póster por URL o subida
- borrado con confirmación
- previews visuales con imágenes reales de Plex

## Smoke test

Comprueba primero que la API responde:

```bash
curl http://localhost:18080/api/health
curl http://localhost:18080/api/libraries
```

## Product expectation

Un usuario no técnico no debería necesitar:

- Telegram
- claves de LLM
- YAMLs de automatización
- entender internals de Plex
