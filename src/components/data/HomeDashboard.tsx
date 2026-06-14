"use client";

import Link from "next/link";
import { ArrowRight, Calendar, ClipboardList, Gamepad2, Shield, Star } from "lucide-react";

import { MatchRow } from "@/components/data/MatchRow";
import { useLiveData } from "@/components/providers/LiveDataProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { getStats, getTeamById } from "@/lib/data";
import {
  getNextMatchForTeamFromList,
  getRecentFinishedFromList,
} from "@/lib/data/live";
import { getQuinielaStats } from "@/lib/storage/quiniela";
import {
  formatDateLabel,
  getDateKeyInTimezone,
  getTodayKeyInTimezone,
} from "@/lib/utils/datetime";

function daysUntil(dateIso: string): number {
  const start = new Date(`${dateIso}T12:00:00Z`);
  const now = new Date();
  const diff = start.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function HomeDashboard() {
  const { settings, hydrated } = useSettings();
  const { matches, quinielaResults, tournament } = useLiveData();
  const stats = getStats();
  const quinielaScore = getQuinielaStats(matches, quinielaResults);
  const tz = settings.timezone;
  const todayKey = getTodayKeyInTimezone(tz);

  const todayMatches = matches
    .filter((m) => getDateKeyInTimezone(m.datetime, tz) === todayKey)
    .sort(
      (a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    );

  const favoriteTeam = settings.favoriteTeamId
    ? getTeamById(settings.favoriteTeamId)
    : null;
  const nextFavoriteMatch = settings.favoriteTeamId
    ? getNextMatchForTeamFromList(matches, settings.favoriteTeamId)
    : undefined;

  const recentFinished = getRecentFinishedFromList(matches, 3);

  const nextMatchday = [...matches]
    .filter((m) => m.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    )[0];

  const daysToKickoff = daysUntil(tournament.startDate);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-bg-secondary p-6">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-green/12 via-transparent to-accent-gold/8"
          aria-hidden
        />
        <div className="relative">
          <p className="text-sm font-medium text-accent-green">FIFA World Cup 2026</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Tu hub del Mundial
          </h1>
          <p className="mt-3 max-w-xl text-text-secondary">
            Consulta equipos, plantillas y calendario. Juega al Reto del 11, Tanda
            90 y Trivia Express.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-accent-gold/30 bg-accent-gold/10 px-3 py-1 text-sm font-medium text-accent-gold">
              {daysToKickoff === 0
                ? "El torneo arranca hoy"
                : `Faltan ${daysToKickoff} días`}
            </span>
            <span className="text-sm text-text-secondary">
              {stats.teamCount} equipos · {stats.playerCount} jugadores ·{" "}
              {stats.matchCount} partidos
            </span>
          </div>
        </div>
      </section>

      {hydrated && favoriteTeam ? (
        <section className="rounded-xl border border-accent-gold/30 bg-accent-gold/5 p-4">
          <div className="flex items-center gap-2 text-sm text-accent-gold">
            <Star className="h-4 w-4 fill-accent-gold" />
            Tu selección
          </div>
          <Link
            href={`/equipos/${favoriteTeam.id}`}
            className="mt-1 block text-lg font-semibold hover:text-accent-green"
          >
            {favoriteTeam.name}
          </Link>
          {nextFavoriteMatch ? (
            <div className="mt-3">
              <p className="text-xs text-text-secondary">Próximo partido</p>
              <MatchRow
                match={nextFavoriteMatch}
                timezone={tz}
                spoilerMode={settings.spoilerMode}
                compact
                highlight
              />
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">
              Sin partidos próximos programados.
            </p>
          )}
        </section>
      ) : hydrated ? (
        <section className="rounded-xl border border-dashed border-border bg-bg-secondary p-4 text-center">
          <p className="text-sm text-text-secondary">
            Elige tu selección favorita para ver su próximo partido aquí.
          </p>
          <Link
            href="/configuracion"
            className="mt-3 inline-block text-sm font-medium text-accent-green hover:underline"
          >
            Ir a configuración →
          </Link>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hoy</h2>
          <Link
            href="/calendario"
            className="text-sm text-accent-green hover:underline"
          >
            Ver calendario
          </Link>
        </div>
        {todayMatches.length > 0 ? (
          <ul className="space-y-3">
            {todayMatches.map((match) => (
              <li key={match.id}>
                <MatchRow
                  match={match}
                  timezone={tz}
                  spoilerMode={settings.spoilerMode}
                  compact
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-border bg-bg-secondary px-4 py-6 text-sm text-text-secondary">
            <p>
              Hoy no hay partidos en tu zona horaria (
              {settings.timezone.replace(/_/g, " ")}).
            </p>
            {nextMatchday && (
              <p className="mt-2">
                Próximo:{" "}
                <span className="text-text-primary">
                  {formatDateLabel(nextMatchday.datetime, tz)}
                </span>
                {" — "}
                {getTeamById(nextMatchday.homeTeamId)?.name} vs{" "}
                {getTeamById(nextMatchday.awayTeamId)?.name}
              </p>
            )}
            {!nextMatchday && (
              <p className="mt-2">
                El torneo arranca el{" "}
                {new Date(tournament.startDate).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                })}
                .
              </p>
            )}
          </div>
        )}
      </section>

      {recentFinished.length > 0 && !settings.spoilerMode && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Resultados recientes</h2>
          <ul className="space-y-3">
            {recentFinished.map((match) => (
              <li key={match.id}>
                <MatchRow
                  match={match}
                  timezone={tz}
                  spoilerMode={false}
                  compact
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {settings.spoilerMode && hydrated && (
        <p className="text-center text-xs text-text-secondary">
          Modo sin spoilers activo — los resultados están ocultos
        </p>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Accesos rápidos</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: "/quiniela",
              icon: ClipboardList,
              title: "Quiniela",
              desc:
                quinielaScore.total > 0
                  ? `${quinielaScore.total} pts · predicciones`
                  : "Partidos y jugadores",
            },
            {
              href: "/equipos",
              icon: Shield,
              title: "Equipos",
              desc: `${stats.teamCount} selecciones`,
            },
            {
              href: "/calendario",
              icon: Calendar,
              title: "Calendario",
              desc: "Horarios y fases",
            },
            {
              href: "/juegos",
              icon: Gamepad2,
              title: "Juegos",
              desc: "3 minijuegos",
            },
          ].map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center justify-between rounded-xl border border-border bg-bg-secondary p-4 transition-all hover:border-accent-green/40 active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4 text-accent-green" />
                  {title}
                </div>
                <p className="mt-1 text-sm text-text-secondary">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
