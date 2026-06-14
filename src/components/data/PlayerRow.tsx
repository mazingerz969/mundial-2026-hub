import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";

import { PlayerAvatar } from "@/components/data/PlayerAvatar";
import { PositionBadge } from "@/components/data/PositionBadge";
import type { Player } from "@/lib/schemas";
import { getPlayerPath } from "@/lib/utils/player-profile";

interface PlayerRowProps {
  player: Player;
}

export function PlayerRow({ player }: PlayerRowProps) {
  return (
    <li>
      <Link
        href={getPlayerPath(player)}
        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-elevated/50"
      >
        <PlayerAvatar name={player.name} position={player.position} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-medium">
            {player.number != null && (
              <span
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-xs tabular-nums text-text-secondary"
                aria-label={`Dorsal ${player.number}`}
              >
                {player.number}
              </span>
            )}
            <span className="truncate">{player.name}</span>
            {player.isKeyPlayer && (
              <Star
                className="h-3.5 w-3.5 shrink-0 fill-accent-gold text-accent-gold"
                aria-label="Jugador clave"
              />
            )}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <PositionBadge position={player.position} />
            {player.detailedPosition ? (
              <span className="truncate">{player.detailedPosition}</span>
            ) : null}
            {player.club ? <span className="truncate">{player.club}</span> : null}
            {player.age != null ? <span>{player.age} años</span> : null}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}
