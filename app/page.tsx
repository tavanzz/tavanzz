import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="mb-4 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
        MVP demo · storia, geografia e intuito
      </p>
      <h1 className="max-w-3xl text-5xl font-black tracking-tight text-white sm:text-7xl">
        TimeGuessr
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
        Osserva una foto, scegli sulla mappa dove pensi sia stata scattata e usa lo slider per indovinare l’anno. Il punteggio premia precisione geografica e temporale.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/play"
          className="rounded-full bg-cyan-300 px-8 py-3 text-base font-bold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-200"
        >
          Gioca ora
        </Link>
        <a
          href="https://leafletjs.com/"
          className="rounded-full border border-white/15 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10"
        >
          Mappa con Leaflet
        </a>
      </div>
    </main>
  );
}
