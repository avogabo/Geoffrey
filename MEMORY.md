

## Referencia estable AlfredEDR (actual)
- Baseline operativo: `v1.6.24` (commit `3c78f30`) desplegado en Unraid como `alfrededr:v1.6.24-nativewebdav`.
- Estrategia PAR de referencia: `parpar` + `upload.par.keep_mode = "nzb"`.
- Objetivo de salida PAR: conservar `*.par.nzb` en el árbol de `/inbox/par2/...` y no depender de mantener `.par2` locales.
- Hallazgo clave de reparación: `nzb-repair` no toma PAR externos por carpeta si van separados; necesita NZB que incluya referencias PAR (p.ej. fusionado media+par) para reparar.
