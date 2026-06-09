"use client";

import { Flag } from "@/components/data/Flag";
import { PlayerAvatar } from "@/components/data/PlayerAvatar";
import { getPlayersByTeamId, getTeamById } from "@/lib/data";
import type { Player } from "@/lib/schemas";

interface MatchMvpSelectProps {
  homeTeamId: string;
  awayTeamId: string;
  value: string | null;
  onChange: (playerId: string | null) => void;
  disabled?: boolean;
}

function SquadSection({
  teamId,
  squad,
  selectedId,
  disabled,
  onSelect,
}: {
  teamId: string;
  squad: Player[];
  selectedId: string | null;
  disabled?: boolean;
  onSelect: (playerId: string) => void;
}) {
  const team = getTeamById(teamId);
  if (!team) return null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Flag flagCode={team.flagCode} alt={team.name} size={20} />
        <p className="text-xs font-medium">
          {team.name}{" "}
          <span className="text-text-secondary">({squad.length} jugadores)</span>
        </p>
      </div>
      <ul className="max-h-44 overflow-y-auto rounded-lg border border-border bg-bg-primary divide-y divide-border">
        {squad.length === 0 ? (
          <li className="px-3 py-4 text-center text-xs text-text-secondary">
            Plantilla no disponible
          </li>
        ) : (
          squad.map((player) => {
            const selected = selectedId === player.id;
            return (
              <li key={player.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(player.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors disabled:opacity-50 ${
                    selected
                      ? "bg-accent-green/15 text-accent-green"
                      : "hover:bg-bg-elevated"
                  }`}
                >
                  <PlayerAvatar
                    name={player.name}
                    position={player.position}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1 truncate">{player.name}</span>
                  {player.number != null && (
                    <span className="text-xs tabular-nums text-text-secondary">
                      #{player.number}
                    </span>
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

export function MatchMvpSelect({
  homeTeamId,
  awayTeamId,
  value,
  onChange,
  disabled = false,
}: MatchMvpSelectProps) {
  const homeSquad = getPlayersByTeamId(homeTeamId);
  const awaySquad = getPlayersByTeamId(awayTeamId);

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-text-secondary">
        MVP del partido — elige un jugador de cualquiera de las dos plantillas
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <SquadSection
          teamId={homeTeamId}
          squad={homeSquad}
          selectedId={value}
          disabled={disabled}
          onSelect={(id) => onChange(value === id ? null : id)}
        />
        <SquadSection
          teamId={awayTeamId}
          squad={awaySquad}
          selectedId={value}
          disabled={disabled}
          onSelect={(id) => onChange(value === id ? null : id)}
        />
      </div>
    </div>
  );
}
