"use client";

import Link from "next/link";
import { Copy, RotateCcw, Trophy } from "lucide-react";
import { useState } from "react";

import { Flag } from "@/components/data/Flag";
import { getTeamById } from "@/lib/data";
import { getPlayerCost } from "@/lib/games/reto11/cost";
import type { ScoreResult } from "@/lib/games/reto11/score";
import type { Challenge, Player } from "@/lib/schemas";

interface ResultsViewProps {
  challenge: Challenge;
  players: Player[];
  score: ScoreResult;
  isNewBest: boolean;
  isDailyOfficial: boolean;
  previousBest: number | null;
  onPlayAgain: () => void;
  onChangeChallenge: () => void;
}

export function ResultsView({
  challenge,
  players,
  score,
  isNewBest,
  isDailyOfficial,
  previousBest,
  onPlayAgain,
  onChangeChallenge,
}: ResultsViewProps) {
  const [copied, setCopied] = useState(false);

  const shareText = [
    `🏆 Reto del 11 — ${challenge.title}`,
    `Puntuación: ${score.total}`,
    `Once: ${players.map((p) => p.name.split(" ").pop()).join(", ")}`,
  ].join("\n");

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-bg-secondary p-6 text-center">
        <Trophy className="mx-auto h-10 w-10 text-accent-gold" />
        <p className="mt-3 text-sm text-text-secondary">{challenge.title}</p>
        <p className="mt-2 text-5xl font-bold tabular-nums text-accent-green">
          {score.total}
        </p>
        {isNewBest && (
          <p className="mt-2 text-sm font-medium text-accent-gold">
            ¡Nuevo récord personal!
          </p>
        )}
        {isDailyOfficial && (
          <p className="mt-1 text-xs text-text-secondary">
            Resultado oficial del desafío diario guardado
          </p>
        )}
        {previousBest != null && !isNewBest && (
          <p className="mt-2 text-sm text-text-secondary">
            Tu récord: {previousBest} pts
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-bg-secondary p-4">
        <h3 className="font-medium">Desglose</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex justify-between">
            <span className="text-text-secondary">Base (coste once)</span>
            <span className="font-medium tabular-nums">{score.base}</span>
          </li>
          {score.bonuses.map((b) => (
            <li key={b.type + b.label} className="flex justify-between">
              <span className="text-text-secondary">{b.label}</span>
              <span className="font-medium text-accent-green tabular-nums">
                +{b.points}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-bg-secondary p-4">
        <h3 className="mb-3 font-medium">Tu once</h3>
        <ul className="space-y-2">
          {players
            .sort((a, b) => getPlayerCost(b) - getPlayerCost(a))
            .map((p) => {
              const team = getTeamById(p.teamId);
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    {team && (
                      <Flag flagCode={team.flagCode} alt={team.name} size={20} />
                    )}
                    <span>{p.name}</span>
                    <span className="text-text-secondary">{p.position}</span>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {getPlayerCost(p)} pts
                  </span>
                </li>
              );
            })}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-green px-4 py-3 text-sm font-medium text-bg-primary"
        >
          <RotateCcw className="h-4 w-4" />
          Reintentar
        </button>
        <button
          type="button"
          onClick={onChangeChallenge}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-bg-secondary px-4 py-3 text-sm font-medium"
        >
          Otro reto
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-bg-secondary px-4 py-3 text-sm"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copiado" : "Compartir"}
        </button>
      </div>

      <Link
        href="/juegos"
        className="block text-center text-sm text-accent-green hover:underline"
      >
        Volver a juegos
      </Link>
    </div>
  );
}
