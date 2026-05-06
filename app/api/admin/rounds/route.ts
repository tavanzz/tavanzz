import { NextResponse } from 'next/server';
import {
  roundSourceTypes,
  roundStatuses,
  toAdminRound,
  toRoundInsert,
  toRoundUpdate,
  type RoundFormPayload,
} from '@/lib/rounds';
import { isValidLatitude, isValidLongitude } from '@/lib/scoring';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { RoundSourceType, RoundStatus } from '@/lib/supabaseClient';

type AdminRoundRequestBody = Partial<RoundFormPayload> & {
  id?: unknown;
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isOptionalString = (value: unknown): value is string => typeof value === 'string';
const isValidYear = (value: unknown): value is number => Number.isInteger(value) && Number.isFinite(value);
const isValidDifficulty = (value: unknown): value is number =>
  Number.isInteger(value) && Number.isFinite(value) && value >= 1 && value <= 5;
const isValidStatus = (value: unknown): value is RoundStatus =>
  typeof value === 'string' && roundStatuses.includes(value as RoundStatus);
const isValidSourceType = (value: unknown): value is RoundSourceType =>
  typeof value === 'string' && roundSourceTypes.includes(value as RoundSourceType);

function parsePayload(body: AdminRoundRequestBody): RoundFormPayload | { error: string } {
  if (!isNonEmptyString(body.locationName)) return { error: 'locationName is required.' };
  if (!isOptionalString(body.country)) return { error: 'country must be a string.' };
  if (!isValidLatitude(body.latitude)) return { error: 'latitude must be between -90 and 90.' };
  if (!isValidLongitude(body.longitude)) return { error: 'longitude must be between -180 and 180.' };
  if (!isValidYear(body.year)) return { error: 'year must be an integer.' };
  if (!isNonEmptyString(body.imageUrl)) return { error: 'imageUrl is required.' };
  if (!isOptionalString(body.explanation)) return { error: 'explanation must be a string.' };
  if (!isOptionalString(body.geoClues)) return { error: 'geoClues must be a string.' };
  if (!isOptionalString(body.timeClues)) return { error: 'timeClues must be a string.' };
  if (!isOptionalString(body.validationNotes)) return { error: 'validationNotes must be a string.' };
  if (!isValidStatus(body.status)) return { error: 'status must be draft, approved, or rejected.' };
  if (!isValidSourceType(body.sourceType)) return { error: 'sourceType must be manual, ai, or archive.' };
  if (!isValidDifficulty(body.difficulty)) return { error: 'difficulty must be an integer from 1 to 5.' };
  if (typeof body.approved !== 'boolean') return { error: 'approved must be boolean.' };

  return {
    locationName: body.locationName,
    country: body.country,
    latitude: body.latitude,
    longitude: body.longitude,
    year: body.year,
    imageUrl: body.imageUrl,
    explanation: body.explanation,
    geoClues: body.geoClues,
    timeClues: body.timeClues,
    validationNotes: body.validationNotes,
    status: body.status,
    sourceType: body.sourceType,
    difficulty: body.difficulty,
    approved: body.approved,
  };
}

export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('rounds').select('*').order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Unable to load admin rounds.' }, { status: 500 });
  }

  return NextResponse.json({ rounds: (data ?? []).map(toAdminRound) });
}

export async function POST(request: Request) {
  let body: AdminRoundRequestBody;

  try {
    body = (await request.json()) as AdminRoundRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const payload = parsePayload(body);

  if ('error' in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('rounds').insert(toRoundInsert(payload)).select('*').single();

  if (error || !data) {
    return NextResponse.json({ error: 'Unable to create round.' }, { status: 500 });
  }

  return NextResponse.json({ round: toAdminRound(data) }, { status: 201 });
}

export async function PATCH(request: Request) {
  let body: AdminRoundRequestBody;

  try {
    body = (await request.json()) as AdminRoundRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.id !== 'string') {
    return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  }

  const payload = parsePayload(body);

  if ('error' in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('rounds')
    .update(toRoundUpdate(payload))
    .eq('id', body.id)
    .select('*')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Unable to update round.' }, { status: 500 });
  }

  return NextResponse.json({ round: toAdminRound(data) });
}
