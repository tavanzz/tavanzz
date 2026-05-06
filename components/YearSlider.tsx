'use client';

type YearSliderProps = {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (year: number) => void;
};

export default function YearSlider({
  value,
  min = 1850,
  max = 2025,
  disabled = false,
  onChange,
}: YearSliderProps) {
  return (
    <label className="block rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Anno</span>
        <span className="rounded-2xl bg-cyan-300 px-4 py-2 text-2xl font-black text-slate-950">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-6 h-2 w-full cursor-pointer accent-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="mt-3 flex justify-between text-xs font-medium text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </label>
  );
}
