# TimeGuessr

TimeGuessr è una web app MVP in stile guessing game: osservi un’immagine, scegli un punto sulla mappa, selezioni un anno e ricevi un punteggio basato su distanza geografica ed errore temporale.

## Stack

- Next.js con TypeScript
- Tailwind CSS
- Leaflet e React Leaflet per la mappa interattiva
- Supabase per la tabella `rounds`
- Nessuna autenticazione e nessuna generazione AI
- `localStorage` usato solo per ripristinare lo stato della partita dell’utente

## Setup Supabase

1. Crea un progetto Supabase.
2. Apri l’SQL editor di Supabase.
3. Esegui il contenuto di `schema.sql` per creare la tabella `rounds`.
4. Crea almeno un round con `approved = true` dalla pagina `/admin` o direttamente da Supabase.
5. Copia URL progetto e anon key nelle variabili ambiente locali.

Crea un file `.env.local` nella root del progetto:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## Avvio locale

Installa le dipendenze:

```bash
npm install
```

Avvia il server di sviluppo:

```bash
npm run dev
```

Poi apri [http://localhost:3000](http://localhost:3000) nel browser.

## Pagine

- `/` landing minimale
- `/play` gioco con round casuali approvati
- `/admin` creazione e modifica round

## Comandi utili

```bash
npm run lint
npm run build
```

## Gameplay

1. Vai su `/play`.
2. Il gioco carica da Supabase un round casuale con `approved = true`, esponendo al browser solo i dati pubblici necessari prima del guess.
3. Osserva l’immagine del round.
4. Clicca sulla mappa per impostare un solo marker di guess.
5. Scegli l’anno con lo slider.
6. Premi **Guess**: la richiesta viene validata e calcolata server-side, poi vengono mostrati coordinate vere, anno vero, distanza, errore sull’anno, punteggi e spiegazione.

## Formula punteggio

```ts
geoScore = max(0, 5000 * exp(-distanceKm / 1200))
yearScore = max(0, 3000 * exp(-abs(yearGuess - trueYear) / 25))
totalScore = round(geoScore + yearScore)
```
