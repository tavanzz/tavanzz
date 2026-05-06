import Link from 'next/link';
import PlayGame from '@/components/PlayGame';

export default function PlayPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100">
            ← Landing
          </Link>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">TimeGuessr</h1>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-300">
          Round approvati · coordinate e anno nascosti
        </div>
      </header>

      <PlayGame />
    </main>
  );
}
