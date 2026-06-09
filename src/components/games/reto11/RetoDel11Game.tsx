"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Check, List } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PlayerPicker } from "@/components/games/reto11/PlayerPicker";
import {
  findEmptySlotForPosition,
  Pitch,
} from "@/components/games/reto11/Pitch";
import { ResultsView } from "@/components/games/reto11/ResultsView";
import { useSettings } from "@/components/providers/SettingsProvider";
import { challenges, players, teams } from "@/lib/data";
import { getDailyChallenge, getDailyDateKey } from "@/lib/games/reto11/daily";
import { describeChallengeRules } from "@/lib/games/reto11/describe-rules";
import {
  assignmentsToPlayers,
  getFormation,
  type SlotAssignments,
} from "@/lib/games/reto11/formations";
import { canAffordPlayer, getPlayerCost } from "@/lib/games/reto11/cost";
import { canFieldEleven, getEligiblePlayers } from "@/lib/games/reto11/pool";
import { calculateScore } from "@/lib/games/reto11/score";
import {
  getBudgetProgress,
  getPositionProgress,
  validateLineup,
} from "@/lib/games/reto11/validate";
import {
  loadReto11Storage,
  saveGameResult,
} from "@/lib/storage/reto11";
import type { Challenge, Player } from "@/lib/schemas";

type GamePhase = "menu" | "rules" | "build" | "results";

type PlayMode = "free" | "daily";

