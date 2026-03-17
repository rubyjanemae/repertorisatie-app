import { Remedy } from './types';

/**
 * Parse een string met middelen naar Remedy objecten.
 *
 * Regels:
 * - kleine letters (acon) = waardering 1
 * - Eerste letter hoofdletter (Acon) = waardering 2
 * - ALLES HOOFDLETTERS (ACON) = waardering 3
 * - naam (4) erachter = waardering 4
 *
 * Middelen gescheiden door komma's, punten, of spaties
 */
export function parseRemedies(input: string): Remedy[] {
  if (!input.trim()) return [];

  // Normaliseer scheidingstekens: vervang punten en komma's door komma's
  // maar bewaar punten die onderdeel zijn van middelnamen (bijv. "arg-n.")
  let normalized = input
    .replace(/\.\s/g, ', ')  // punt-spatie wordt komma
    .replace(/,\s*/g, ', ')  // normaliseer komma's
    .replace(/\s{2,}/g, ' ') // dubbele spaties
    .trim();

  // Verwijder trailing punt
  if (normalized.endsWith('.')) {
    normalized = normalized.slice(0, -1);
  }

  // Split op komma's
  const parts = normalized.split(',').map(p => p.trim()).filter(Boolean);

  const remedies: Remedy[] = [];

  for (const part of parts) {
    if (!part) continue;

    // Check voor (4) waardering
    const gradeMatch = part.match(/^(.+?)\s*\((\d)\)\s*$/);
    let name: string;
    let explicitGrade: number | null = null;

    if (gradeMatch) {
      name = gradeMatch[1].trim();
      explicitGrade = parseInt(gradeMatch[2]);
    } else {
      name = part.trim();
    }

    // Verwijder trailing punt van naam
    name = name.replace(/\.$/, '');

    if (!name) continue;

    // Bepaal waardering op basis van hoofdletters
    let grade: 1 | 2 | 3 | 4;

    if (explicitGrade && explicitGrade >= 1 && explicitGrade <= 4) {
      grade = explicitGrade as 1 | 2 | 3 | 4;
    } else if (isAllUpperCase(name)) {
      grade = 3;
    } else if (isFirstLetterUpperCase(name)) {
      grade = 2;
    } else {
      grade = 1;
    }

    const canonical = name.toLowerCase().trim();

    // Filter ongeldige entries
    if (canonical.length === 0 || canonical.length > 30) continue;

    remedies.push({
      name: canonical,
      displayName: name,
      grade,
    });
  }

  return remedies;
}

/**
 * Check of alle letters in de string hoofdletters zijn.
 * Negeert niet-letter tekens (-, cijfers, etc.)
 */
function isAllUpperCase(str: string): boolean {
  const letters = str.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return false;
  return letters === letters.toUpperCase();
}

/**
 * Check of de eerste letter een hoofdletter is (maar niet alles).
 */
function isFirstLetterUpperCase(str: string): boolean {
  const firstLetter = str.match(/[a-zA-Z]/);
  if (!firstLetter) return false;
  return firstLetter[0] === firstLetter[0].toUpperCase() && !isAllUpperCase(str);
}

/**
 * Format een grade als visuele indicator
 */
export function gradeToDisplay(grade: number): string {
  switch (grade) {
    case 1: return '①';
    case 2: return '②';
    case 3: return '③';
    case 4: return '④';
    default: return String(grade);
  }
}

/**
 * Grade kleuren voor de UI
 */
export function gradeColor(grade: number): string {
  switch (grade) {
    case 1: return 'text-grade-1';
    case 2: return 'text-grade-2 font-medium';
    case 3: return 'text-grade-3 font-bold';
    case 4: return 'text-grade-4 font-extrabold';
    default: return 'text-warm-text-muted';
  }
}

export function gradeBgColor(grade: number): string {
  switch (grade) {
    case 1: return 'bg-grade-1-bg text-grade-1';
    case 2: return 'bg-grade-2-bg text-grade-2';
    case 3: return 'bg-grade-3-bg text-grade-3';
    case 4: return 'bg-grade-4-bg text-grade-4';
    default: return 'bg-parchment text-warm-text-muted';
  }
}

/**
 * Formatteer een Remedy terug naar de tekstvorm die parseRemedies() snapt.
 * Grade 1 = lowercase, Grade 2 = Capitalized, Grade 3 = UPPERCASE, Grade 4 = UPPERCASE (4)
 */
function remedyToString(remedy: Remedy): string {
  const base = remedy.displayName.replace(/\.$/, '');
  switch (remedy.grade) {
    case 1: return base.toLowerCase();
    case 2: return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
    case 3: return base.toUpperCase();
    case 4: return `${base.toUpperCase()} (4)`;
    default: return base;
  }
}

export interface MergeResult {
  merged: string;           // Samengevoegde remedie-string
  totalCount: number;       // Totaal middelen na merge
  addedCount: number;       // Nieuw toegevoegd vanuit bron B
  upgradedCount: number;    // Graad verhoogd door bron B
  unchangedCount: number;   // Ongewijzigd (al aanwezig met gelijke of hogere graad)
  added: Remedy[];          // De specifieke middelen die nieuw zijn
  upgraded: Array<{ remedy: Remedy; oldGrade: number; newGrade: number }>;
}

/**
 * Voeg twee remedie-strings samen.
 * - Dubbele middelen: hoogste graad wint.
 * - Alleen nieuwe middelen of hogere graden worden overgenomen.
 * - Resultaat is gesorteerd op graad (hoog→laag), dan alfabetisch.
 *
 * @param existing - De huidige remedie-string (bijv. uit OOREP)
 * @param extra    - Extra remedie-string (bijv. uit Synthesis)
 */
export function mergeRemedyStrings(existing: string, extra: string): MergeResult {
  const existingRemedies = parseRemedies(existing);
  const extraRemedies = parseRemedies(extra);

  // Bouw een map van canonical name → Remedy (met hoogste grade)
  const merged = new Map<string, Remedy>();
  for (const r of existingRemedies) {
    merged.set(r.name, r);
  }

  let addedCount = 0;
  let upgradedCount = 0;
  const added: Remedy[] = [];
  const upgraded: Array<{ remedy: Remedy; oldGrade: number; newGrade: number }> = [];

  for (const r of extraRemedies) {
    const existing = merged.get(r.name);
    if (!existing) {
      // Nieuw middel → toevoegen
      merged.set(r.name, r);
      addedCount++;
      added.push(r);
    } else if (r.grade > existing.grade) {
      // Hogere graad → upgrade
      const oldGrade = existing.grade;
      merged.set(r.name, { ...r, displayName: existing.displayName });
      upgradedCount++;
      upgraded.push({ remedy: r, oldGrade, newGrade: r.grade });
    }
    // Anders: al aanwezig met gelijke of hogere graad → niks doen
  }

  const unchangedCount = existingRemedies.length - upgradedCount;

  // Sorteer: hoogste grade eerst, dan alfabetisch
  const sortedRemedies = Array.from(merged.values()).sort((a, b) => {
    if (b.grade !== a.grade) return b.grade - a.grade;
    return a.name.localeCompare(b.name);
  });

  // Formatteer terug naar string
  const mergedString = sortedRemedies.map(r => remedyToString(r)).join(', ');

  return {
    merged: mergedString,
    totalCount: sortedRemedies.length,
    addedCount,
    upgradedCount,
    unchangedCount,
    added,
    upgraded,
  };
}
