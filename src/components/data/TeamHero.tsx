import { FavoriteButton } from "@/components/data/FavoriteButton";
import { Flag } from "@/components/data/Flag";
import { CONFEDERATION_LABELS } from "@/lib/constants/labels";
import type { Team } from "@/lib/schemas";
import { getTeamAccentColor } from "@/lib/utils/player-avatar";

interface TeamHeroProps {
  team: Team;
  squadCount: number;
}

export function TeamHero({ team, squadCount }: TeamHeroProps) {
  const accent = getTeamAccentColor(team.primaryColor);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-secondary">
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <div
        className="relative p-5 sm:p-6"
        style={{
          background: `linear-gradient(135deg, ${accent}18 0%, transparent 55%)`,
        }}
      >
        <div className="flex flex-wrap items-start gap-4">
          <Flag flagCode={team.flagCode} alt={team.name} size={56} />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
            <p className="mt-2 text-text-secondary">
              Grupo {team.group} ·{" "}
              {CONFEDERATION_LABELS[team.confederation] ?? team.confederation} ·
              #{team.fifaRanking} FIFA
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Entrenador: {team.coach}
              {squadCount > 0 ? ` · ${squadCount} jugadores` : ""}
            </p>
            <div className="mt-4">
              <FavoriteButton teamId={team.id} teamName={team.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
