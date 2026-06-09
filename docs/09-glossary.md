# 09 — Glosario

Términos usados en la documentación y en la aplicación, en español con referencia técnica cuando aplica.

---

## Torneo

| Término | Definición |
|---------|------------|
| **Mundial 2026** | Copa Mundial de la FIFA 2026; 48 selecciones; sedes en EE.UU., Canadá y México. |
| **Fase de grupos** | Primera ronda: 12 grupos (A–L) de 4 equipos. Código: `group`. |
| **Dieciseisavos** | Primera ronda eliminatoria con 32 equipos. Código: `round_of_32`. |
| **Octavos** | 16 equipos → 8. Código: `round_of_16`. |
| **Cuartos** | 8 equipos → 4. Código: `quarter`. |
| **Semifinales** | 4 equipos → 2. Código: `semi`. |
| **Tercer puesto** | Partido entre perdedores de semifinales. Código: `third_place`. |
| **Final** | Partido por el título. Código: `final`. |
| **Jornada** | Rodada de partidos en fase de grupos (`matchday` 1–3). |
| **Mejores terceros** | 8 selecciones con mejor récord entre los que quedaron terceros en su grupo. |

---

## Datos y entidades

| Término | Definición |
|---------|------------|
| **teamId** | Identificador slug de selección (`argentina`, `spain`). |
| **playerId** | Identificador slug de jugador (`lionel-messi`). |
| **matchId** | Identificador único de partido (`match-group-j-001`). |
| **venueId** | Identificador de estadio (`estadio-azteca`). |
| **Seed** | Datos iniciales en JSON antes de completar el torneo. |
| **Rating** | Valor numérico 1–99 que representa nivel del jugador en la app. |
| **Plantilla** | Lista de jugadores convocados de una selección. |
| **FK** | Foreign key — referencia entre archivos JSON (`teamId` en player). |

---

## Posiciones

| Código | Español UI | Rol |
|--------|------------|-----|
| `GK` | Portero | Guardameta |
| `DF` | Defensa | Defensor |
| `MF` | Medio | Centrocampista |
| `FW` | Delantero | Atacante |

---

## Estados de partido

| Código | Español UI |
|--------|------------|
| `scheduled` | Programado |
| `live` | En juego |
| `finished` | Finalizado |
| `postponed` | Aplazado |

---

## Producto y UX

| Término | Definición |
|---------|------------|
| **Hub** | Pantalla central que agrupa accesos (juegos, inicio). |
| **Favorito** | Selección marcada por el usuario para filtros y dashboard. |
| **Modo sin spoilers** | Preferencia que oculta marcadores de partidos. |
| **PWA** | Progressive Web App — instalable, funciona offline parcialmente. |
| **Desafío diario** | Reto del 11 fijo por fecha calendario. |
| **Pool** | Conjunto de jugadores disponibles para seleccionar en un juego. |

---

## Juegos

| Término | Definición |
|---------|------------|
| **Reto del 11** | Minijuego de construir un once respetando reglas. |
| **Tanda 90** | Minijuego de penaltis arcade (no 90 minutos reales). |
| **Trivia Express** | Quiz de 10 preguntas con tiempo limitado. |
| **Challenge** | Plantilla de reto con reglas en `challenges.json`. |
| **Budget** | Límite de suma de ratings en un reto. |
| **Muerte súbita** | Rondas extra de penaltis hasta desempate en Tanda 90. |
| **Récord personal** | Mejor puntuación guardada en localStorage. |

---

## Técnico

| Término | Definición |
|---------|------------|
| **SSG** | Static Site Generation — páginas pregeneradas en build. |
| **CSR** | Client Side Rendering — renderizado en navegador. |
| **Zod** | Librería de validación de esquemas TypeScript. |
| **localStorage** | Almacenamiento persistente del navegador para preferencias. |
| **ISR** | Incremental Static Regeneration — no usado en v1. |
| **DoD** | Definition of Done — criterios para considerar tarea terminada. |

---

## Confederaciones

| Código | Nombre |
|--------|--------|
| `UEFA` | Europa |
| `CONMEBOL` | Sudamérica |
| `CONCACAF` | Norteamérica, Centroamérica y Caribe |
| `CAF` | África |
| `AFC` | Asia |
| `OFC` | Oceanía |

---

## Abreviaturas UI

| Abrev. | Significado |
|--------|-------------|
| ARG | Argentina (ejemplo shortName) |
| vs | Contra (partido) |
| FIFA | Federación Internacional de Fútbol Asociación |

---

## Referencias

- Formato detallado → [04-tournament-context.md](./04-tournament-context.md)
- Campos JSON → [03-data-model.md](./03-data-model.md)
