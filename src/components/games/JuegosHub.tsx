"use client";

import Link from "next/link";
import { ArrowRight, Brain, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { getReto11Stats } from "@/lib/storage/reto11";
import { getTanda90Stats } from "@/lib/storage/tanda90";
import { getTriviaStats } from "@/lib/storage/trivia";

const games = [
  {
    href: "/juegos/reto-del-11",
    icon: Trophy,
    title: "Reto del 11",
    description: "Monta el mejor once con reglas y presupuesto.",
    recordKey: "reto11" as const,
  },
  {
    href: "/juegos/tanda-90",
    icon: Target,
    title: "Tanda 90",
    description: "Tanda de penaltis arcade.",
    recordKey: "tanda90" as const,
  },
  {
    href: "/juegos/trivia",
    icon: Brain,
    title: "Trivia Express",
    description: "10 preguntas contra el reloj.",
    recordKey: "trivia" as const,
  },
];

export function JuegosHub() {
  const [reto11Best, setReto11Best] = useState<number | null>(null);
  const [reto11Played, setReto11Played] = useState(0);
  const [tanda90Record, setTanda90Record] = useState<string | null>(null);
  const [triviaRecord, setTriviaRecord] = useState<string | null>(null);

  useEffect(() => {
    const reto11 = getReto11Stats();
    setReto11Best(reto11.bestOverall);
    setReto11Played(reto11.totalGamesPlayed);

    const tanda = getTanda90Stats();
    if (tanda.wins + tanda.losses > 0) {
      setTanda90Record(`${tanda.wins}V–${tanda.losses}D · Racha ${tanda.bestStreak}`);
    }

    const trivia = getTriviaStats();
    if (trivia.bestScore > 0) {
      setTriviaRecord(`${trivia.bestScore} pts · ${trivia.bestCorrect}/10`);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Juegos</h1>
        <p className="mt-1 text-text-secondary">
          Minijuegos del Mundial · {reto11Played} retos del 11 jugados
        </p>
      </div>
      <div className="grid gap-4">
        {games.map(({ href, icon: Icon, title, description, recordKey }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between rounded-xl border border-border bg-bg-secondary p-5 transition-colors hover:border-accent-green/40"
          >
            <div className="flex gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-elevated">
                <Icon className="h-6 w-6 text-accent-green" />
              </div>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-text-secondary">{description}</p>
                {recordKey === "reto11" && reto11Best != null && (
                  <p className="mt-2 text-xs text-accent-gold">
                    Mejor puntuación: {reto11Best} pts
                  </p>
                )}
                {recordKey === "tanda90" && tanda90Record && (
                  <p className="mt-2 text-xs text-accent-gold">{tanda90Record}</p>
                )}
                {recordKey === "trivia" && triviaRecord && (
                  <p className="mt-2 text-xs text-accent-gold">{triviaRecord}</p>
                )}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-text-secondary transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
