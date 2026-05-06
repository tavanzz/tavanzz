import { NextResponse } from 'next/server';
import { toPublicRound } from '@/lib/rounds';
import { getSupabaseClient } from '@/lib/supabaseClient';

export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('rounds').select('id,image_url').eq('approved', true).eq('status', 'approved');

  if (error) {
    return NextResponse.json({ error: 'Unable to load rounds.' }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'No approved rounds available.' }, { status: 404 });
  }

  const round = data[Math.floor(Math.random() * data.length)];

  return NextResponse.json({ round: toPublicRound(round) });
}
