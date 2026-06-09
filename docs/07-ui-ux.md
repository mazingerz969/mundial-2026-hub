# 07 — UI/UX y diseño visual

## Dirección de diseño

**Concepto:** *Noche de partido* — la app se siente como consultar el Mundial en el sofá, con la tele apagada y el móvil en la mano.

| Atributo | Descripción |
|----------|-------------|
| **Tono** | Deportivo, limpio, confiado — no infantil |
| **Densidad** | Media en datos; espaciada en juegos |
| **Motion** | Sutil en navegación; expresiva en resultados de juego |
| **Iconografía** | Lucide o similar — línea simple |

---

## Paleta de colores

### Tema oscuro (default)

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-primary` | `#0B0F14` | Fondo principal |
| `--bg-secondary` | `#141B24` | Tarjetas, paneles |
| `--bg-elevated` | `#1C2633` | Modales, dropdowns |
| `--text-primary` | `#F4F7FA` | Texto principal |
| `--text-secondary` | `#8B9CB3` | Metadatos, labels |
| `--accent-green` | `#22C55E` | Césped, CTAs primarios, éxito |
| `--accent-gold` | `#EAB308` | Trofeo, récords, highlights |
| `--accent-blue` | `#3B82F6` | Enlaces, info |
| `--danger` | `#EF4444` | Errores, derrota |
| `--warning` | `#F59E0B` | Aplazado, alertas |
| `--border` | `#2A3544` | Bordes sutiles |

### Tema claro (opcional)

| Token | Hex |
|-------|-----|
| `--bg-primary` | `#F8FAFC` |
| `--bg-secondary` | `#FFFFFF` |
| `--text-primary` | `#0F172A` |

### Colores de equipo

Se usan `teams.primaryColor` / `secondaryColor` como acentos locales en fichas y Tanda 90, nunca como fondo de texto largo.

---

## Tipografía

| Rol | Familia | Peso | Tamaño base |
|-----|---------|------|-------------|
| Display / scores | `Geist` o `Inter` | 700 | 32–48 px |
| Headings | Misma | 600 | 18–24 px |
| Body | Misma | 400 | 14–16 px |
| Caption | Misma | 400 | 12 px |

**DEBE** cargar fuente con `next/font` para evitar layout shift.

---

## Espaciado y radios

| Token | Valor |
|-------|-------|
| `--radius-sm` | 6px |
| `--radius-md` | 12px |
| `--radius-lg` | 16px |
| `--spacing-page` | 16px móvil, 24px desktop |
| `--max-width` | 1280px contenido |

---

## Navegación

### Móvil (< 768px)

**Bottom navigation** fija:

```
┌────────┬────────┬────────┬────────┐
│ Inicio │ Equipos│ Calend.│ Juegos │
└────────┴────────┴────────┴────────┘
```

- Icono + label corto.
- Ítem activo: `accent-green` + indicador superior.

### Desktop (≥ 768px)

**Sidebar izquierda** colapsable o **top nav** horizontal:

```
[Logo]  Inicio  Equipos  Calendario  Juegos     [🔍] [⚙️]
```

### Header compartido

- Logo / título "Mundial 2026".
- Botón búsqueda → `/buscar`.
- Botón configuración → `/configuracion`.
- En juegos: botón "Salir" contextual.

---

## Componentes clave

### `TeamCard`

- Ratio 3:2 aprox, hover elevación.
- Bandera: imagen `/flags/{flagCode}.svg`.

### `MatchRow`

- Escudos pequeños (32px).
- Hora prominente a la izquierda.
- Estado con pill de color: programado (gris), en juego (verde pulsante), finalizado (azul).

### `PlayerRow`

- Dorsal en círculo si existe.
- Rating como badge a la derecha.

### `Pitch` (Reto del 11)

- Verde `#166534` con líneas blancas semitransparentes.
- Slots vacíos: círculo punteado.
- Jugador en slot: foto placeholder o iniciales + nombre corto.

