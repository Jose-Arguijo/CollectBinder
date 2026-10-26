import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars. Check .env for EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export type Collection = {
  id: string;
  name: string;
  icon: string;
  color: string;
  parent_id: string | null;
  created_at: string;
};

export type Card = {
  id: string;
  collection_id: string;
  name: string;
  set_name: string;
  card_number: string;
  condition: string;
  quantity: number;
  value: number;
  notes: string;
  photo_url: string | null;
  created_at: string;
};

export type CollectionWithStats = Collection & {
  cardCount: number;
  totalValue: number;
  childCollections: CollectionWithStats[];
};
