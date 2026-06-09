"use client";

import Link from "next/link";
import { ArrowLeft, Frown, RotateCcw, Trophy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Flag } from "@/components/data/Flag";
import { PhaserGoalView } from "@/components/games/tanda90/PhaserGoalView";
import { PowerBar } from "@/components/games/tanda90/PowerBar";
import { getTeamById, teams } from "@/lib/data";
import {
  applyShotResult,
  cpuKeeperChoice,
  createInitialState,
  getCurrentRoundLabel,
  nextActivePhase,
  pickRandomCorner,
  resolveShot,
} from "@/lib/games/tanda90/engine";
import type { Corner, Tanda90State } from "@/lib/games/tanda90/types";
import { CORNER_LABELS } from "@/lib/games/tanda90/types";
import {
  getTanda90Stats,
  recordMatchResult,
} from "@/lib/storage/tanda90";

function pickCpuTeam(excludeId: string): string {
  const pool = teams.filter((t) => t.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)]!.id;
}

function CornerButtons({
  onPick,
  disabled,
  label,
}: {
  onPick: (c: Corner) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-center text-sm text-text-secondary">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {(["left", "center", "right"] as Corner[]).map((corner) => (
          <button
            key={corner}
            type="button"
            disabled={disabled}
            onClick={() => onPick(corner)}
            className="rounded-lg border border-border bg-bg-secondary py-4 text-sm font-medium transition-colors hover:border-accent-green hover:bg-bg-elevated disabled:opacity-40 active:scale-95"
          >
            {CORNER_LABELS[corner]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Tanda90Game() {
  const [state, setState] = useState<Tanda90State>(createInitialState);
  const [shootCorner, setShootCorner] = useState<Corner | null>(null);
  const [stats, setStats] = useState(getTanda90Stats);
  const [saveTimeLeft, setSaveTimeLeft] = useState(0);
  const saveResolvedRef = useRef(false);
  const recordedRef = useRef(false);

  const userTeam = state.userTeamId ? getTeamById(state.userTeamId) : null;
  const cpuTeam = state.cpuTeamId ? getTeamById(state.cpuTeamId) : null;

  const startGame = (teamId: string) => {
    const cpuId = pickCpuTeam(teamId);
    saveResolvedRef.current = false;
    recordedRef.current = false;
    setState({
      ...createInitialState(),
      phase: "shoot",
      userTeamId: teamId,
      cpuTeamId: cpuId,
    });
    setShootCorner(null);
  };

  const finishSavePhase = useCallback(
    (cpuCorner: Corner, keeperCorner: Corner) => {
      if (saveResolvedRef.current) return;
      saveResolvedRef.current = true;

      const result = resolveShot(cpuCorner, keeperCorner);
      setState((prev) =>
        applyShotResult(prev, {
          shooter: "cpu",
          shooterCorner: cpuCorner,
          keeperCorner,
          result,
        }),
      );
    },
    [],
  );

  useEffect(() => {
    if (state.phase !== "reveal") return;

    const timer = setTimeout(() => {
      setState((current) => {
        if (current.phase === "finished") {
          if (
            !recordedRef.current &&
            current.winner &&
            current.winner !== "draw"
          ) {
            recordedRef.current = true;
            recordMatchResult(current.winner);
            setStats(getTanda90Stats());
          }
          return current;
        }
        if (current.phase !== "reveal") return current;
        saveResolvedRef.current = false;
        return nextActivePhase(current);
      });
      setShootCorner(null);
    }, 1200);

    return () => clearTimeout(timer);
  }, [state.phase, state.history.length]);

  useEffect(() => {
    if (state.phase !== "save") {
      setSaveTimeLeft(0);
      return;
    }

    saveResolvedRef.current = false;
    const cpuCorner = state.pendingCpuCorner;
    if (!cpuCorner || !state.saveDeadline) return;

    const interval = setInterval(() => {
      const left = Math.max(0, state.saveDeadline! - Date.now());
      setSaveTimeLeft(left);
      if (left <= 0) {
        clearInterval(interval);
        finishSavePhase(cpuCorner, pickRandomCorner());
      }
    }, 50);

    return () => clearInterval(interval);
  }, [state.phase, state.saveDeadline, state.pendingCpuCorner, finishSavePhase]);

  function handleUserSave(keeperCorner: Corner) {
    if (state.phase !== "save" || !state.pendingCpuCorner) return;
    finishSavePhase(state.pendingCpuCorner, keeperCorner);
  }

  function handleUserShoot(power: number) {
    if (state.phase !== "shoot" || !shootCorner) return;

    const keeperCorner = cpuKeeperChoice(shootCorner);
    const result = resolveShot(shootCorner, keeperCorner, power);

    setState((prev) =>
      applyShotResult(prev, {
        shooter: "user",
        shooterCorner: shootCorner,
        keeperCorner,
        power,
        result,
      }),
    );
  }

  function handleRematch() {
    if (state.userTeamId) startGame(state.userTeamId);
    else setState(createInitialState());
  }

  if (state.phase === "pick-team") {
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
          <h1 className="text-2xl font-bold">Tanda 90</h1>
          <p className="mt-1 text-text-secondary">
            Tanda de penaltis al mejor de 5 · Muerte súbita si hay empate
          </p>
          {stats.wins + stats.losses > 0 && (
            <p className="mt-2 text-sm text-text-secondary">
              {stats.wins}V – {stats.losses}D · Racha máx: {stats.bestStreak}
            </p>
          )}
        </div>

        <p className="text-sm font-medium">Elige tu selección</p>
        <div className="grid max-h-[50vh] gap-2 overflow-y-auto sm:grid-cols-2">
          {[...teams]
            .sort((a, b) => a.name.localeCompare(b.name, "es"))
            .map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => startGame(team.id)}
                className="flex items-center gap-3 rounded-xl border border-border bg-bg-secondary p-3 text-left transition-colors hover:border-accent-green/40"
              >
                <Flag flagCode={team.flagCode} alt={team.name} size={28} />
                <span className="text-sm font-medium">{team.name}</span>
              </button>
            ))}
        </div>
      </div>
    );
  }

  if (state.phase === "finished") {
    const won = state.winner === "user";
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-2xl border border-border bg-bg-secondary p-8">
          {won ? (
            <Trophy className="mx-auto h-12 w-12 text-accent-gold" />
          ) : (
            <Frown className="mx-auto h-12 w-12 text-text-secondary" />
          )}
          <h2 className="mt-4 text-2xl font-bold">
            {won ? "¡Ganaste la tanda!" : "Perdiste la tanda"}
          </h2>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {state.userScore} – {state.cpuScore}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            {userTeam?.name} vs {cpuTeam?.name ?? "Rival"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRematch}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-green py-3 font-medium text-bg-primary"
        >
          <RotateCcw className="h-4 w-4" />
          Jugar de nuevo
        </button>
        <Link
          href="/juegos"
          className="block text-sm text-accent-green hover:underline"
        >
          Volver a juegos
        </Link>
      </div>
    );
  }

  const userShoots = state.phase === "shoot";
  const userSaves = state.phase === "save";
  const isReveal = state.phase === "reveal";

  const lastRecord = state.history[state.history.length - 1];
  const shotPayload =
    isReveal && lastRecord
      ? {
          shooterCorner: lastRecord.shooterCorner,
          keeperCorner: lastRecord.keeperCorner,
          result: lastRecord.result,
          ballColor:
            lastRecord.shooter === "user"
              ? (userTeam?.primaryColor ?? "#22c55e")
              : (cpuTeam?.primaryColor ?? "#ef4444"),
        }
      : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setState(createInitialState())}
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          ← Salir
        </button>
        <span className="text-xs text-text-secondary">
          {getCurrentRoundLabel(state)}
          {state.isSuddenDeath && " ⚡"}
        </span>
      </div>

      <div className="flex items-center justify-center gap-4 rounded-xl border border-border bg-bg-secondary p-4">
        <div className="flex flex-1 flex-col items-center gap-1">
          {userTeam && (
            <Flag flagCode={userTeam.flagCode} alt={userTeam.name} size={32} />
          )}
          <span className="text-xs font-medium">{userTeam?.shortName ?? "TÚ"}</span>
          <span className="text-3xl font-bold tabular-nums text-accent-green">
            {state.userScore}
          </span>
        </div>
        <span className="text-text-secondary">–</span>
        <div className="flex flex-1 flex-col items-center gap-1">
          {cpuTeam && (
            <Flag flagCode={cpuTeam.flagCode} alt={cpuTeam.name} size={32} />
          )}
          <span className="text-xs font-medium">{cpuTeam?.shortName ?? "CPU"}</span>
          <span className="text-3xl font-bold tabular-nums">{state.cpuScore}</span>
        </div>
      </div>

      <PhaserGoalView
        shotTrigger={state.history.length}
        payload={shotPayload}
        primaryColor={userTeam?.primaryColor}
      />

      {userShoots && !isReveal && (
        <div className="space-y-4">
          <CornerButtons
            label={
              shootCorner
                ? `Esquina: ${CORNER_LABELS[shootCorner]}`
                : "1. Elige esquina"
            }
            onPick={setShootCorner}
          />
          {shootCorner && <PowerBar active onLock={handleUserShoot} />}
        </div>
      )}

      {userSaves && !isReveal && (
        <div className="space-y-3">
          <p className="text-center text-sm font-medium text-amber-400">
            ¡Rival lanza! Elige dónde te lanzas
          </p>
          {saveTimeLeft > 0 && (
            <div className="h-1 overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{ width: `${(saveTimeLeft / 1500) * 100}%` }}
              />
            </div>
          )}
          <CornerButtons
            label="Adivina la esquina (1.5 s)"
            onPick={handleUserSave}
          />
        </div>
      )}

      {isReveal && (
        <p className="text-center text-sm text-text-secondary">…</p>
      )}

      {state.history.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {state.history.map((p, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${
                p.result === "goal"
                  ? p.shooter === "user"
                    ? "bg-accent-green"
                    : "bg-red-400"
                  : "bg-bg-elevated"
              }`}
              title={`${p.shooter} ${p.result}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
