import { NextResponse } from 'next/server';
import { calculateScore, isValidLatitude, isValidLongitude, normalizeLongitude } from '@/lib/scoring';
import { getSupabaseClient } from '@/lib/supabaseClient';

type GuessRequestBody = {
  roundId?: unknown;
  guessedLat?: unknown;
  guessedLng?: unknown;
  guessedYear?: unknown;
};

const isValidGuessedYear = (year: unknown): year is number =>
  typeof year === 'number' && Number.isInteger(year) && year >= 0 && year <= 3000;

function normalizeClues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((clue): clue is string => typeof clue === 'string' && clue.trim().length > 0);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value
      .split(/\r?\n|;/)
      .map((clue) => clue.trim())
      .filter(Boolean);
  }

  return [];
}

export async function POST(request: Request) {
  let body: GuessRequestBody;

  try {
    body = (await request.json()) as GuessRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.roundId !== 'string' || body.roundId.trim().length === 0) {
    return NextResponse.json({ error: 'roundId is required.' }, { status: 400 });
  }

  if (!isValidLatitude(body.guessedLat) || !isValidLongitude(body.guessedLng)) {
    return NextResponse.json({ error: 'guessedLat and guessedLng must be valid coordinates.' }, { status: 400 });
  }

  if (!isValidGuessedYear(body.guessedYear)) {
    return NextResponse.json({ error: 'guessedYear must be an integer between 0 and 3000.' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();
    const { data: round, error } = await supabase
      .from('rounds')
      .select('id,lat,lng,year,location_name,country,explanation,geo_clues,time_clues')
      .eq('id', body.roundId)
      .eq('approved', true)
      .eq('status', 'approved')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Unable to load round.' }, { status: 500 });
    }

    if (!round) {
      return NextResponse.json({ error: 'Round not found.' }, { status: 404 });
    }

    const guessedLng = normalizeLongitude(body.guessedLng);
    const score = calculateScore({
      guess: { latitude: body.guessedLat, longitude: guessedLng },
      answer: { latitude: round.lat, longitude: round.lng },
      yearGuess: body.guessedYear,
      trueYear: round.year,
    });

    return NextResponse.json({
      correctLat: round.lat,
      correctLng: round.lng,
      correctYear: round.year,
      locationName: round.location_name,
      country: round.country,
      distanceKm: score.distanceKm,
      yearError: score.yearError,
      geoScore: score.geoScore,
      yearScore: score.yearScore,
      totalScore: score.totalScore,
      explanation: round.explanation,
      geoClues: normalizeClues(round.geo_clues),
      timeClues: normalizeClues(round.time_clues),
    });
  } catch (error) {
    console.error('Failed to calculate guess result.', error);
    return NextResponse.json({ error: 'Unable to calculate result.' }, { status: 500 });
  }
}
