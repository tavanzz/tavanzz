import { NextResponse } from 'next/server';
import { toPublicRound } from '@/lib/rounds';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { RoundRow } from '@/lib/supabaseClient';

function isCurrentPngRoundImage(imageUrl: string) {
  const normalizedImageUrl = imageUrl.toLowerCase();

  return (
    normalizedImageUrl.endsWith('.png') &&
    !normalizedImageUrl.includes('picsum') &&
    !normalizedImageUrl.includes('placeholder') &&
    !normalizedImageUrl.includes('.svg') &&
    !normalizedImageUrl.includes('.jpg') &&
    !normalizedImageUrl.includes('/rounds/round-')
  );
}

export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('rounds').select('id,image_url').eq('approved', true).eq('status', 'approved');

  if (error) {
    return NextResponse.json({ error: 'Unable to load rounds.' }, { status: 500 });
  }

  const validRounds = ((data ?? []) as Pick<RoundRow, 'id' | 'image_url'>[]).filter(
    (round) => typeof round.id === 'string' && round.id.trim().length > 0 && isCurrentPngRoundImage(round.image_url),
  );

  if (validRounds.length === 0) {
    return NextResponse.json({ error: 'No approved PNG rounds available.' }, { status: 404 });
  }

  const round = validRounds[Math.floor(Math.random() * validRounds.length)];

  return NextResponse.json({ round: toPublicRound(round) });
}
