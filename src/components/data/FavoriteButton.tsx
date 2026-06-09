"use client";

import { Star } from "lucide-react";

import { useSettings } from "@/components/providers/SettingsProvider";

interface FavoriteButtonProps {
  teamId: string;
  teamName: string;
}

export function FavoriteButton({ teamId, teamName }: FavoriteButtonProps) {
  const { settings, setFavoriteTeamId, hydrated } = useSettings();
  const isFavorite = settings.favoriteTeamId === teamId;

  if (!hydrated) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm opacity-50"
      >
        <Star className="h-4 w-4" />
        Cargando…
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setFavoriteTeamId(isFavorite ? null : teamId)}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
        isFavorite
          ? "border-accent-gold/50 bg-accent-gold/10 text-accent-gold"
          : "border-border bg-bg-secondary text-text-secondary hover:border-accent-gold/30 hover:text-text-primary"
      }`}
      aria-pressed={isFavorite}
    >
      <Star
        className={`h-4 w-4 ${isFavorite ? "fill-accent-gold text-accent-gold" : ""}`}
      />
      {isFavorite ? "Tu selección favorita" : `Marcar ${teamName} como favorito`}
    </button>
  );
}
