# TOOLS.md - Local Notes

## Entornos (Gaby)

### 1) Local (Ubuntu VM)
- VM Ubuntu: `ubuntu_pulgarcito`
- Este es el host donde corre OpenClaw.

### 2) Unraid (servidor principal)
- **Servidor principal**: Unraid
- Acceso: **SSH por clave privada** (sin password)
- Host: `192.168.1.100`
- Usuario: `root`
- Clave privada en esta VM: `~/.ssh/unraid_ed25519`
- Regla: **no borrar ni modificar nada en Unraid sin consentimiento explícito de Gaby**.

### 3) Home Assistant OS (HAOS)
- Acceso vía API con token (**NO guardar el token en archivos**)
- URL: `http://192.168.1.53:8123`

## Reglas de operación
- En Unraid: nada de cambios destructivos ni modificaciones sin “OK explícito”.
- Si una acción implica riesgo (borrar, mover, actualizar, tocar configs), pedir confirmación primero.
- Mantener acceso estable a los 3 entornos como prioridad.

## Flujo acordado (EDRmount releases)
- En cada cambio: commit de código → bump de `VERSION` (`1.xx`) → tag `v1.xx` → push `main` + push tag.
- Esperar publicación de imagen en GHCR vía GitHub Actions.
- Despliegue en Unraid con la misma plantilla:
  1) parar/borrar contenedor `edrmount` actual,
  2) borrar imagen local vieja/huérfana,
  3) recrear con la nueva `ghcr.io/avogabo/edrmount:latest`.
- No tocar volúmenes persistentes (`/config`, `/cache`, `/backups`, `/host`) para conservar estado.
- Este flujo es crítico y no debe perderse en compactaciones/resets.

## LocalSoundiiz (inicio)
- Mantener continuidad del arranque local y estado del proyecto.
- Ruta de trabajo: `/home/pulgarcito/.openclaw/workspace/soundiiz-local`.
- Si se reinicia contexto, recuperar primero README + estado Docker antes de tocar despliegues.
