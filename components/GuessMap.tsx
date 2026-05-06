'use client';

import { DivIcon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { normalizeLongitude, type LatLng } from '@/lib/scoring';

type GuessMapProps = {
  guess: LatLng | null;
  onGuessChange: (guess: LatLng) => void;
  answer?: LatLng;
  disabled?: boolean;
};

const guessIcon = new DivIcon({
  className: '',
  html: '<div class="h-6 w-6 rounded-full border-2 border-white bg-cyan-400 shadow-lg shadow-cyan-950/60"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const answerIcon = new DivIcon({
  className: '',
  html: '<div class="h-6 w-6 rounded-full border-2 border-white bg-emerald-400 shadow-lg shadow-emerald-950/60"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapClickHandler({
  disabled,
  onGuessChange,
}: Pick<GuessMapProps, 'disabled' | 'onGuessChange'>) {
  useMapEvents({
    click(event) {
      if (disabled) return;

      onGuessChange({
        latitude: event.latlng.lat,
        longitude: normalizeLongitude(event.latlng.lng),
      });
    },
  });

  return null;
}

export default function GuessMap({ guess, onGuessChange, answer, disabled = false }: GuessMapProps) {
  const center: LatLngExpression = [25, 10];

  return (
    <div className="h-[360px] overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/40 sm:h-[420px]">
      <MapContainer center={center} zoom={2} minZoom={2} scrollWheelZoom worldCopyJump className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler disabled={disabled} onGuessChange={onGuessChange} />
        {guess ? (
          <Marker position={[guess.latitude, guess.longitude]} icon={guessIcon}>
            <Popup>Il tuo guess</Popup>
          </Marker>
        ) : null}
        {answer ? (
          <Marker position={[answer.latitude, answer.longitude]} icon={answerIcon}>
            <Popup>Posizione corretta</Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}
