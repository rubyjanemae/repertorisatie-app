/**
 * Repertory Lookup - laadt remedie-data uit de OOREP Repertorium Publicum database.
 * Data wordt per hoofdstuk geladen (lazy loading) en gecacht in geheugen.
 *
 * Bron: OOREP - Open Online Repertory (Repertorium Publicum)
 * Licentie: GPL v3
 * 74.667 rubrieken, 735.500 rubriek-middel koppelingen, 2.432 middelen
 */

// Cache voor geladen hoofdstuk-data
const chapterCache: Map<string, Record<string, string>> = new Map();
const loadingPromises: Map<string, Promise<Record<string, string>>> = new Map();

/**
 * Mapping van sidebar hoofdstuknamen naar OOREP bestandsnamen.
 * De meeste komen overeen, maar sommige hebben een andere naam.
 */
const chapterFileMap: Record<string, string> = {
  'Mind': 'mind',
  'Vertigo': 'vertigo',
  'Head': 'head',
  'Eye': 'eye',
  'Vision': 'vision',
  'Ear': 'ear',
  'Hearing': 'hearing',
  'Nose': 'nose',
  'Face': 'face',
  'Mouth': 'mouth',
  'Teeth': 'teeth',
  'Throat': 'throat',
  'External Throat': 'external-throat',
  'Stomach': 'stomach',
  'Abdomen': 'abdomen',
  'Rectum': 'rectum',
  'Stool': 'stool',
  'Bladder': 'bladder',
  'Kidneys': 'kidneys',
  'Prostate Gland': 'prostate-gland',
  'Urethra': 'urethra',
  'Urine': 'urine',
  'Male Genitalia/Sex': 'genitalia-male',
  'Female Genitalia/Sex': 'genitalia-female',
  'Larynx & Trachea': 'larynx-and-trachea',
  'Respiration': 'respiration',
  'Cough': 'cough',
  'Expectoration': 'expectoration',
  'Chest': 'chest',
  'Back': 'back',
  'Extremities': 'extremities',
  'Sleep': 'sleep',
  'Dreams': 'sleep',  // Dreams zitten onder Sleep in OOREP
  'Chill': 'chill',
  'Fever': 'fever',
  'Perspiration': 'perspiration',
  'Skin': 'skin',
  'Generals': 'generalities',
};

/**
 * Mapping van sidebar hoofdstuknamen naar het OOREP prefix in rubriekpaden.
 * Bijv. "Generals" -> "Generalities" omdat OOREP "Generalities, ..." gebruikt.
 */
const chapterPrefixMap: Record<string, string> = {
  'Male Genitalia/Sex': 'Genitalia male',
  'Female Genitalia/Sex': 'Genitalia female',
  'Larynx & Trachea': 'Larynx and trachea',
  'Respiration': 'Respiration',
  'Dreams': 'Sleep',
  'Generals': 'Generalities',
  'External Throat': 'External throat',
  'Prostate Gland': 'Prostate gland',
};

/**
 * Expliciete mapping voor sidebar-paden die niet automatisch
 * naar het juiste OOREP-pad converteren.
 * Sidebar fullPath → OOREP path
 */
const explicitPathMap: Record<string, string> = {
  // Mind - OOREP gebruikt andere structuur voor sommige rubrieken
  'Mind - Ailments from - anger': 'Mind, anger, ailments after anger, vexation, etc.',
  'Mind - Ailments from - grief': 'Mind, grief, ailments, from',
  'Mind - Ailments from - fright': 'Mind, fright, complaints from',
  'Mind - Confusion of mind': 'Mind, confusion',
  'Mind - Company - aversion to': 'Mind, company aversion to',
  'Mind - Prostration of mind': 'Mind, prostration of mind',
  'Mind - Concentration - difficult': 'Mind, concentration, difficult',

  // Dreams - OOREP gebruikt enkelvoud "nightmare"
  'Dreams - Nightmares': 'Sleep, dreams, nightmare',

  // Head - OOREP gebruikt "pulsating" i.p.v. "throbbing"
  'Head - Pain - throbbing': 'Head, pain, forehead, pulsating',

  // Generals - OOREP heeft andere naamgeving
  'Generals - Night agg': 'Generalities, night',
  'Generals - Morning agg': 'Generalities, morning',
  'Generals - Cold agg': 'Generalities, cold, in general agg.',
  'Generals - Warmth amel': 'Generalities, warm, agg.',
  'Generals - Motion agg': 'Generalities, motion, agg.',
  'Generals - Rest amel': 'Generalities, restlessness',
  'Generals - Sun - exposure to sun': 'Generalities, sun, from exposure to',
  'Generals - Weather - change of, agg': 'Generalities, change of, weather agg.',
  'Generals - Periodicity': 'Generalities, periodicity',
  'Generals - Convulsions': 'Generalities, convulsive movements',
  'Generals - Inflammation': 'Generalities, bones, inflammation of',
};

