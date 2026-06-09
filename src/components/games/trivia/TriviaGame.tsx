"use client";

import Link from "next/link";
import { ArrowLeft, Brain, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  generateTriviaQuestions,
  scoreAnswer,
} from "@/lib/games/trivia/generate";
import type {
  TriviaAnswer,
  TriviaQuestion,
  TriviaSessionResult,
} from "@/lib/games/trivia/types";
import {
  TRIVIA_QUESTION_COUNT,
  TRIVIA_TIME_SECONDS,
} from "@/lib/games/trivia/types";
import {
  getTriviaStats,
  recordTriviaResult,
} from "@/lib/storage/trivia";

type Phase = "intro" | "quiz" | "results";

export function TriviaGame() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<TriviaAnswer[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(TRIVIA_TIME_SECONDS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [result, setResult] = useState<TriviaSessionResult | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [stats, setStats] = useState(getTriviaStats);

  const secondsRef = useRef(TRIVIA_TIME_SECONDS);
  const finishingRef = useRef(false);
  const answersRef = useRef<TriviaAnswer[]>([]);

  answersRef.current = answers;

  const finishQuiz = useCallback(
    (finalAnswers: TriviaAnswer[], timedOut: boolean) => {
      if (finishingRef.current) return;
      finishingRef.current = true;

      const correctCount = finalAnswers.filter((a) => a.correct).length;
      const score = finalAnswers.reduce((sum, a) => sum + a.points, 0);
      const session: TriviaSessionResult = {
        score,
        correctCount,
        totalQuestions: questions.length,
        answers: finalAnswers,
        timedOut,
      };

      const { isNewBest: nb } = recordTriviaResult(session);
      setResult(session);
      setIsNewBest(nb);
      setStats(getTriviaStats());
      setPhase("results");
    },
    [questions.length],
  );

  const advanceOrFinish = useCallback(
    (answer: TriviaAnswer) => {
      const nextAnswers = [...answers, answer];
      setAnswers(nextAnswers);
      setSelectedIndex(null);

      if (nextAnswers.length >= questions.length || secondsRef.current <= 0) {
        finishQuiz(nextAnswers, secondsRef.current <= 0);
      } else {
        setCurrentIndex(nextAnswers.length);
      }
    },
    [answers, questions.length, finishQuiz],
  );

  useEffect(() => {
    if (phase !== "quiz") return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        secondsRef.current = next;
        if (next <= 0) {
          clearInterval(interval);
          finishQuiz(answersRef.current, true);
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, finishQuiz]);

  function startQuiz() {
    const qs = generateTriviaQuestions(TRIVIA_QUESTION_COUNT);
    if (qs.length < TRIVIA_QUESTION_COUNT) {
      alert("No hay suficientes datos para generar 10 preguntas.");
      return;
    }
    finishingRef.current = false;
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers([]);
    setSecondsLeft(TRIVIA_TIME_SECONDS);
    secondsRef.current = TRIVIA_TIME_SECONDS;
    setSelectedIndex(null);
    setResult(null);
    setPhase("quiz");
  }

  function handleAnswer(index: number) {
    if (phase !== "quiz" || selectedIndex != null) return;

    const question = questions[currentIndex];
    if (!question) return;

    const correct = index === question.correctIndex;
    const points = scoreAnswer(correct, secondsRef.current);

    setSelectedIndex(index);
    if (!correct) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }

    setTimeout(() => {
      advanceOrFinish({
        questionId: question.id,
        selectedIndex: index,
        correct,
        points,
        secondsRemaining: secondsRef.current,
      });
    }, correct ? 400 : 600);
  }

  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <Link
          href="/juegos"
          className="inline-flex items-center gap-1 text-sm text-accent-green hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Juegos
        </Link>

        <div className="rounded-2xl border border-border bg-bg-secondary p-6 text-center">
          <Brain className="mx-auto h-12 w-12 text-accent-green" />
          <h1 className="mt-4 text-2xl font-bold">Trivia Express</h1>
          <p className="mt-2 text-text-secondary">
            {TRIVIA_QUESTION_COUNT} preguntas · {TRIVIA_TIME_SECONDS} segundos
            en total
          </p>
        </div>

        <ul className="space-y-2 rounded-xl border border-border bg-bg-secondary p-4 text-sm text-text-secondary">
          <li>• +100 pts por acierto</li>
          <li>• +2 pts por cada segundo que quede al responder</li>
          <li>• Equipos, jugadores, sedes y partidos del Mundial 2026</li>
        </ul>

        {stats.bestScore > 0 && (
          <p className="text-center text-sm text-accent-gold">
            Récord: {stats.bestScore} pts ({stats.bestCorrect}/{TRIVIA_QUESTION_COUNT} aciertos)
          </p>
        )}

        <button
          type="button"
          onClick={startQuiz}
          className="w-full rounded-lg bg-accent-green py-3 font-medium text-bg-primary"
        >
          Empezar
        </button>
      </div>
    );
  }

  if (phase === "results" && result) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-bg-secondary p-6 text-center">
          <p className="text-sm text-text-secondary">Resultado</p>
          <p className="mt-2 text-5xl font-bold tabular-nums text-accent-green">
            {result.score}
          </p>
          <p className="mt-2 text-lg">
            {result.correctCount}/{result.totalQuestions} aciertos
          </p>
          {isNewBest && (
            <p className="mt-2 text-sm font-medium text-accent-gold">
              ¡Nuevo récord personal!
            </p>
          )}
          {result.timedOut && (
            <p className="mt-1 text-xs text-text-secondary">Se acabó el tiempo</p>
          )}
        </div>

        <ul className="space-y-2 rounded-xl border border-border bg-bg-secondary p-4 text-sm">
          {result.answers.map((a, i) => {
            const q = questions.find((q) => q.id === a.questionId);
            return (
              <li key={a.questionId} className="flex justify-between gap-2">
                <span className="text-text-secondary">
                  {i + 1}. {a.correct ? "✓" : "✗"}
                </span>
                <span className="truncate">{q?.text}</span>
                <span className="shrink-0 tabular-nums text-accent-green">
                  +{a.points}
                </span>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => {
            setPhase("intro");
            finishingRef.current = false;
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-green py-3 font-medium text-bg-primary"
        >
          <RotateCcw className="h-4 w-4" />
          Jugar de nuevo
        </button>
        <Link
          href="/juegos"
          className="block text-center text-sm text-accent-green hover:underline"
        >
          Volver a juegos
        </Link>
      </div>
    );
  }

  const question = questions[currentIndex];

  if (!question) return null;

  const timerPercent = (secondsLeft / TRIVIA_TIME_SECONDS) * 100;
  const urgent = secondsLeft <= 10;

  return (
    <div className={`space-y-5 ${shake ? "animate-[shake_0.3s_ease-in-out]" : ""}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">
          {currentIndex + 1}/{questions.length}
        </span>
        <span
          className={`font-mono font-bold tabular-nums ${urgent ? "text-red-400" : "text-accent-green"}`}
          role="status"
          aria-live="polite"
        >
          {secondsLeft}s
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-bg-elevated">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${urgent ? "bg-red-400" : "bg-accent-green"}`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      <div className="rounded-xl border border-border bg-bg-secondary p-5">
        <p className="text-lg font-medium leading-snug">{question.text}</p>
      </div>

      <div className="grid gap-2">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === question.correctIndex;
          let style =
            "border-border bg-bg-secondary hover:border-accent-green/40";

          if (selectedIndex != null) {
            if (isCorrect) style = "border-accent-green bg-accent-green/10";
            else if (isSelected) style = "border-red-500/50 bg-red-500/10";
            else style = "border-border bg-bg-secondary opacity-50";
          }

          return (
            <button
              key={option}
              type="button"
              disabled={selectedIndex != null}
              onClick={() => handleAnswer(index)}
              className={`rounded-xl border px-4 py-4 text-left text-sm font-medium transition-colors active:scale-[0.98] disabled:cursor-default ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
