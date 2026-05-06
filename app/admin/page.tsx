'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { roundSourceTypes, roundStatuses, type AdminRound, type RoundFormPayload } from '@/lib/rounds';
import type { RoundSourceType, RoundStatus } from '@/lib/supabaseClient';

type AdminRoundsResponse = {
  rounds: AdminRound[];
};

type AdminRoundResponse = {
  round: AdminRound;
};

type FormState = {
  locationName: string;
  country: string;
  latitude: string;
  longitude: string;
  year: string;
  imageUrl: string;
  explanation: string;
  geoClues: string;
  timeClues: string;
  validationNotes: string;
  status: RoundStatus;
  sourceType: RoundSourceType;
  difficulty: string;
  approved: boolean;
};

const emptyForm: FormState = {
  locationName: '',
  country: '',
  latitude: '',
  longitude: '',
  year: '',
  imageUrl: '',
  explanation: '',
  geoClues: '',
  timeClues: '',
  validationNotes: '',
  status: 'draft',
  sourceType: 'manual',
  difficulty: '1',
  approved: false,
};

const statusFilters: Array<'all' | RoundStatus> = ['all', ...roundStatuses];

const toFormState = (round: AdminRound): FormState => ({
  locationName: round.locationName,
  country: round.country,
  latitude: String(round.latitude),
  longitude: String(round.longitude),
  year: String(round.year),
  imageUrl: round.imageUrl,
  explanation: round.explanation,
  geoClues: round.geoClues,
  timeClues: round.timeClues,
  validationNotes: round.validationNotes,
  status: round.status,
  sourceType: round.sourceType,
  difficulty: String(round.difficulty),
  approved: round.approved,
});

const toPayload = (form: FormState): RoundFormPayload => ({
  locationName: form.locationName,
  country: form.country,
  latitude: Number(form.latitude),
  longitude: Number(form.longitude),
  year: Number(form.year),
  imageUrl: form.imageUrl,
  explanation: form.explanation,
  geoClues: form.geoClues,
  timeClues: form.timeClues,
  validationNotes: form.validationNotes,
  status: form.status,
  sourceType: form.sourceType,
  difficulty: Number(form.difficulty),
  approved: form.status === 'approved' || form.approved,
});

