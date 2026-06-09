# 08 — Roadmap de desarrollo

Plan de implementación por fases. Cada fase tiene **entregables** y **criterios de aceptación** verificables.

---

## Resumen de fases

| Fase | Nombre | Entregable principal | Dependencias |
|------|--------|----------------------|--------------|
| **0** | Fundamentos | Proyecto + JSON seed + validación | Documentación ✅ |
| **1** | Módulo Datos | Equipos, calendario, búsqueda, config | Fase 0 |
| **2** | Reto del 11 | Juego principal jugable | Fase 1 |
| **3** | Tanda 90 | Minijuego penaltis | Fase 0 (teams) |
| **4** | Trivia + pulido | Quiz + PWA + desafío diario | Fases 1–3 |
| **5** | Datos completos | 48 plantillas + calendario full | Paralelo |

Las fases 3 y 5 pueden ejecutarse en paralelo con 2 y 4 respectivamente.

---

## Fase 0 — Fundamentos

**Objetivo:** Repositorio listo para desarrollar con datos válidos mínimos.

### Tareas

- [ ] Inicializar Next.js + TypeScript + Tailwind
- [ ] Crear estructura de carpetas según [02-architecture.md](./02-architecture.md)
- [ ] Implementar esquemas Zod ([03-data-model.md](./03-data-model.md))
- [ ] Crear `scripts/validate-data.ts` + npm script
- [ ] Seed JSON:
  - [ ] `tournament.json`
  - [ ] `teams.json` (48 equipos)
  - [ ] `venues.json` (10+ estadios)
  - [ ] `players.json` (mín. 8 equipos × 15 jugadores)
  - [ ] `matches.json` (mín. 1 jornada de grupos)
  - [ ] `challenges.json` (3 retos)
- [ ] Layout base + navegación vacía
- [ ] README con comandos de desarrollo

### Criterios de aceptación

- [ ] `npm run build` sin errores
- [ ] `npm run validate-data` pasa
- [ ] Navegación entre rutas placeholder funciona
- [ ] Tipos TypeScript inferidos de Zod

### Estimación

1 sesión de desarrollo.

---

## Fase 1 — Módulo Datos

**Objetivo:** Consulta útil del torneo sin juegos.

### Tareas

#### 1.1 Equipos
- [ ] Página lista con grid y filtros
- [ ] Página detalle con plantilla
- [ ] Componentes `TeamCard`, `PlayerRow`
- [ ] Banderas en `/public/flags/`

#### 1.2 Calendario
- [ ] Lista cronológica de partidos
- [ ] Filtros: fecha, equipo, fase
- [ ] Conversión timezone (`lib/utils/datetime.ts`)
- [ ] Componente `MatchRow`

#### 1.3 Búsqueda
- [ ] Página `/buscar` con índice en memoria
- [ ] Resultados agrupados

#### 1.4 Configuración + Inicio
- [ ] `lib/storage/settings.ts`
- [ ] Página configuración
- [ ] Dashboard con "Hoy" y favorito
- [ ] Modo spoiler en calendario e inicio

### Criterios de aceptación

- [ ] 48 equipos navegables
- [ ] Calendario muestra partidos seed con hora local correcta
- [ ] Búsqueda encuentra jugador y equipo por nombre
- [ ] Favorito persiste tras recargar
- [ ] Spoiler oculta marcadores
- [ ] Responsive móvil sin scroll horizontal

### Estimación

1–2 sesiones.

---

## Fase 2 — Reto del 11

**Objetivo:** Juego principal completo en MVP.

### Tareas

- [ ] `lib/games/reto11/validate.ts`
- [ ] `lib/games/reto11/score.ts`
- [ ] `lib/games/reto11/daily.ts` (seed por fecha)
- [ ] UI: selector de reto, campo, buscador jugadores
- [ ] Confirmación + pantalla resultados
- [ ] Persistencia `mundial2026_reto11`
- [ ] Hub `/juegos` con tarjeta Reto del 11

### Criterios de aceptación

- [ ] Completar partida feliz de principio a fin
- [ ] Al menos 3 retos jugables desde `challenges.json`
- [ ] Validación impide once inválido
- [ ] Score idempotente (tests unitarios)
- [ ] Récord personal guardado
- [ ] usable en móvil (touch)

