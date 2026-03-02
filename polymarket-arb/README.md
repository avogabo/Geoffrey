# polymarket-arb

MVP para arbitraje automatizado (primero en modo **paper trading**).

## Objetivo
Detectar oportunidades de arbitraje neto (tras costes) y ejecutar de forma controlada.

## Fases
1. **Scanner** (solo lectura)
2. **Paper trading** (simulación)
3. **Live trading** (con límites estrictos)

## Estructura
- `arb_bot/config.py` -> carga configuración
- `arb_bot/types.py` -> tipos de datos
- `arb_bot/engine.py` -> lógica de detección de arbitraje
- `arb_bot/risk.py` -> límites y kill switch
- `arb_bot/executor.py` -> ejecución (paper/live)
- `arb_bot/main.py` -> loop principal
- `config/settings.example.yaml` -> configuración base

## Arranque rápido
```bash
cd polymarket-arb
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp config/settings.example.yaml config/settings.yaml
python -m arb_bot.main --config config/settings.yaml --mode paper
```

## Importante
- No activar `live` sin validar logs y PnL simulado.
- Empieza con tamaños mínimos y límites duros.
