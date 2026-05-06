import { NextResponse } from 'next/server';
import { toRoundResult } from '@/lib/rounds';
import { calculateScore, isValidLatitude, isValidLongitude, normalizeLongitude } from '@/lib/scoring';
import { getSupabaseClient } from '@/lib/supabaseClient';

type GuessRequestBody = {
  roundId?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  yearGuess?: unknown;
};

const isValidYearGuess = (year: unknown): year is number =>
  typeof year === 'number' && Number.isInteger(year) && year >= 0 && year <= 3000;

export async function POST(request: Request) {
  let body: GuessRequestBody;

  try {
    body = (await request.json()) as GuessRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.roundId !== 'string') {
    return NextResponse.json({ error: 'roundId is required.' }, { status: 400 });
  }

  if (!isValidLatitude(body.latitude) || !isValidLongitude(body.longitude)) {
    return NextResponse.json({ error: 'Valid latitude and longitude are required.' }, { status: 400 });
  }

  if (!isValidYearGuess(body.yearGuess)) {
    return NextResponse.json({ error: 'A valid integer yearGuess is required.' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data: round, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('id', body.roundId)
    .eq('approved', true)
    .eq('status', 'approved')
    .single();

  if (error || !round) {
    return NextResponse.json({ error: 'Round not found.' }, { status: 404 });
  }

  const longitude = normalizeLongitude(body.longitude);
  const score = calculateScore({
    guess: { latitude: body.latitude, longitude },
    answer: { latitude: round.lat, longitude: round.lng },
    yearGuess: body.yearGuess,
    trueYear: round.year,
  });

  return NextResponse.json({
    result: toRoundResult(round),
    score,
  });
}
