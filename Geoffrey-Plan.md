# Geoffrey - Plan inicial

## Objetivo

Geoffrey será el tercer mayordomo.

Referencia: Geoffrey, el mayordomo del Príncipe de Bel-Air.

Su función será gestionar colecciones de Plex de forma conversacional, simple e inteligente, evitando la complejidad declarativa de Kometa/Plex Meta Manager.

## Visión de producto

Instalación ultra simple:

- instalar Docker
- arrancar Geoffrey
- configurar solo:
  - token de Telegram
  - token/API de IA
  - URL de Plex
  - token de Plex
- listo

El usuario hablará con Geoffrey por Telegram con mensajes como:

- "créame una colección Marvel por orden de visionado"
- "hazme una colección de películas de gorilas"
- "crea una colección temporal Halloween de risa"
- "hazme una colección Navidad TV"
- "añade Gremlins a Navidad TV"
- "borra la colección Halloween de risa el 2 de noviembre"

## Base técnica elegida

Geoffrey se plantea como:

- una instalación dedicada de PicoClaw
- reducida a la función de Plex collections
- con experiencia Telegram-first
- con muy bajo consumo de recursos

No se plantea como OpenClaw completo ni como Kometa con IA encima.

## Qué NO queremos

- YAML complejo
- configuración declarativa tediosa
- que el usuario tenga que aprender sintaxis interna
- depender de Kometa para el flujo principal

## Arquitectura propuesta

### 1. Núcleo

Base PicoClaw con:

- canal Telegram
- proveedor LLM configurable
- memoria mínima/local
- scheduler básico para colecciones temporales

### 2. Módulo Geoffrey

Capa de dominio centrada solo en Plex:

- conectar con Plex API
- listar librerías
- buscar items
- crear colección
- borrar colección
- añadir/quitar items
- reordenar items
- expirar colecciones temporales
- guardar plantillas temáticas

### 3. Configuración mínima del usuario

Variables de entorno objetivo:

- `TELEGRAM_BOT_TOKEN`
- `LLM_PROVIDER`
- `LLM_API_KEY`
- `PLEX_BASE_URL`
- `PLEX_TOKEN`
- `PLEX_DEFAULT_LIBRARY`
- `TZ`

Opcionales:

- `PLEX_MOVIE_LIBRARY`
- `PLEX_SHOW_LIBRARY`
- `GEOFFREY_DATA_DIR`

## MVP funcional

### Fase 1

- conectar a Plex
- listar bibliotecas
- buscar películas/series
- crear colección desde una lista de items
- borrar colección
- colecciones temporales con fecha de caducidad
- confirmaciones por Telegram

### Fase 2

- colecciones por tema
- colecciones por saga/franquicia
- colecciones por actor/director
- plantillas reutilizables
- colecciones de temporada (Halloween, Navidad, verano, etc.)

### Fase 3

- orden de visionado inteligente
- integración opcional con TMDb / Trakt / Letterboxd
- reglas regenerables periódicamente
- sugerencias automáticas de mantenimiento

## UX deseada

Lo importante es que Geoffrey se sienta así:

- rápido
- ligero
- muy simple de instalar
- conversacional
- especializado
- útil sin necesidad de "programarlo"

## Decisión actual

Recomendación actual:

- sí a Geoffrey sobre PicoClaw
- no a empezar desde Kometa
- no a montar otro OpenClaw completo
- sí a un producto vertical, ultra simple y centrado en colecciones Plex
