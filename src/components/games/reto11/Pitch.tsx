"use client";

import { PlayerAvatar } from "@/components/data/PlayerAvatar";
import { getPlayerCost } from "@/lib/games/reto11/cost";
import type { Player, Position } from "@/lib/schemas";
import type { PitchSlot } from "@/lib/games/reto11/formations";

interface PitchProps {
  slots: PitchSlot[];
  assignments: Record<string, string | null>;
  playerMap: Map<string, Player>;
  selectedSlotId: string | null;
  onSlotClick: (slotId: string) => void;
  onRemovePlayer: (slotId: string) => void;
}

export function Pitch({
  slots,
  assignments,
  playerMap,
  selectedSlotId,
  onSlotClick,
  onRemovePlayer,
}: PitchProps) {
  const rows = [0, 1, 2, 3];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-900/50 bg-emerald-950 p-3 shadow-inner">
      <div className="pointer-events-none absolute inset-4 rounded-lg border border-white/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

      <div className="relative space-y-3 py-2">
        {rows.map((row) => {
          const rowSlots = slots.filter((s) => s.row === row);
          return (
            <div
              key={row}
              className="flex justify-center gap-2"
              style={{
                gridTemplateColumns: `repeat(${rowSlots.length}, minmax(0, 1fr))`,
              }}
            >
              {rowSlots.map((slot) => {
                const playerId = assignments[slot.id];
                const player = playerId ? playerMap.get(playerId) : null;
                const selected = selectedSlotId === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSlotClick(slot.id)}
                    className={`group relative flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-full border-2 border-dashed transition-all sm:h-20 sm:w-20 ${
                      player
                        ? "border-accent-green bg-emerald-900/80"
                        : selected
                          ? "border-accent-gold bg-emerald-900/60"
                          : "border-white/30 bg-emerald-900/40 hover:border-white/50"
                    }`}
                    aria-label={
                      player
                        ? `${player.name}, pulsar para quitar`
                        : `Slot ${slot.position}, pulsar para asignar`
                    }
                  >
                    {player ? (
                      <>
                        <PlayerAvatar
                          name={player.name}
                          position={player.position}
                          size="xs"
                        />
                        <span className="max-w-full truncate px-1 text-[10px] font-semibold leading-tight sm:text-xs">
                          {player.name.split(" ").pop()}
                        </span>
                        <span className="text-[10px] text-emerald-200/80">
                          {getPlayerCost(player)}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemovePlayer(slot.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              onRemovePlayer(slot.id);
                            }
                          }}
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-bg-primary text-xs text-text-secondary opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label={`Quitar ${player.name}`}
                        >
                          ×
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-white/50">
                        {slot.position}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function findEmptySlotForPosition(
  slots: PitchSlot[],
  assignments: Record<string, string | null>,
  position: Position,
): string | null {
  const slot = slots.find(
    (s) => s.position === position && !assignments[s.id],
  );
  return slot?.id ?? null;
}
