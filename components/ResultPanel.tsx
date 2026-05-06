import type { RoundResult } from '@/lib/rounds';
import type { LatLng, ScoreBreakdown } from '@/lib/scoring';

type ResultPanelProps = {
  result: RoundResult;
  guess: LatLng;
  yearGuess: number;
  score: ScoreBreakdown;
};

const formatCoordinate = (value: number) => value.toFixed(4);
const formatDistance = (value: number) => new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 }).format(value);
const formatScore = (value: number) => new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 }).format(value);

export default function ResultPanel({ result, guess, yearGuess, score }: ResultPanelProps) {
  return (
    <section className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-6 shadow-xl shadow-emerald-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200">Risultato</p>
          <h2 className="mt-2 text-3xl font-black text-white">{formatScore(score.totalScore)} punti</h2>
          <p className="mt-1 text-lg font-bold text-emerald-100">
            {result.locationName}{result.country ? `, ${result.country}` : ''}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
          Guess: {formatCoordinate(guess.latitude)}, {formatCoordinate(guess.longitude)} · {yearGuess}
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ResultItem label="Coordinate vere" value={`${formatCoordinate(result.latitude)}, ${formatCoordinate(result.longitude)}`} />
        <ResultItem label="Anno vero" value={String(result.year)} />
        <ResultItem label="Anno scelto" value={String(yearGuess)} />
        <ResultItem label="Distanza" value={`${formatDistance(score.distanceKm)} km`} />
        <ResultItem label="Errore anno" value={`${score.yearError} anni`} />
        <ResultItem label="Score geografico" value={formatScore(score.geoScore)} />
        <ResultItem label="Score temporale" value={formatScore(score.yearScore)} />
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ClueBlock title="Geo clues" value={result.geoClues} />
        <ClueBlock title="Time clues" value={result.timeClues} />
      </div>

      <p className="mt-6 rounded-2xl bg-slate-950/50 p-4 leading-7 text-slate-200">
        {result.explanation ?? 'Nessuna spiegazione disponibile per questo round.'}
      </p>
    </section>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</dt>
      <dd className="mt-2 text-lg font-bold text-white">{value}</dd>
    </div>
  );
}

function ClueBlock({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</h3>
      <p className="mt-2 leading-7 text-slate-200">{value || 'Nessun indizio curato disponibile.'}</p>
    </div>
  );
}
