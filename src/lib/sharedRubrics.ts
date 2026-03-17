import { getSupabase } from './supabase';
import { parseRemedies } from './parseRemedies';

export interface SharedRubric {
  id: string;
  name: string;
  remedy_string: string;
  remedy_count: number;
  contributor: string;
  created_at: string;
}

/**
 * Haal gedeelde rubrieken op uit Supabase.
 * Optioneel filteren op zoekterm.
 */
export async function fetchSharedRubrics(search?: string): Promise<SharedRubric[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from('shared_rubrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (search && search.trim().length >= 2) {
    query = query.ilike('name', `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.warn('Kon gedeelde rubrieken niet ophalen:', error.message);
    return [];
  }

  return data || [];
}

/**
 * Deel een rubriek met de community.
 * Upsert: als de rubrieknaam al bestaat, wordt deze bijgewerkt.
 */
export async function shareRubric(
  name: string,
  remedyString: string,
  contributor: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase niet beschikbaar' };
  }

  const remedyCount = parseRemedies(remedyString).length;

  const { error } = await supabase
    .from('shared_rubrics')
    .upsert(
      {
        name: name.trim(),
        remedy_string: remedyString.trim(),
        remedy_count: remedyCount,
        contributor: contributor.trim() || 'Anoniem',
      },
      { onConflict: 'name' }
    );

  if (error) {
    console.warn('Kon rubriek niet delen:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Tel het aantal gedeelde rubrieken.
 */
export async function countSharedRubrics(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from('shared_rubrics')
    .select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count || 0;
}
