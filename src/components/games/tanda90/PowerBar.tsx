"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PowerBarProps {
  active: boolean;
  onLock: (power: number) => void;
}

export function PowerBar({ active, onLock }: PowerBarProps) {
  const [power, setPower] = useState(0);
  const [direction, setDirection] = useState(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setPower(0);
      setDirection(1);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    let last = performance.now();

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      setPower((prev) => {
        const step = delta * 0.12 * direction;
        let next = prev + step;
        if (next >= 100) {
          next = 100;
          setDirection(-1);
        } else if (next <= 0) {
          next = 0;
          setDirection(1);
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, direction]);

  const inSweetSpot = power >= 70 && power <= 90;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>Potencia</span>
        <span className={inSweetSpot ? "text-accent-green" : "text-amber-400"}>
          {Math.round(power)}%
          {inSweetSpot ? " · Zona ideal" : " · Riesgo de fallo"}
        </span>
      </div>
      <div className="relative h-4 overflow-hidden rounded-full bg-bg-elevated">
        <div
          className="absolute inset-y-0 left-[70%] w-[20%] bg-accent-green/25"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 left-0 bg-accent-green transition-none"
          style={{ width: `${power}%` }}
        />
        <div
          className="absolute top-0 h-full w-1 bg-white shadow"
          style={{ left: `calc(${power}% - 2px)` }}
        />
      </div>
      <button
        type="button"
        disabled={!active}
        onClick={() => onLock(Math.round(power))}
        className="w-full rounded-lg bg-accent-gold py-3 text-sm font-semibold text-bg-primary disabled:opacity-40"
      >
        ¡Disparar!
      </button>
    </div>
  );
}