### Estimación

1–2 sesiones.

---

## Fase 3 — Tanda 90

**Objetivo:** Minijuego arcade de penaltis.

### Tareas

- [ ] `lib/games/tanda90/engine.ts`
- [ ] UI portería + controles
- [ ] Selección de equipo (colores)
- [ ] Flujo 5 penaltis + muerte súbita
- [ ] Stats en localStorage

### Criterios de aceptación

- [ ] Partida completa sin errores
- [ ] Controles touch en móvil
- [ ] Victoria/derrota claras
- [ ] Stats persistidas

### Estimación

1 sesión.

---

## Fase 4 — Trivia + Pulido

**Objetivo:** Cerrar suite de juegos y preparar PWA.

### Tareas

#### Trivia
- [ ] `lib/games/trivia/generate.ts`
- [ ] UI quiz + timer 60s
- [ ] Pantalla resultados

#### Desafío diario
- [ ] Integrar daily en Reto del 11
- [ ] Indicador "Completado hoy" en hub

#### PWA
- [ ] `manifest.json` + iconos
- [ ] Service worker básico
- [ ] Meta theme-color

#### Pulido
- [ ] Loading skeletons
- [ ] Empty states
- [ ] `prefers-reduced-motion`
- [ ] Lighthouse pass ≥ 90 performance (objetivo)

### Criterios de aceptación

- [ ] Trivia genera 10 preguntas válidas
- [ ] Timer funciona y termina partida
- [ ] Instalable como PWA en Android/Chrome
- [ ] Funciona offline para consulta de datos cacheados

### Estimación

1 sesión.

---

## Fase 5 — Datos completos (continuo)

**Objetivo:** Cobertura total del torneo. Corre en paralelo al uso.

### Tareas

- [x] Completar 48 plantillas (15 jugadores mín.; 26 ideal)
- [x] Calendario completo 104 partidos
- [ ] Actualizar resultados tras cada jornada
- [ ] Ampliar `challenges.json` (8+ retos)

### Criterios de aceptación

- [x] Todos los equipos con ≥11 jugadores
- [x] Calendario grupo + eliminatorias
- [x] `validate-data` sin warnings de plantilla

### Estimación

Continuo durante el torneo.

---

## Prioridad si hay retraso

Si el Mundial empieza antes de terminar todo:

| Prioridad | Qué lanzar |
|-----------|------------|
| P0 | Calendario + equipos + favorito |
| P1 | Reto del 11 (modo libre) |
| P2 | Spoiler + búsqueda |
| P3 | Tanda 90 + Trivia |
| P4 | PWA + desafío diario |

---

## Definición de "hecho" (DoD) global

Una tarea está **hecha** cuando:

1. Código mergeado en `main` (o rama acordada).
2. Cumple criterios de aceptación de su fase.
3. Sin errores de TypeScript ni lint.
4. Documentación actualizada si hubo desviación de spec.
5. Probado manualmente en móvil (viewport 375px) y desktop.

---

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Plantillas incompletas | Reto del 11 limitado | Pool global de todos los jugadores seed |
| Datos incorrectos | Mala UX | `validate-data` en CI |
| Scope creep | Retraso | WON'T list en [01-vision.md](./01-vision.md) |
| Tiempo insuficiente | Falta juegos | Prioridad P0/P1 arriba |

---

## Post-v1 (backlog documentado)

| Feature | Notas |
|---------|-------|
| Quiniela / bracket personal | localStorage + share |
| Tabla de clasificación por grupo | Cálculo desde resultados |
| Retos contextuales diarios | Requiere pipeline de resultados |
| Leaderboard amigos | Requiere backend |
| API resultados en vivo | Integración opcional |
| Imagen compartible del once | Canvas/html2canvas |

---

## Checklist pre-Mundial (11 jun 2026)

- [ ] Fase 0–1 completas
- [ ] Fase 2 jugable
- [ ] Calendario primera jornada verificado
- [ ] Favorito y spoiler probados
- [ ] Deploy en Vercel con URL estable
- [ ] PWA instalable (deseable)

---

## Referencias

- Todas las specs de features en docs 05 y 06
- Mantenimiento en vivo → [10-data-maintenance.md](./10-data-maintenance.md)
