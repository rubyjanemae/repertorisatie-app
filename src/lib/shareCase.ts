/**
 * Deel- en importfuncties voor casussen
 * Comprimeert een casus naar een URL-veilige string en vice versa
 */

import { Case, Rubric, Remedy } from './types';

// Compact formaat: strip IDs en timestamps, gebruik korte keys
interface CompactRemedy {
  n: string;   // displayName
  g: 1 | 2 | 3 | 4; // grade
}

interface CompactRubric {
  n: string;   // name
  r: CompactRemedy[];
}

interface CompactCase {
  v: 1;        // versie
  n: string;   // name
  rs: CompactRubric[];
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Comprimeer een Case naar een compact JSON-string
 */
function compactifyCase(c: Case): CompactCase {
  return {
    v: 1,
    n: c.name,
    rs: c.rubrics.map(r => ({
      n: r.name,
      r: r.remedies.map(rem => ({
        n: rem.displayName,
        g: rem.grade,
      })),
    })),
  };
}

/**
 * Herstel een volledige Case uit compact formaat
 */
function expandCase(compact: CompactCase): Case {
  const now = Date.now();
  return {
    id: generateId(),
    name: compact.n,
    rubrics: compact.rs.map(r => ({
      id: generateId(),
      name: r.n,
      remedies: r.r.map(rem => ({
        name: rem.n.toLowerCase().replace(/[^a-z-]/g, ''),
        displayName: rem.n,
        grade: rem.g,
      })),
      createdAt: now,
    })),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Encodeer een casus naar een URL-veilige string
 */
function encodeCase(c: Case): string {
  const compact = compactifyCase(c);
  const json = JSON.stringify(compact);
  // Base64 encode en maak URL-veilig
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodeer een URL-veilige string terug naar een Case
 */
function decodeCase(encoded: string): Case | null {
  try {
    // Herstel standaard base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Voeg padding toe
    while (base64.length % 4) base64 += '=';
    const json = decodeURIComponent(escape(atob(base64)));
    const compact: CompactCase = JSON.parse(json);
    if (compact.v !== 1 || !compact.n || !Array.isArray(compact.rs)) {
      return null;
    }
    return expandCase(compact);
  } catch (e) {
    console.warn('Kon gedeelde casus niet decoderen:', e);
    return null;
  }
}

/**
 * Genereer een deelbare URL voor een casus
 * Retourneert de URL of null als de casus te groot is (>8000 chars)
 */
export function generateShareUrl(c: Case): { url: string; tooLarge: false } | { json: string; tooLarge: true } {
  const encoded = encodeCase(c);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${baseUrl}?deel=${encoded}`;

  if (url.length > 8000) {
    // Te groot voor URL, geef JSON terug voor clipboard
    const compact = compactifyCase(c);
    return { json: JSON.stringify(compact), tooLarge: true };
  }

  return { url, tooLarge: false };
}

/**
 * Check of de huidige URL een gedeelde casus bevat
 */
export function checkForSharedCase(): Case | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('deel');
  if (!encoded) return null;
  return decodeCase(encoded);
}

/**
 * Verwijder de deel-parameter uit de URL (na import)
 */
export function clearShareParam() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('deel');
  window.history.replaceState({}, '', url.pathname);
}

/**
 * Importeer een casus vanuit een JSON-string (clipboard import)
 */
export function importCaseFromJson(json: string): Case | null {
  try {
    const compact: CompactCase = JSON.parse(json);
    if (compact.v !== 1 || !compact.n || !Array.isArray(compact.rs)) {
      return null;
    }
    return expandCase(compact);
  } catch {
    return null;
  }
}