/**
 * Laad de data van een hoofdstuk. Wordt gecacht na eerste keer laden.
 */
async function loadChapter(chapterFile: string): Promise<Record<string, string>> {
  // Check cache
  if (chapterCache.has(chapterFile)) {
    return chapterCache.get(chapterFile)!;
  }

  // Check of er al een loading promise is (voorkom dubbel laden)
  if (loadingPromises.has(chapterFile)) {
    return loadingPromises.get(chapterFile)!;
  }

  const promise = fetch(`/repertory/${chapterFile}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load ${chapterFile}: ${res.status}`);
      return res.json();
    })
    .then((data: Record<string, string>) => {
      chapterCache.set(chapterFile, data);
      loadingPromises.delete(chapterFile);
      return data;
    })
    .catch(err => {
      loadingPromises.delete(chapterFile);
      console.warn(`Kon hoofdstuk "${chapterFile}" niet laden:`, err);
      return {} as Record<string, string>;
    });

  loadingPromises.set(chapterFile, promise);
  return promise;
}

/**
 * Converteer een sidebar rubriekpad naar het OOREP formaat.
 *
 * Sidebar: "Mind - Anxiety - health, about"
 * OOREP:   "Mind, anxiety, health, about"
 *
 * Sidebar: "Head - Pain"
 * OOREP:   "Head, pain"
 */
function sidebarPathToOorepPath(sidebarPath: string): string {
  // Split op " - " (het scheidingsteken in de sidebar)
  const parts = sidebarPath.split(' - ');

  if (parts.length === 0) return sidebarPath;

  // Eerste deel is het hoofdstuk - check of het een andere OOREP prefix heeft
  const chapter = parts[0];
  const oorepPrefix = chapterPrefixMap[chapter] || chapter;

  // Bouw het OOREP pad: eerste deel = oorepPrefix, rest = lowercase
  const oorepParts = [oorepPrefix];

  // Speciaal geval: Dreams zit onder Sleep > dreams in OOREP
  // "Dreams - Frightful" → "Sleep, dreams, frightful"
  if (chapter === 'Dreams') {
    oorepParts.push('dreams');
  }

  for (let i = 1; i < parts.length; i++) {
    oorepParts.push(parts[i].toLowerCase());
  }

  return oorepParts.join(', ');
}

/**
 * Bepaal het hoofdstuk-bestand vanuit een sidebar rubriekpad.
 */
function getChapterFile(sidebarPath: string): string | null {
  const chapter = sidebarPath.split(' - ')[0];
  return chapterFileMap[chapter] || null;
}

export interface RemedyLookupResult {
  found: boolean;
  rubricPath: string;
  oorepPath: string;
  remedyString: string;
  remedyCount: number;
}

/**
 * Zoek de middelen op voor een rubriek vanuit de sidebar.
 * Geeft het middelenstring terug in het formaat dat parseRemedies() verwacht.
 */
