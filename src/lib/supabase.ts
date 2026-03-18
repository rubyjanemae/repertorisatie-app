import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Geeft een Supabase client terug (singleton).
 * Retourneert null als de env vars niet ingesteld zijn.
 */
export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('jouw-project') || key.includes('jouw-anon-key')) {
    // Env vars niet ingesteld — Supabase is niet beschikbaar
    return null;
  }

  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (err) {
    console.warn('Supabase client kon niet aangemaakt worden:', err);
    return null;
  }
}

/** Check of Supabase beschikbaar is */
export function isSupabaseAvailable(): boolean {
  return getSupabase() !== null;
}
