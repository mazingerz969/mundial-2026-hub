# Documentación — Mundial 2026 Hub

## Propósito de esta documentación

Este conjunto de documentos es la **fuente de verdad** del proyecto. Cualquier decisión de implementación, diseño o datos debe poder trazarse a una sección concreta aquí.

La documentación está pensada para:

1. **Contexto completo** — entender el torneo, el producto y las restricciones sin conocimiento previo.
2. **Implementación guiada** — un desarrollador (o agente IA) puede construir el proyecto fase a fase sin ambigüedad.
3. **Mantenimiento durante el torneo** — saber cómo actualizar plantillas, resultados y retos diarios.
4. **Evitar scope creep** — límites explícitos de v1 vs futuras versiones.

---

## Orden de lectura recomendado

### Para entender el producto (primera vez)

```
01-vision → 04-tournament-context → 05-features-data → 06-features-games
```

### Para implementar

```
02-architecture → 03-data-model → 07-ui-ux → 08-development-roadmap
```

### Para mantener datos durante el Mundial

```
03-data-model → 10-data-maintenance → 04-tournament-context
```

---

## Índice de documentos

| # | Archivo | Descripción |
|---|---------|-------------|
| 01 | [vision.md](./01-vision.md) | Visión, objetivos, usuarios, alcance v1 |
| 02 | [architecture.md](./02-architecture.md) | Stack técnico, carpetas, flujos, decisiones |
| 03 | [data-model.md](./03-data-model.md) | Esquemas TypeScript/JSON, relaciones, ejemplos |
| 04 | [tournament-context.md](./04-tournament-context.md) | Mundial 2026: formato, calendario, sedes |
| 05 | [features-data.md](./05-features-data.md) | Módulo de consulta: equipos, partidos, búsqueda |
| 06 | [features-games.md](./06-features-games.md) | Módulo de juegos: reglas, puntuación, estados |
| 07 | [ui-ux.md](./07-ui-ux.md) | Diseño visual, navegación, responsive, PWA |
| 08 | [development-roadmap.md](./08-development-roadmap.md) | Fases, entregables, criterios de aceptación |
| 09 | [glossary.md](./09-glossary.md) | Glosario de términos |
| 10 | [data-maintenance.md](./10-data-maintenance.md) | Operativa de actualización de datos |

---

## Convenciones en estos documentos

| Convención | Significado |
|------------|-------------|
| **MUST** / **DEBE** | Requisito obligatorio en v1 |
| **SHOULD** / **DEBERÍA** | Recomendado; puede diferirse con justificación |
| **MAY** / **PUEDE** | Opcional en v1 |
| **WON'T (v1)** | Explícitamente fuera de alcance en la primera versión |
| `código` | Rutas, identificadores, campos técnicos |
| Bloques `json` | Ejemplos de datos reales o representativos |

---

## Versionado de la documentación

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-06-09 | Documentación inicial completa |

Cuando el código diverja de la documentación, **la documentación se actualiza primero** o se abre una nota de desviación en el roadmap.

---

## Preguntas abiertas (resolver antes de Fase 2)

Estas decisiones no bloquean la documentación ni la Fase 0–1, pero conviene cerrarlas antes de implementar juegos:

1. **Equipo favorito por defecto** — ¿ninguno, o preguntar en onboarding?
2. **Ratings de jugadores** — ¿escala 1–99 estilo FIFA, o 1–10 simplificada?
3. **Idioma** — UI 100% español en v1 (asumido); nombres de jugadores en formato oficial FIFA.
4. **Spoilers** — ¿activar modo sin spoilers por defecto durante fases eliminatorias?