export async function lookupRemedies(sidebarPath: string): Promise<RemedyLookupResult> {
  const chapterFile = getChapterFile(sidebarPath);

  if (!chapterFile) {
    return {
      found: false,
      rubricPath: sidebarPath,
      oorepPath: '',
      remedyString: '',
      remedyCount: 0,
    };
  }

  const data = await loadChapter(chapterFile);

  // Check eerst de expliciete mapping voor bekende afwijkingen
  const explicitOorepPath = explicitPathMap[sidebarPath];
  if (explicitOorepPath && data[explicitOorepPath]) {
    const remedyString = data[explicitOorepPath];
    return {
      found: true,
      rubricPath: sidebarPath,
      oorepPath: explicitOorepPath,
      remedyString,
      remedyCount: remedyString.split(',').length,
    };
  }

  const oorepPath = sidebarPathToOorepPath(sidebarPath);

  // Probeer exacte match
  if (data[oorepPath]) {
    const remedyString = data[oorepPath];
    return {
      found: true,
      rubricPath: sidebarPath,
      oorepPath,
      remedyString,
      remedyCount: remedyString.split(',').length,
    };
  }

  // Probeer case-insensitive match
  const lowerPath = oorepPath.toLowerCase();
  for (const [key, value] of Object.entries(data)) {
    if (key.toLowerCase() === lowerPath) {
      return {
        found: true,
        rubricPath: sidebarPath,
        oorepPath: key,
        remedyString: value,
        remedyCount: value.split(',').length,
      };
    }
  }

  // Probeer zonder trailing spaties/komma's en met varianten
  // Bijv. "Mind - Confusion of mind" kan zijn "Mind, confusion of mind" of "Mind, confusion"
  for (const [key, value] of Object.entries(data)) {
    if (key.toLowerCase().startsWith(lowerPath)) {
      // Exacte prefix match - gebruik deze als de volgende char een komma is of einde
      if (key.length === lowerPath.length || key[lowerPath.length] === ',') {
        return {
          found: true,
          rubricPath: sidebarPath,
          oorepPath: key,
          remedyString: value,
          remedyCount: value.split(',').length,
        };
      }
    }
  }

  return {
    found: false,
    rubricPath: sidebarPath,
    oorepPath,
    remedyString: '',
    remedyCount: 0,
  };
}

/**
 * Zoek rubrieken in een hoofdstuk op basis van een zoekterm.
 * Retourneert alle rubrieken die de zoekterm bevatten, met hun middelen.
 */
