import type { RoundInsert, RoundRow, RoundSourceType, RoundStatus, RoundUpdate } from '@/lib/supabaseClient';

export type PublicRound = {
  id: string;
  imageUrl: string;
};

export type RoundResult = {
  locationName: string;
  country: string | null;
  latitude: number;
  longitude: number;
  year: number;
  explanation: string | null;
  geoClues: string | null;
  timeClues: string | null;
  validationNotes: string | null;
  difficulty: number;
};

export type AdminRound = {
  id: string;
  locationName: string;
  country: string;
  latitude: number;
  longitude: number;
  year: number;
  imageUrl: string;
  explanation: string;
  geoClues: string;
  timeClues: string;
  validationNotes: string;
  status: RoundStatus;
  sourceType: RoundSourceType;
  difficulty: number;
  approved: boolean;
  createdAt: string;
};

export type RoundFormPayload = {
  locationName: string;
  country: string;
  latitude: number;
  longitude: number;
  year: number;
  imageUrl: string;
  explanation: string;
  geoClues: string;
  timeClues: string;
  validationNotes: string;
  status: RoundStatus;
  sourceType: RoundSourceType;
  difficulty: number;
  approved: boolean;
};

export const roundStatuses: RoundStatus[] = ['draft', 'approved', 'rejected'];
export const roundSourceTypes: RoundSourceType[] = ['manual', 'ai', 'archive'];

export function toPublicRound(row: Pick<RoundRow, 'id' | 'image_url'>): PublicRound {
  return {
    id: row.id,
    imageUrl: row.image_url,
  };
}

export function toRoundResult(row: RoundRow): RoundResult {
  return {
    locationName: row.location_name,
    country: row.country,
    latitude: row.lat,
    longitude: row.lng,
    year: row.year,
    explanation: row.explanation,
    geoClues: row.geo_clues,
    timeClues: row.time_clues,
    validationNotes: row.validation_notes,
    difficulty: row.difficulty,
  };
}

export function toAdminRound(row: RoundRow): AdminRound {
  return {
    id: row.id,
    locationName: row.location_name,
    country: row.country ?? '',
    latitude: row.lat,
    longitude: row.lng,
    year: row.year,
    imageUrl: row.image_url,
    explanation: row.explanation ?? '',
    geoClues: row.geo_clues ?? '',
    timeClues: row.time_clues ?? '',
    validationNotes: row.validation_notes ?? '',
    status: row.status,
    sourceType: row.source_type,
    difficulty: row.difficulty,
    approved: row.approved,
    createdAt: row.created_at,
  };
}

export function toRoundInsert(payload: RoundFormPayload): RoundInsert {
  const status = payload.approved ? 'approved' : payload.status;

  return {
    location_name: payload.locationName.trim(),
    country: payload.country.trim() || null,
    lat: payload.latitude,
    lng: payload.longitude,
    year: payload.year,
    image_url: payload.imageUrl.trim(),
    explanation: payload.explanation.trim() || null,
    geo_clues: payload.geoClues.trim() || null,
    time_clues: payload.timeClues.trim() || null,
    validation_notes: payload.validationNotes.trim() || null,
    status,
    source_type: payload.sourceType,
    difficulty: payload.difficulty,
    approved: status === 'approved',
  };
}

export function toRoundUpdate(payload: RoundFormPayload): RoundUpdate {
  return toRoundInsert(payload);
}