export default function AdminPage() {
  const [rounds, setRounds] = useState<AdminRound[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | RoundStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const approvedCount = useMemo(() => rounds.filter((round) => round.status === 'approved' && round.approved).length, [rounds]);
  const filteredRounds = useMemo(
    () => (statusFilter === 'all' ? rounds : rounds.filter((round) => round.status === statusFilter)),
    [rounds, statusFilter],
  );

  const loadRounds = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/rounds', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Impossibile caricare i round.');
      }

      const data = (await response.json()) as AdminRoundsResponse;
      setRounds(data.rounds);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Errore inatteso durante il caricamento.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRounds();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage(null);
    setError(null);
  };

  const editRound = (round: AdminRound) => {
    setForm(toFormState(round));
    setEditingId(round.id);
    setMessage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveRoundPayload = async (payload: RoundFormPayload, id?: string) => {
    const response = await fetch('/api/admin/rounds', {
      method: id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(id ? { id } : {}),
        ...payload,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error ?? 'Impossibile salvare il round.');
    }

    return (await response.json()) as AdminRoundResponse;
  };

  const saveRound = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const data = await saveRoundPayload(toPayload(form), editingId ?? undefined);

      setRounds((currentRounds) => {
        if (!editingId) return [data.round, ...currentRounds];

        return currentRounds.map((round) => (round.id === data.round.id ? data.round : round));
      });
      setMessage(editingId ? 'Round aggiornato.' : 'Round creato.');
      setForm(emptyForm);
      setEditingId(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Errore inatteso durante il salvataggio.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateRoundStatus = async (round: AdminRound, status: RoundStatus) => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = toPayload({
        ...toFormState(round),
        status,
        approved: status === 'approved',
      });
      const data = await saveRoundPayload(payload, round.id);
      setRounds((currentRounds) => currentRounds.map((currentRound) => (currentRound.id === data.round.id ? data.round : currentRound)));
      setMessage(status === 'approved' ? 'Round approvato manualmente.' : 'Round rifiutato manualmente.');
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Errore inatteso durante il cambio stato.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Admin MVP</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Gestione round</h1>
          <p className="mt-2 text-slate-300">Cura, valida e approva manualmente i round salvati in Supabase.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-slate-300">
          {approvedCount} approvati / {rounds.length} totali
        </div>
      </header>

      <div className="mb-6 rounded-3xl border border-amber-300/30 bg-amber-300/10 p-5 text-amber-50">
        <p className="font-bold">Checklist curatoriale</p>
        <p className="mt-2 text-sm leading-6">
          I round generati o proposti devono restare in <strong>draft</strong> finché non sono controllati manualmente.
          Verifica anacronismi, clima, architettura, segnaletica, abiti, veicoli e coerenza tra immagine, luogo e anno prima di approvare.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={saveRound} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-white">{editingId ? 'Modifica round' : 'Nuovo round'}</h2>
            {editingId ? (
              <button type="button" onClick={resetForm} className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
                Annulla
              </button>
            ) : null}
          </div>

          <TextField label="Location name" value={form.locationName} onChange={(value) => setForm({ ...form, locationName: value })} required />
          <TextField label="Country" value={form.country} onChange={(value) => setForm({ ...form, country: value })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Lat" type="number" value={form.latitude} onChange={(value) => setForm({ ...form, latitude: value })} required />
            <TextField label="Lng" type="number" value={form.longitude} onChange={(value) => setForm({ ...form, longitude: value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Year" type="number" value={form.year} onChange={(value) => setForm({ ...form, year: value })} required />
            <TextField label="Difficulty" type="number" min="1" max="5" value={form.difficulty} onChange={(value) => setForm({ ...form, difficulty: value })} required />
          </div>
          <TextField label="Image URL" value={form.imageUrl} onChange={(value) => setForm({ ...form, imageUrl: value })} required />
          <TextareaField label="Explanation" value={form.explanation} onChange={(value) => setForm({ ...form, explanation: value })} />
          <TextareaField label="Geo clues" value={form.geoClues} onChange={(value) => setForm({ ...form, geoClues: value })} />
          <TextareaField label="Time clues" value={form.timeClues} onChange={(value) => setForm({ ...form, timeClues: value })} />
          <TextareaField label="Validation notes" value={form.validationNotes} onChange={(value) => setForm({ ...form, validationNotes: value })} />

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Status"
              value={form.status}
              options={roundStatuses}
              onChange={(value) => setForm({ ...form, status: value, approved: value === 'approved' })}
            />
            <SelectField
              label="Source type"
              value={form.sourceType}
              options={roundSourceTypes}
              onChange={(value) => setForm({ ...form, sourceType: value })}
            />
          </div>

          {error ? <p className="rounded-2xl border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100">{error}</p> : null}
          {message ? <p className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p> : null}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-cyan-300 px-6 py-4 font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          >
            {isSaving ? 'Salvataggio…' : editingId ? 'Aggiorna round' : 'Crea round'}
          </button>
        </form>

        <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-black text-white">Round</h2>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    statusFilter === status ? 'bg-cyan-300 text-slate-950' : 'border border-white/15 text-white hover:bg-white/10'
                  }`}
                >
                  {status}
                </button>
              ))}
              <button type="button" onClick={loadRounds} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
                Aggiorna
              </button>
            </div>
          </div>

          {isLoading ? <p className="mt-6 text-slate-300">Caricamento round…</p> : null}
          {!isLoading && filteredRounds.length === 0 ? <p className="mt-6 text-slate-300">Nessun round per questo filtro.</p> : null}

          <div className="mt-6 grid gap-4">
            {filteredRounds.map((round) => (
              <article key={round.id} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
                <div className="grid gap-4 p-4 md:grid-cols-[220px_minmax(0,1fr)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={round.imageUrl} alt={`Round ${round.locationName}`} className="aspect-video w-full rounded-xl object-cover" />
                  <div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-black text-white">{round.locationName}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {round.country || 'Senza paese'} · {round.year} · {round.latitude.toFixed(4)}, {round.longitude.toFixed(4)}
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          Status: {round.status} · Source: {round.sourceType} · Difficoltà {round.difficulty}
                        </p>
                      </div>
                      <button type="button" onClick={() => editRound(round)} className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-200">
                        Modifica
                      </button>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-300">{round.explanation || 'Nessuna explanation.'}</p>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <MiniClue title="Geo clues" value={round.geoClues} />
                      <MiniClue title="Time clues" value={round.timeClues} />
                    </div>
                    <p className="mt-3 rounded-xl border border-white/10 bg-slate-900/70 p-3 text-xs leading-5 text-slate-400">
                      Validation notes: {round.validationNotes || 'Da completare prima dell’approvazione.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => updateRoundStatus(round, 'approved')}
                        className="rounded-xl bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-emerald-200 disabled:opacity-50"
                      >
                        Approva
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => updateRoundStatus(round, 'rejected')}
                        className="rounded-xl bg-red-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-red-200 disabled:opacity-50"
                      >
                        Rifiuta
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-300">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        min={min}
        max={max}
        step={type === 'number' ? 'any' : undefined}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
      />
    </label>
  );
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-semibold text-slate-300">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MiniClue({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-300">
      <p className="font-bold text-slate-100">{title}</p>
      <p className="mt-1 leading-5">{value || 'Da completare.'}</p>
    </div>
  );
}
