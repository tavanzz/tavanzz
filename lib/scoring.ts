export type LatLng = {
  latitude: number;
  longitude: number;
};

export type ScoreBreakdown = {
  distanceKm: number;
  yearError: number;
  geoScore: number;
  yearScore: number;
  totalScore: number;
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function normalizeLongitude(longitude: number): number {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

export function isValidLatitude(latitude: unknown): latitude is number {
  return typeof latitude === 'number' && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
}

export function isValidLongitude(longitude: unknown): longitude is number {
  return typeof longitude === 'number' && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

function assertValidLatLng(point: LatLng, label: string) {
  if (!isValidLatitude(point.latitude) || !isValidLongitude(point.longitude)) {
    throw new RangeError(`${label} must contain finite latitude [-90, 90] and longitude [-180, 180].`);
  }
}

export function haversineKm(from: LatLng, to: LatLng): number {
  assertValidLatLng(from, 'from');
  assertValidLatLng(to, 'to');

  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2;
  const clampedA = clamp(a, 0, 1);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(clampedA));
}

export function calculateScore(params: {
  guess: LatLng;
  answer: LatLng;
  yearGuess: number;
  trueYear: number;
}): ScoreBreakdown {
  if (!Number.isFinite(params.yearGuess) || !Number.isFinite(params.trueYear)) {
    throw new RangeError('yearGuess and trueYear must be finite numbers.');
  }

  const distanceKm = haversineKm(params.guess, params.answer);
  const yearError = Math.abs(params.yearGuess - params.trueYear);
  const geoScore = Math.max(0, 5000 * Math.exp(-distanceKm / 1200));
  const yearScore = Math.max(0, 3000 * Math.exp(-yearError / 25));

  return {
    distanceKm,
    yearError,
    geoScore,
    yearScore,
    totalScore: Math.round(geoScore + yearScore),
  };
}