export function RetoDel11Game() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [playMode, setPlayMode] = useState<PlayMode>("free");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [assignments, setAssignments] = useState<SlotAssignments>({});
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [lastScore, setLastScore] = useState<ReturnType<typeof calculateScore> | null>(null);
  const [saveMeta, setSaveMeta] = useState<{
    isNewBest: boolean;
    isDailyOfficial: boolean;
    previousBest: number | null;
  } | null>(null);

  const playerMap = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [],
  );

  const teamsById = useMemo(
    () => new Map(teams.map((t) => [t.id, { group: t.group, name: t.name }])),
    [],
  );

  const slots = useMemo(
    () => getFormation(challenge?.rules.formation),
    [challenge],
  );

  const selectedPlayers = useMemo(() => {
    if (!challenge) return [];
    return assignmentsToPlayers(slots, assignments, playerMap);
  }, [challenge, slots, assignments, playerMap]);

  const selectedIds = useMemo(
    () => new Set(Object.values(assignments).filter(Boolean) as string[]),
    [assignments],
  );

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const dailyChallenge = useMemo(
    () => getDailyChallenge(settings.timezone),
    [settings.timezone],
  );
  const dailyKey = getDailyDateKey(settings.timezone);
  const [storageSnapshot, setStorageSnapshot] = useState(() =>
    typeof window !== "undefined" ? loadReto11Storage() : null,
  );

  useEffect(() => {
    setStorageSnapshot(loadReto11Storage());
  }, [phase]);

  const dailyDone =
    storageSnapshot != null && dailyKey in storageSnapshot.dailyCompleted;

  function resetAssignmentsForChallenge(c: Challenge) {
    const empty: SlotAssignments = {};
    for (const slot of getFormation(c.rules.formation)) {
      empty[slot.id] = null;
    }
    setAssignments(empty);
    setSelectedSlotId(null);
    setValidationErrors([]);
  }

  function startChallenge(c: Challenge, mode: PlayMode) {
    setChallenge(c);
    setPlayMode(mode);
    resetAssignmentsForChallenge(c);
    setPhase("rules");
  }

  function handleStartDaily() {
    startChallenge(dailyChallenge, "daily");
  }

  function handleStartBuild() {
    if (challenge) resetAssignmentsForChallenge(challenge);
    setPhase("build");
  }

  function assignPlayer(player: Player) {
    if (!challenge) return;

    let targetSlotId = selectedSlotId;

    if (targetSlotId) {
      const slot = slots.find((s) => s.id === targetSlotId);
      if (slot && slot.position !== player.position) {
        setValidationErrors([
          `${player.name} es ${player.position}; este slot requiere ${slot.position}.`,
        ]);
        return;
      }
      if (assignments[targetSlotId]) {
        setValidationErrors(["Este slot ya está ocupado. Quítalo primero."]);
        return;
      }
    } else {
      targetSlotId = findEmptySlotForPosition(slots, assignments, player.position);
      if (!targetSlotId) {
        setValidationErrors([
          `No hay slot libre para ${player.position}. Quita un jugador o elige un slot.`,
        ]);
        return;
      }
    }

    if (
      challenge.rules.budget != null &&
      !canAffordPlayer(selectedPlayers, player, challenge.rules.budget)
    ) {
      setValidationErrors([
        `${player.name} cuesta ${getPlayerCost(player)} pts — superarías el presupuesto de ${challenge.rules.budget}.`,
      ]);
      return;
    }

    setAssignments((prev) => ({ ...prev, [targetSlotId!]: player.id }));
    setSelectedSlotId(null);
    setValidationErrors([]);
  }

  function handleSlotClick(slotId: string) {
    const playerId = assignments[slotId];
    if (playerId) {
      setAssignments((prev) => ({ ...prev, [slotId]: null }));
    } else {
      setSelectedSlotId((prev) => (prev === slotId ? null : slotId));
    }
    setValidationErrors([]);
  }

  function handleConfirm() {
    if (!challenge) return;

    const result = validateLineup(selectedPlayers, challenge, teamsById);
    if (!result.valid) {
      setValidationErrors(result.errors);
      return;
    }

    const score = calculateScore(selectedPlayers, challenge);
    const saveResult = saveGameResult(
      challenge.id,
      score.total,
      selectedPlayers.map((p) => p.id),
      {
        isDaily: playMode === "daily",
        dailyDateKey: dailyKey,
      },
    );

    setLastScore(score);
    setSaveMeta(saveResult);
    setPhase("results");
  }

  function handlePlayAgain() {
    if (challenge) resetAssignmentsForChallenge(challenge);
    setPhase("build");
    setLastScore(null);
    setSaveMeta(null);
  }

  function handleChangeChallenge() {
    setChallenge(null);
    setPhase("menu");
    setLastScore(null);
    setSaveMeta(null);
  }

  if (phase === "menu") {
    return (
      <div className="space-y-6">
        <Link
          href="/juegos"
          className="inline-flex items-center gap-1 text-sm text-accent-green hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Juegos
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Reto del 11</h1>
          <p className="mt-1 text-text-secondary">
            Monta tu once respetando las reglas del reto
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartDaily}
          className="w-full rounded-xl border border-accent-gold/40 bg-accent-gold/10 p-4 text-left transition-colors hover:border-accent-gold/60"
        >
          <div className="flex items-center gap-2 font-semibold text-accent-gold">
            <Calendar className="h-5 w-5" />
            Desafío diario
            {dailyDone && (
              <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-xs text-text-secondary">
                Completado hoy
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-medium">{dailyChallenge.title}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {dailyChallenge.description}
          </p>
        </button>

        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            <List className="h-4 w-4" />
            Modo libre
          </h2>
          <ul className="space-y-2">
            {challenges.map((c) => {
              const eligible = getEligiblePlayers(c).length;
              const playable = canFieldEleven(c);
              const best = storageSnapshot?.bestScores[c.id];

              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => startChallenge(c, "free")}
                    disabled={!playable}
                    className="w-full rounded-xl border border-border bg-bg-secondary p-4 text-left transition-colors hover:border-accent-green/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{c.title}</p>
                      {best != null && (
                        <span className="shrink-0 text-xs text-accent-gold">
                          Récord: {best}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {c.description}
                    </p>
                    {!playable && (
                      <p className="mt-2 text-xs text-amber-400">
                        Solo {eligible} jugadores elegibles — necesitas ampliar
                        plantillas en datos
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  if (!challenge) return null;

  if (phase === "rules") {
    const rules = describeChallengeRules(challenge);
    const eligible = getEligiblePlayers(challenge).length;

    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setPhase("menu")}
          className="inline-flex items-center gap-1 text-sm text-accent-green hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Elegir reto
        </button>

        <div>
          <p className="text-sm text-accent-green">
            {playMode === "daily" ? "Desafío diario" : "Modo libre"}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{challenge.title}</h1>
          <p className="mt-2 text-text-secondary">{challenge.description}</p>
        </div>

        <ul className="space-y-2 rounded-xl border border-border bg-bg-secondary p-4">
          {rules.map((rule) => (
            <li key={rule} className="flex gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
              {rule}
            </li>
          ))}
        </ul>

        <p className="text-sm text-text-secondary">
          {eligible} jugadores disponibles en el pool.
        </p>

        <button
          type="button"
          onClick={handleStartBuild}
          className="w-full rounded-lg bg-accent-green py-3 font-medium text-bg-primary"
        >
          Empezar
        </button>
      </div>
    );
  }

  if (phase === "results" && lastScore && saveMeta) {
    return (
      <ResultsView
        challenge={challenge}
        players={selectedPlayers}
        score={lastScore}
        isNewBest={saveMeta.isNewBest}
        isDailyOfficial={saveMeta.isDailyOfficial}
        previousBest={saveMeta.previousBest}
        onPlayAgain={handlePlayAgain}
        onChangeChallenge={handleChangeChallenge}
      />
    );
  }

  const budget = getBudgetProgress(selectedPlayers, challenge);
  const positionProgress = getPositionProgress(selectedPlayers, challenge);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setPhase("rules")}
          className="text-sm text-accent-green hover:underline"
        >
          ← Reglas
        </button>
        <span className="text-sm font-medium">{challenge.title}</span>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span
          className={`rounded-full px-3 py-1 ${
            selectedPlayers.length === 11
              ? "bg-accent-green/20 text-accent-green"
              : "bg-bg-elevated text-text-secondary"
          }`}
        >
          {selectedPlayers.length}/11 jugadores
        </span>
        {budget && (
          <span
            className={`rounded-full px-3 py-1 tabular-nums ${
              budget.current > budget.max
                ? "bg-red-500/20 text-red-400"
                : "bg-bg-elevated text-text-secondary"
            }`}
          >
            Presupuesto: {budget.current}/{budget.max}
          </span>
        )}
        {positionProgress.map(({ position, current, required }) => (
          <span
            key={position}
            className={`rounded-full px-2 py-1 text-xs tabular-nums ${
              current >= required
                ? "text-accent-green"
                : "text-text-secondary"
            }`}
          >
            {position} {current}/{required}
            {current >= required ? " ✓" : ""}
          </span>
        ))}
      </div>

      <Pitch
        slots={slots}
        assignments={assignments}
        playerMap={playerMap}
        selectedSlotId={selectedSlotId}
        onSlotClick={handleSlotClick}
        onRemovePlayer={(slotId) => {
          setAssignments((prev) => ({ ...prev, [slotId]: null }));
          setValidationErrors([]);
        }}
      />

      {selectedSlot && !assignments[selectedSlot.id] && (
        <p className="text-center text-xs text-accent-gold">
          Slot seleccionado: {selectedSlot.position} — elige un jugador abajo
        </p>
      )}

      {validationErrors.length > 0 && (
        <ul className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {validationErrors.map((err) => (
            <li key={err}>• {err}</li>
          ))}
        </ul>
      )}

      <PlayerPicker
        challenge={challenge}
        selectedIds={selectedIds}
        filterPosition={selectedSlot?.position ?? null}
        onSelectPlayer={assignPlayer}
        selectedPlayers={selectedPlayers}
      />

      <button
        type="button"
        onClick={handleConfirm}
        disabled={selectedPlayers.length !== 11}
        className="w-full rounded-lg bg-accent-green py-3 font-medium text-bg-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        Confirmar once
      </button>
    </div>
  );
}
