"use client";

import Link from "next/link";
import { Eye, EyeOff, Globe, Star } from "lucide-react";

import { Flag } from "@/components/data/Flag";
import { useSettings } from "@/components/providers/SettingsProvider";
import { TIMEZONE_OPTIONS } from "@/lib/constants/labels";
import { detectTimezone } from "@/lib/storage/settings";
import { getTeamById, teams } from "@/lib/data";

export function SettingsView() {
  const {
    settings,
    hydrated,
    setFavoriteTeamId,
    setTimezone,
    setSpoilerMode,
    updateSettings,
  } = useSettings();

  const favoriteTeam = settings.favoriteTeamId
    ? getTeamById(settings.favoriteTeamId)
    : null;

  const sortedTeams = [...teams].sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );

  if (!hydrated) {
    return (
      <p className="py-8 text-center text-text-secondary">Cargando ajustes…</p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="mt-1 text-text-secondary">
          Preferencias guardadas en tu dispositivo
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-bg-secondary p-4">
        <div className="flex items-center gap-2 font-medium">
          <Star className="h-4 w-4 text-accent-gold" />
          Equipo favorito
        </div>
        <p className="text-sm text-text-secondary">
          Aparecerá en el inicio y podrás filtrar el calendario.
        </p>
        <select
          value={settings.favoriteTeamId ?? ""}
          onChange={(e) => setFavoriteTeamId(e.target.value || null)}
          className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm"
          aria-label="Seleccionar equipo favorito"
        >
          <option value="">Ninguno</option>
          {sortedTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} (Grupo {team.group})
            </option>
          ))}
        </select>
        {favoriteTeam && (
          <Link
            href={`/equipos/${favoriteTeam.id}`}
            className="inline-flex items-center gap-2 text-sm text-accent-green hover:underline"
          >
            <Flag flagCode={favoriteTeam.flagCode} alt={favoriteTeam.name} size={20} />
            Ver ficha de {favoriteTeam.name}
          </Link>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-bg-secondary p-4">
        <div className="flex items-center gap-2 font-medium">
          <Globe className="h-4 w-4 text-accent-blue" />
          Zona horaria
        </div>
        <p className="text-sm text-text-secondary">
          Los horarios del calendario se muestran en esta zona.
        </p>
        <select
          value={settings.timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm"
          aria-label="Zona horaria"
        >
          {TIMEZONE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
          {!TIMEZONE_OPTIONS.some((t) => t.value === settings.timezone) && (
            <option value={settings.timezone}>{settings.timezone}</option>
          )}
        </select>
        <button
          type="button"
          onClick={() => setTimezone(detectTimezone())}
          className="text-sm text-accent-green hover:underline"
        >
          Usar zona detectada ({detectTimezone()})
        </button>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-bg-secondary p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-medium">
              {settings.spoilerMode ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Modo sin spoilers
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              Oculta marcadores de partidos finalizados o en juego.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.spoilerMode}
            onClick={() => setSpoilerMode(!settings.spoilerMode)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              settings.spoilerMode ? "bg-accent-green" : "bg-bg-elevated"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                settings.spoilerMode ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-bg-secondary p-4">
        <p className="font-medium">Tema</p>
        <p className="text-sm text-text-secondary">
          El tema claro estará disponible próximamente. Por ahora solo oscuro.
        </p>
        <select
          value={settings.theme}
          onChange={(e) =>
            updateSettings({ theme: e.target.value as "dark" | "light" })
          }
          disabled
          className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm opacity-60"
        >
          <option value="dark">Oscuro (noche de partido)</option>
          <option value="light">Claro (próximamente)</option>
        </select>
      </section>
    </div>
  );
}
