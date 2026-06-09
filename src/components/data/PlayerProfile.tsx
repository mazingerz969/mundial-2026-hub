import Link from "next/link";
import { Star } from "lucide-react";

import { Flag } from "@/components/data/Flag";
import { PlayerAvatar } from "@/components/data/PlayerAvatar";
import { PositionBadge } from "@/components/data/PositionBadge";
import { FOOT_LABELS, POSITION_LABELS } from "@/lib/constants/labels";
import { getTeamById } from "@/lib/data";
import type { Player } from "@/lib/schemas";
import {
  formatBirthDate,
  formatHeight,
  formatWeight,
  getBirthYear,
} from "@/lib/utils/player-profile";
import { getTeamAccentColor } from "@/lib/utils/player-avatar";

interface PlayerProfileProps {
  player: Player;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums">
        {value ?? "—"}
      </p>
    </div>
  );
}

export function PlayerProfile({ player }: PlayerProfileProps) {
  const team = getTeamById(player.teamId);
  const accent = getTeamAccentColor(team?.primaryColor);
  const birthYear = getBirthYear(player);
  const birthDateLabel = formatBirthDate(player.birthDate);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-secondary">
        <div className="h-1.5 w-full" style={{ backgroundColor: accent }} aria-hidden />
        <div
          className="p-5 sm:p-6"
          style={{
            background: `linear-gradient(135deg, ${accent}18 0%, transparent 55%)`,
          }}
        >
          <div className="flex flex-wrap items-start gap-4">
            <PlayerAvatar
              name={player.name}
              position={player.position}
              size="xl"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {player.number != null && (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated text-sm font-bold tabular-nums">
                    {player.number}
                  </span>
                )}
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {player.name}
                </h1>
                {player.isKeyPlayer && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-gold/15 px-2.5 py-0.5 text-xs font-medium text-accent-gold">
                    <Star className="h-3.5 w-3.5 fill-accent-gold" />
                    Jugador clave
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PositionBadge position={player.position} />
                {player.detailedPosition && (
                  <span className="rounded-full bg-bg-elevated px-2.5 py-0.5 text-xs text-text-secondary">
                    {player.detailedPosition}
                  </span>
                )}
                <span className="rounded-md bg-bg-elevated px-2.5 py-1 text-sm font-semibold tabular-nums">
                  {player.rating} OVR
                </span>
              </div>

              {team && (
                <Link
                  href={`/equipos/${team.id}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-accent-green hover:underline"
                >
                  <Flag flagCode={team.flagCode} alt={team.name} size={20} />
                  {team.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Datos personales</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Edad" value={player.age != null ? `${player.age} años` : null} />
          <StatCard label="Año de nacimiento" value={birthYear} />
          <StatCard label="Fecha de nacimiento" value={birthDateLabel} />
          <StatCard label="Altura" value={formatHeight(player.heightCm)} />
          <StatCard label="Peso" value={formatWeight(player.weightKg)} />
          <StatCard
            label="Pierna hábil"
            value={
              player.preferredFoot
                ? FOOT_LABELS[player.preferredFoot]
                : null
            }
          />
          <StatCard
            label="Posición"
            value={POSITION_LABELS[player.position] ?? player.position}
          />
          <StatCard label="Nacionalidad" value={player.nationality} />
          <StatCard label="Club" value={player.club} />
        </div>
      </section>
    </div>
  );
}
