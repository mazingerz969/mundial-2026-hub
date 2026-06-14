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

Durante el torneo **no hace falta redeployar toda la app** para cada partido.

### Cómo funciona

1. El calendario base vive en `data/matches.json` (horarios, equipos).
2. Los **resultados y stats oficiales** se parchean en `data/live-overrides.json`.
3. La web consulta `/api/live` cada ~2 min y fusiona ambos.

### Actualizar un partido (CLI)

```bash
# Partido terminado
npm run update-match -- match-group-a-01 2 1 finished

# En directo
npm run update-match -- match-group-a-02 --live 1 0

# Con penaltis
npm run update-match -- match-r32-01 1 1 finished --penalties 4 3

# MVP oficial del partido (quiniela)
npm run update-match -- --mvp match-group-a-01 emiliano-martinez

# Tabla de goleadores
npm run update-match -- --scorer lionel-messi 3

# Cambiar fase del torneo
npm run update-match -- --phase round_of_16
```

Luego:

```bash
git add data/live-overrides.json
git commit -m "update live results"
git push
```

### Sincronizar desde API (recomendado)

Registro gratis en [football-data.org](https://www.football-data.org/client/register):

```bash
cp .env.example .env.local   # pega FOOTBALL_DATA_API_KEY
npm run sync-results         # trae marcadores reales del Mundial
npm run sync-results -- --dry-run   # vista previa sin escribir
```

**No usamos IA para marcadores** — alucinan resultados igual que datos inventados.

### Importante

| Método | Uso |
|--------|-----|
| `npm run sync-results` | Automático desde football-data.org |
| `npm run update-match` | Manual, cuando verificas el marcador tú mismo |

En Vercel → Environment Variables:

| Variable | Valor |
|----------|--------|
| `LIVE_DATA_URL` | `https://raw.githubusercontent.com/mazingerz969/mundial-2026-hub/main/data/live-overrides.json` |

Tras cada `git push` de `live-overrides.json`, la web se actualiza sola en ~1–2 min.


## Licencia

Proyecto personal / portfolio.