export async function searchRubricsInChapter(
  chapterName: string,
  query: string,
  limit = 50
): Promise<Array<{ path: string; remedyCount: number }>> {
  const chapterFile = chapterFileMap[chapterName];
  if (!chapterFile) return [];

  const data = await loadChapter(chapterFile);
  const lowerQuery = query.toLowerCase();
  const results: Array<{ path: string; remedyCount: number }> = [];

  for (const [path, remedyString] of Object.entries(data)) {
    if (path.toLowerCase().includes(lowerQuery)) {
      results.push({
        path,
        remedyCount: remedyString.split(',').length,
      });
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Preload een hoofdstuk-bestand (voor snellere toegang later).
 */
export function preloadChapter(sidebarChapterName: string): void {
  const chapterFile = chapterFileMap[sidebarChapterName];
  if (chapterFile) {
    loadChapter(chapterFile);
  }
}

// ──────────────────────────────────────────
// Autocomplete zoekindex
// ──────────────────────────────────────────

let searchIndex: Record<string, string[]> | null = null;
let searchIndexPromise: Promise<Record<string, string[]>> | null = null;

async function loadSearchIndex(): Promise<Record<string, string[]>> {
  if (searchIndex) return searchIndex;
  if (searchIndexPromise) return searchIndexPromise;

  searchIndexPromise = fetch('/repertory/rubric-search-index.json')
    .then(res => {
      if (!res.ok) throw new Error(`Index laden mislukt: ${res.status}`);
      return res.json();
    })
    .then((data: Record<string, string[]>) => {
      searchIndex = data;
      searchIndexPromise = null;
      return data;
    })
    .catch(err => {
      console.warn('Kon zoekindex niet laden:', err);
      searchIndexPromise = null;
      return {} as Record<string, string[]>;
    });

  return searchIndexPromise;
}

export interface RubricSearchResult {
  oorepPath: string;
  displayPath: string;
  chapterFile: string;
}

/**
 * Reverse mapping: OOREP hoofdstuknamen → sidebar-vriendelijke namen
 */
const reverseChapterNameMap: Record<string, string> = {
  'Genitalia male': 'Male Genitalia/Sex',
  'Genitalia female': 'Female Genitalia/Sex',
  'Larynx and trachea': 'Larynx & Trachea',
  'Generalities': 'Generals',
  'External throat': 'External Throat',
  'Prostate gland': 'Prostate Gland',
};

/**
 * Converteer een OOREP pad naar een leesbaar weergavepad.
 * "Mind, anxiety, about future" → "Mind - Anxiety - About future"
 * "Generalities, morning" → "Generals - Morning"
 */
function oorepPathToDisplayPath(oorepPath: string): string {
  const parts = oorepPath.split(', ');
  return parts.map((p, i) => {
    if (i === 0) return reverseChapterNameMap[p] || p;
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).join(' - ');
}

/**
 * Mapping van sidebar-namen naar OOREP-namen voor zoeken.
 * Zodat "generals" ook "generalities" matcht, etc.
 */
const searchAliases: Record<string, string> = {
  'generals': 'generalities',
  'male genitalia/sex': 'genitalia male',
  'female genitalia/sex': 'genitalia female',
  'larynx & trachea': 'larynx and trachea',
  'external throat': 'external throat',
  'prostate gland': 'prostate gland',
};

/**
 * Zoek rubrieken in de volledige OOREP database.
 * Ondersteunt queries als "anxiety", "Mind - Anx", "head pain", etc.
 */
export async function searchRubrics(query: string, limit = 3): Promise<RubricSearchResult[]> {
  if (query.trim().length < 2) return [];

  const index = await loadSearchIndex();

  // Normaliseer query: "Mind - Anxiety" → "mind anxiety"
  let normalized = query.toLowerCase().replace(/ - /g, ' ').replace(/,/g, ' ').trim();

  // Vervang sidebar-namen door OOREP-namen voor betere matching
  for (const [alias, oorepName] of Object.entries(searchAliases)) {
    if (normalized.includes(alias)) {
      normalized = normalized.replace(alias, oorepName);
    }
  }

  const queryWords = normalized.split(/\s+/).filter(w => w.length > 0);

  if (queryWords.length === 0) return [];

  type Scored = RubricSearchResult & { score: number };
  const results: Scored[] = [];

  // Sorteer hoofdstukken: geef prioriteit aan hoofdstukken
  // waarvan de paden beginnen met het eerste zoekwoord
  const firstWord = queryWords[0];
  const entries = Object.entries(index).sort(([, pathsA], [, pathsB]) => {
    const aStarts = pathsA[0]?.toLowerCase().startsWith(firstWord) ? 1 : 0;
    const bStarts = pathsB[0]?.toLowerCase().startsWith(firstWord) ? 1 : 0;
    return bStarts - aStarts;
  });

  for (const [chapterFile, paths] of entries) {
    for (const path of paths) {
      const lowerPath = path.toLowerCase();
      const flatPath = lowerPath.replace(/,\s*/g, ' ');

      // Alle zoekwoorden moeten voorkomen
      const allMatch = queryWords.every(w => flatPath.includes(w));
      if (!allMatch) continue;

      let score = 0;

      // Starts-with bonus (zoekwoorden in volgorde aan het begin)
      const flatQuery = queryWords.join(' ');
      if (flatPath.startsWith(flatQuery)) score += 100;

      // Bonus als zoekwoorden in volgorde voorkomen (niet per se aan begin)
      const orderRegex = new RegExp(queryWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*'));
      if (orderRegex.test(flatPath)) score += 30;

      // Positie-bonus: hoe eerder de zoekwoorden voorkomen, hoe beter
      const levels = lowerPath.split(', ');
      for (const qw of queryWords) {
        const levelIdx = levels.findIndex(l => l.includes(qw));
        if (levelIdx === 0) score += 25; // in hoofdstuknaam
        else if (levelIdx === 1) score += 15; // in eerste subniveau
        else if (levelIdx >= 0) score += 5; // in dieper niveau
      }

      // Diepte-penalty (geef voorkeur aan korte paden)
      score -= levels.length * 6;

      // Lengte-penalty
      score -= path.length * 0.05;

      // Exacte woord-match bonus
      const pathWords = flatPath.split(/\s+/);
      for (const qw of queryWords) {
        if (pathWords.some(pw => pw === qw)) score += 10;
        else if (pathWords.some(pw => pw.startsWith(qw))) score += 5;
      }

      results.push({
        oorepPath: path,
        displayPath: oorepPathToDisplayPath(path),
        chapterFile,
        score,
      });
    }
  }

  results.sort((a, b) => b.score - a.score || a.oorepPath.localeCompare(b.oorepPath));
  return results.slice(0, limit);
}

/**
 * Directe lookup van middelen voor een bekende OOREP path en chapterFile.
 * Gebruik dit wanneer je het exacte pad al kent (bijv. vanuit zoekresultaten).
 */
export async function lookupRemediesDirect(oorepPath: string, chapterFile: string): Promise<string> {
  const data = await loadChapter(chapterFile);
  return data[oorepPath] || '';
}
