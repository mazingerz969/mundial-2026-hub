# Mundial 2026 Hub

PWA interactiva para el **FIFA World Cup 2026**: consulta de datos del torneo + minijuegos conectados a plantillas reales.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Zod · Phaser · localStorage · PWA

## Demo

**Repositorio:** [github.com/mazingerz969/mundial-2026-hub](https://github.com/mazingerz969/mundial-2026-hub)

**Live:** `https://mundial-2026-hub.vercel.app` _(actualiza tras el deploy)_

## Qué incluye

| Módulo | Descripción |
|--------|-------------|
| **Equipos** | 48 selecciones, plantillas de 26 jugadores, ficha con edad/altura/peso |
| **Calendario** | 104 partidos (grupos + eliminatorias), filtros, modo spoiler |
| **Quiniela** | Marcadores, MVP por partido, top 5 goleadores, MVP del torneo |
| **Búsqueda** | Equipos, jugadores, partidos y sedes |
| **Reto del 11** | Fantasy con presupuesto y validación de plantilla |
| **Tanda 90** | Penaltis arcade (Phaser) |
| **Trivia Express** | Quiz generado desde datos del torneo |

## Datos

Todo vive en JSON estático (`data/`), validado con Zod — **sin backend**:

- 48 equipos · 1.248 jugadores · 104 partidos · 13 sedes

```bash
npm run validate-data   # comprobar esquemas
npm run generate-data   # regenerar plantillas y calendario
```

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Deploy (Vercel + LinkedIn)

### 1. Subir a GitHub

```bash
git add .
git commit -m "Mundial 2026 Hub — PWA lista para producción"
git push -u origin main
```

### 2. Deploy en Vercel

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository
2. Selecciona el repo `mundial-2026-hub`
3. Framework: **Next.js** (detectado automáticamente)
4. Deploy

### 3. Variable opcional (preview en LinkedIn)

En Vercel → Settings → Environment Variables:

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://tu-dominio.vercel.app` |

Redeploy para que Open Graph use la URL correcta al compartir.

### 4. Post en LinkedIn

Texto sugerido:

> He construido **Mundial 2026 Hub**, una PWA para el Mundial 2026 con Next.js 15: equipos, calendario, quiniela con scoring, fichas de jugadores y minijuegos (fantasy, trivia, penaltis). Datos estáticos validados con Zod, sin backend.  
>  
> 🔗 [tu-url.vercel.app]  
> 💻 [github.com/tu-usuario/mundial-2026-hub]

Añade 2–3 capturas (móvil): inicio, quiniela y ficha de jugador.

## Documentación

Especificación completa en [`docs/`](./docs/).

## Licencia

Proyecto personal / portfolio.
