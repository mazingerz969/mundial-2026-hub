import Link from "next/link";
import { Star } from "lucide-react";

import { Flag } from "@/components/data/Flag";
import type { Team } from "@/lib/schemas";
import { getTeamAccentColor } from "@/lib/utils/player-avatar";

interface TeamCardProps {
  team: Team;
  isFavorite?: boolean;
}

export function TeamCard({ team, isFavorite }: TeamCardProps) {
  const accent = getTeamAccentColor(team.primaryColor);

  return (
    <Link
      href={`/equipos/${team.id}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-bg-secondary p-4 transition-all hover:border-accent-green/40 active:scale-[0.98]"
      style={{ borderLeftWidth: "3px", borderLeftColor: accent }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${accent}12 0%, transparent 60%)`,
        }}
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <Flag flagCode={team.flagCode} alt={team.name} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-tight">
              {team.name}
              {isFavorite && (
                <Star
                  className="ml-1.5 inline h-3.5 w-3.5 fill-accent-gold text-accent-gold"
                  aria-label="Favorito"
                />
              )}
            </p>
            <span className="shrink-0 rounded-md bg-bg-elevated px-2 py-0.5 text-xs font-medium">
              {team.shortName}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Grupo {team.group} · #{team.fifaRanking} FIFA
          </p>
          <p className="mt-2 truncate text-xs text-text-secondary">
            {team.coach}
          </p>
        </div>
      </div>
    </Link>
  );
}