### Botones

| Variante | Uso |
|----------|-----|
| Primary | Confirmar, Jugar |
| Secondary | Cancelar, Volver |
| Ghost | Filtros, chips |

Altura mínima touch: **44px**.

---

## Layout responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| `< 640px` | 1 columna, bottom nav |
| `640–1024px` | 2 columnas en grids |
| `> 1024px` | Sidebar + contenido max-width |

### Campo Reto del 11

- Móvil: campo arriba, lista jugadores abajo (scroll).
- Desktop: split 60/40 campo vs lista.

---

## Feedback y estados

| Estado | Patrón UI |
|--------|-----------|
| Loading | Skeleton screens, no spinners fullscreen |
| Empty | Ilustración mínima + texto + CTA |
| Error | Banner rojo dismissible |
| Offline | Barra amarilla "Sin conexión — datos guardados" |
| Éxito (juego) | Confetti sutil o pulse en score |

---

## Animaciones

| Contexto | Animación | Duración |
|----------|-----------|----------|
| Navegación | Fade | 150ms |
| Score reveal | Count-up | 800ms |
| Penal (Tanda 90) | Balón a esquina | 600ms |
| Incorrecto trivia | Shake horizontal | 300ms |

Respetar `prefers-reduced-motion`: desactivar animaciones no esenciales.

---

## Accesibilidad

| Requisito | Implementación |
|-----------|----------------|
| Contraste | WCAG 2.1 AA mínimo |
| Focus visible | Ring `accent-green` 2px |
| Teclado | Todos los controles de juego alternativa keyboard |
| Screen readers | `aria-label` en iconos, `role="status"` en timer |
| Tamaño texto | No depender solo de color para estado |

---

## PWA

### `manifest.json`

```json
{
  "name": "Mundial 2026 Hub",
  "short_name": "Mundial 26",
  "description": "Datos y juegos del Mundial 2026",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0B0F14",
  "theme_color": "#22C55E",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker

- Precache: shell de app, JSON de datos, banderas usadas.
- Estrategia: **Stale-while-revalidate** para assets; **Cache-first** para datos en offline.

### Install prompt

- Banner discreto tras 2ª visita (MAY v1).
- Instrucciones en configuración: "Añadir a pantalla de inicio".

---

## Microcopy (español)

| Contexto | Texto |
|----------|-------|
| Sin partidos hoy | "Hoy no hay partidos. Mira el calendario de mañana." |
| Spoiler activo | "Resultados ocultos — desactiva en ajustes" |
| Reto inválido | "Tu once no cumple las reglas todavía" |
| Récord nuevo | "¡Nuevo récord personal!" |
| Trivia timeout | "¡Se acabó el tiempo!" |

Tono: tú, informal pero claro.

---

## Iconografía por sección

| Sección | Icono sugerido |
|---------|----------------|
| Inicio | Home |
| Equipos | Shield |
| Calendario | Calendar |
| Juegos | Gamepad2 |
| Búsqueda | Search |
| Favorito | Star (filled) |
| Spoiler | EyeOff |

---

## Wireframes ASCII de referencia

### Inicio

```
┌──────────────────────────────┐
│ Mundial 2026        🔍  ⚙️  │
├──────────────────────────────┤
│ HOY                          │
│ ┌──────────────────────────┐ │
│ │ 19:00  ARG vs CAN        │ │
│ └──────────────────────────┘ │
│ TU SELECCIÓN ⭐ Argentina     │
│ Próximo: 15 jun vs ...       │
├──────────────────────────────┤
│ [Equipos] [Calendario] [Jugar]│
├──────────────────────────────┤
│ 🏠  🛡️  📅  🎮              │
└──────────────────────────────┘
```

---

## Referencias

- Features → [05-features-data.md](./05-features-data.md), [06-features-games.md](./06-features-games.md)
- Arquitectura rutas → [02-architecture.md](./02-architecture.md)
