# Mundial 2026 Hub

PWA interactiva para el **FIFA World Cup 2026**: consulta de datos del torneo + minijuegos conectados a plantillas reales.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Zod · Phaser · localStorage · PWA

## Demo

**Repositorio:** [github.com/mazingerz969/mundial-2026-hub](https://github.com/mazingerz969/mundial-2026-hub)

**Live:** [mundial-2026-hub-dun.vercel.app](https://mundial-2026-hub-dun.vercel.app)

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

## Actualizar resultados en vivo

Durante el torneo **no hace falta redeployar** ni hacer `git push` por cada gol.

### Cómo funciona (automático)

1. Calendario base en `data/matches.json`.
2. **`/api/live`** consulta football-data.org cada ~60 s (caché compartida) y fusiona marcadores, estado y minuto.
3. El navegador refresca cada **30 s** si hay partidos en juego, cada **5 min** si no.
4. *(Opcional)* `/api/cron/sync-live` invalida la caché — en plan Vercel **Hobby** no hay cron frecuente; el polling del cliente basta. Con **Pro** puedes añadir cron en `vercel.json`.

### Variables en Vercel

| Variable | Obligatoria | Uso |
|----------|-------------|-----|
| `FOOTBALL_DATA_API_KEY` | Sí | Token de football-data.org |
| `CRON_SECRET` | Sí | Protege el endpoint del cron (`openssl rand -hex 32`) |

`LIVE_DATA_URL` ya **no es necesaria** para marcadores — solo si quieres parches manuales de quiniela (MVP, goleadores) vía JSON en GitHub.

### Manual (backup)

```bash
npm run sync-results         # escribe data/live-overrides.json (backup / quiniela)
npm run update-match -- fd-537327 2 1 finished
```

**No usamos IA para marcadores.**


## Licencia

Proyecto personal / portfolio.
