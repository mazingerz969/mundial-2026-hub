"use client";

import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";

import type { ShotAnimationPayload } from "@/lib/games/tanda90/phaser/PenaltyScene";

interface PhaserGoalViewProps {
  shotTrigger: number;
  payload: ShotAnimationPayload | null;
  primaryColor?: string;
}

function waitForLayout(element: HTMLElement): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const measure = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width >= 40 && rect.height >= 40) {
        resolve({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
        return true;
      }
      return false;
    };

    if (measure()) return;

    requestAnimationFrame(() => {
      if (measure()) return;
      requestAnimationFrame(() => {
        if (measure()) return;
        resolve({
          width: Math.max(320, Math.floor(element.clientWidth || 480)),
          height: Math.max(240, Math.floor(element.clientHeight || 360)),
        });
      });
    });
  });
}

export function PhaserGoalView({
  shotTrigger,
  payload,
  primaryColor = "#22c55e",
}: PhaserGoalViewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    async function boot() {
      try {
        const wrapper = wrapperRef.current;
        const container = containerRef.current;
        if (!wrapper || !container) return;

        const { width, height } = await waitForLayout(wrapper);
        if (cancelled) return;

        const { createPenaltyGame } = await import(
          "@/lib/games/tanda90/phaser/createPenaltyGame"
        );
        if (cancelled || !containerRef.current) return;

        const game = createPenaltyGame(container, primaryColor, { width, height });
        gameRef.current = game;

        resizeObserver = new ResizeObserver(() => {
          const rect = wrapper.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            game.scale.resize(Math.floor(rect.width), Math.floor(rect.height));
          }
        });
        resizeObserver.observe(wrapper);

        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar el campo");
        }
      }
    }

    boot();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      gameRef.current?.destroy(true);
      gameRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, []);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || !ready) return;
    game.registry.set("ballColor", primaryColor);
    game.events.emit("update-ball-color", primaryColor);
  }, [primaryColor, ready]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || !ready || !payload || shotTrigger === 0) return;
    game.events.emit("play-shot", payload);
  }, [shotTrigger, payload, ready]);

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto w-full max-w-md min-h-[240px] overflow-hidden rounded-xl border border-border bg-[#0b1a0f] shadow-inner"
      style={{ aspectRatio: "4 / 3" }}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />

      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b1a0f] text-sm text-text-secondary">
          Cargando campo…
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b1a0f] px-4 text-center text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
