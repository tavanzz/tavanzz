'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import ResultPanel from '@/components/ResultPanel';
import YearSlider from '@/components/YearSlider';
import type { PublicRound, RoundResult } from '@/lib/rounds';
import type { LatLng, ScoreBreakdown } from '@/lib/scoring';

const GuessMap = dynamic(() => import('@/components/GuessMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900 text-slate-400">
      Caricamento mappa…
    </div>
  ),
});

const GAME_STATE_KEY = 'timeguessr:game-state';

type GuessResponse = {
  result: RoundResult;
  score: ScoreBreakdown;
};

type RandomRoundResponse = {
  round: PublicRound;
};

type SavedGameState = {
  round: PublicRound;
  guess: LatLng | null;
  yearGuess: number;
  score: ScoreBreakdown | null;
  result: RoundResult | null;
};

const defaultYearGuess = 1975;

function isSavedGameState(value: unknown): value is SavedGameState {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<SavedGameState>;
  const resultIsValid =
    candidate.result === null ||
    (typeof candidate.result?.locationName === 'string' &&
      typeof candidate.result.latitude === 'number' &&
      typeof candidate.result.longitude === 'number' &&
      typeof candidate.result.year === 'number');

  return (
    typeof candidate.round?.id === 'string' &&
    typeof candidate.round.imageUrl === 'string' &&
    typeof candidate.yearGuess === 'number' &&
    ('guess' in candidate) &&
    ('score' in candidate) &&
    resultIsValid
  );
}

export default function PlayGame() {
  const [round, setRound] = useState<PublicRound | null>(null);
  const [guess, setGuess] = useState<LatLng | null>(null);
  const [yearGuess, setYearGuess] = useState(defaultYearGuess);
  const [score, setScore] = useState<ScoreBreakdown | null>(null);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [isLoadingRound, setIsLoadingRound] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSubmitted = score !== null && result !== null;

  const loadRandomRound = useCallback(async () => {
    setIsLoadingRound(true);
    setError(null);

    try {
      const response = await fetch('/api/rounds/random', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Nessun round approvato disponibile.');
      }

      const data = (await response.json()) as RandomRoundResponse;
      setRound(data.round);
      setGuess(null);
      setYearGuess(defaultYearGuess);
      setScore(null);
      setResult(null);
      window.localStorage.removeItem(GAME_STATE_KEY);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Errore durante il caricamento del round.');
    } finally {
      setIsLoadingRound(false);
    }
  }, []);

  useEffect(() => {
    const savedState = window.localStorage.getItem(GAME_STATE_KEY);

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as unknown;

        if (isSavedGameState(parsedState)) {
          setRound(parsedState.round);
          setGuess(parsedState.guess);
          setYearGuess(parsedState.yearGuess);
          setScore(parsedState.score);
          setResult(parsedState.result);
          setIsLoadingRound(false);
          return;
        }
      } catch {
        // Ignore corrupt saved game state and start a fresh round.
      }

      window.localStorage.removeItem(GAME_STATE_KEY);
    }

    void loadRandomRound();
  }, [loadRandomRound]);

  useEffect(() => {
    if (!round || isLoadingRound) return;

    const state: SavedGameState = {
      round,
      guess,
      yearGuess,
      score,
      result,
    };

    window.localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  }, [guess, isLoadingRound, result, round, score, yearGuess]);

  const submitGuess = async () => {
    if (!round || !guess || isSubmitting || hasSubmitted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: round.id,
          latitude: guess.latitude,
          longitude: guess.longitude,
          yearGuess,
        }),
      });

      if (!response.ok) {
        throw new Error('Impossibile calcolare il risultato. Riprova.');
      }

      const data = (await response.json()) as GuessResponse;
      setResult(data.result);
      setScore(data.score);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Errore inatteso. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const playAgain = () => {
    void loadRandomRound();
  };

  if (isLoadingRound) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-10 text-center text-slate-300">
        Caricamento round…
      </div>
    );
  }

  if (!round) {
    return (
      <div className="rounded-3xl border border-red-300/30 bg-red-300/10 p-10 text-center text-red-100">
        <p>{error ?? 'Round non disponibile.'}</p>
        <button
          type="button"
          onClick={playAgain}
          className="mt-6 rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-200"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-slate-950/40">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Osserva</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Round misterioso</h2>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={round.imageUrl}
              alt="Immagine demo del round da indovinare"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>

          <GuessMap
            guess={guess}
            onGuessChange={setGuess}
            disabled={hasSubmitted || isSubmitting}
            answer={result ? { latitude: result.latitude, longitude: result.longitude } : undefined}
          />
        </section>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Come giocare</p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-300">
              <li>Clicca sulla mappa per piazzare un solo marker.</li>
              <li>Scegli l’anno con lo slider.</li>
              <li>Premi Guess per rivelare risposta e punteggio.</li>
            </ol>
          </div>
          <YearSlider value={yearGuess} disabled={hasSubmitted || isSubmitting} onChange={setYearGuess} />
          <button
            type="button"
            disabled={!guess || hasSubmitted || isSubmitting}
            onClick={submitGuess}
            className="w-full rounded-2xl bg-cyan-300 px-6 py-4 text-lg font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          >
            {isSubmitting ? 'Calcolo…' : 'Guess'}
          </button>
          {error ? <p className="rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-sm text-red-100">{error}</p> : null}
          {hasSubmitted ? (
            <button
              type="button"
              onClick={playAgain}
              className="w-full rounded-2xl border border-white/15 px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              Nuovo round
            </button>
          ) : null}
        </aside>
      </div>

      {score && result && guess ? (
        <div className="mt-6">
          <ResultPanel result={result} guess={guess} yearGuess={yearGuess} score={score} />
        </div>
      ) : null}
    </>
  );
}
