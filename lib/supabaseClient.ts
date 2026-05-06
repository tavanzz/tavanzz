import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type RoundRow = {
  id: string;
  location_name: string;
  country: string | null;
  lat: number;
  lng: number;
  year: number;
  image_url: string;
  explanation: string | null;
  difficulty: number;
  approved: boolean;
  created_at: string;
};

export type RoundInsert = {
  id?: string;
  location_name: string;
  country?: string | null;
  lat: number;
  lng: number;
  year: number;
  image_url: string;
  explanation?: string | null;
  difficulty?: number;
  approved?: boolean;
  created_at?: string;
};

export type RoundUpdate = Partial<Omit<RoundInsert, 'id' | 'created_at'>>;

type Database = {
  public: {
    Tables: {
      rounds: {
        Row: RoundRow;
        Insert: RoundInsert;
        Update: RoundUpdate;
      };
    };
  };
};

let cachedClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  cachedClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
