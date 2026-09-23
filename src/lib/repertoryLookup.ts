/**
 * Repertory Lookup - laadt remedie-data uit de OOREP repertoria.
 * Data wordt per hoofdstuk geladen (lazy loading) en gecacht in geheugen.
 *
 * Bron: OOREP - Open Online Repertory, licentie GPL v3
 * - Repertorium Publicum: public/repertory/*.json
 *   74.667 rubrieken, 735.500 rubriek-middel koppelingen, 2.432 middelen
 * - Kents Repertorium (Duitse vertaling): public/repertory/kent-de/*.json
 *   68.120 rubrieken, 619.730 rubriek-middel koppelingen
 *   (gegenereerd met scripts/build-kent-de.mjs)
 *
 * Een chapterFile met submap ("kent-de/gemuet") wijst naar het Kent-repertorium;
 * zonder submap ("mind") naar het Publicum.
 */

import { RepertoryId, repertoryOfChapterFile } from './repertoryData';

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

// Zoekindex per repertorium: { chapterFile: [paden] }
const searchIndexFiles: Record<RepertoryId, string> = {
  'publicum': '/repertory/rubric-search-index.json',
  'kent-de': '/repertory/kent-de/rubric-search-index.json',
};
const searchIndexes = new Map<RepertoryId, Promise<Record<string, string[]>>>();

function loadSearchIndex(repertory: RepertoryId): Promise<Record<string, string[]>> {
  const cached = searchIndexes.get(repertory);
  if (cached) return cached;

  const promise = fetch(searchIndexFiles[repertory])
    .then(res => {
      if (!res.ok) throw new Error(`Index laden mislukt: ${res.status}`);
      return res.json() as Promise<Record<string, string[]>>;
    })
    .catch(err => {
      console.warn(`Kon zoekindex "${repertory}" niet laden:`, err);
      searchIndexes.delete(repertory); // volgende keer opnieuw proberen
      return {} as Record<string, string[]>;
    });

  searchIndexes.set(repertory, promise);
  return promise;
}

export interface RubricSearchResult {
  oorepPath: string;
  displayPath: string;
  chapterFile: string;
  repertory: RepertoryId;
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
 * Verwijder accenten en umlauts voor zoeken, zodat "gemut" ook "Gemüt" vindt.
 * Alleen paden met niet-ASCII tekens worden omgezet (snel voor Engelse paden).
 */
function foldDiacritics(text: string): string {
  if (!/[^\x00-\x7f]/.test(text)) return text;
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
}

/**
 * Zoek rubrieken in de OOREP repertoria.
 * Ondersteunt queries als "anxiety", "Mind - Anx", "head pain", "Angst", etc.
 * Zonder `repertories` wordt in alle repertoria gezocht.
 */
export async function searchRubrics(
  query: string,
  limit = 3,
  repertories: RepertoryId[] = ['publicum', 'kent-de'],
): Promise<RubricSearchResult[]> {
  if (query.trim().length < 2) return [];

  const loaded = await Promise.all(repertories.map(loadSearchIndex));
  const index: Record<string, string[]> = Object.assign({}, ...loaded);

  // Normaliseer query: "Mind - Anxiety" → "mind anxiety", "Übelkeit" → "ubelkeit"
  let normalized = foldDiacritics(query.toLowerCase()).replace(/ - /g, ' ').replace(/,/g, ' ').trim();

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
      const lowerPath = foldDiacritics(path.toLowerCase());
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
        repertory: repertoryOfChapterFile(chapterFile),
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

// ──────────────────────────────────────────
// Tree-navigatie helpers (voor de sidebar)
// ──────────────────────────────────────────

export interface TreeNode {
  oorepPath: string;        // "Mind, anxiety"
  chapterFile: string;      // "mind"
  displayName: string;      // "Anxiety" (het laatste segment, Title Case)
  displayPath: string;      // "Mind - Anxiety" (sidebar-style volledige pad)
  ownCount: number;         // aantal middelen in deze rubriek zelf (0 als virtual parent)
  childCount: number;       // aantal directe kind-rubrieken in OOREP
  hasOwnEntry: boolean;     // false = virtual parent (geen eigen rubriek-entry)
}

/**
 * Tel het aantal middelen in een rubriek-waarde.
 * OOREP gebruikt komma-gescheiden lijst; splitsen en niet-lege items tellen.
 */
export function countOwnRemedies(remedyString: string): number {
  if (!remedyString) return 0;
  return remedyString.split(',').map(s => s.trim()).filter(s => s.length > 0).length;
}

/**
 * Geef de directe kinderen van een OOREP-pad binnen een hoofdstuk.
 * Als `parentPath` null is: geef de rubrieken op niveau 2 (direct onder het hoofdstuk).
 *
 * Virtual parents: als een intermediair pad niet zelf bestaat (bv. "Mind, absent-minded"
 * ontbreekt maar "Mind, absent-minded, morning" bestaat), wordt dat pad alsnog als
 * knoop opgenomen met `hasOwnEntry: false`.
 */
export async function getDirectChildren(
  chapterFile: string,
  parentPath: string | null,
): Promise<TreeNode[]> {
  const data = await loadChapter(chapterFile);

  // Alle keys van dit hoofdstuk; we werken met de letterlijke OOREP-paden.
  const keys = Object.keys(data);
  const nodes = new Map<string, TreeNode>();

  const parentDepth = parentPath ? parentPath.split(', ').length : 1;
  const prefix = parentPath ? parentPath + ', ' : '';

  for (const key of keys) {
    // Alleen paden die onder de parent vallen
    if (parentPath) {
      if (!key.startsWith(prefix)) continue;
    } else {
      // Top-level: het hoofdstuk zelf overslaan, alleen diepere paden
      if (key.split(', ').length < 2) continue;
    }

    const segments = key.split(', ');
    // Pad tot en met het volgende niveau na de parent
    const childDepth = parentDepth + 1;
    if (segments.length < childDepth) continue;

    const childPath = segments.slice(0, childDepth).join(', ');
    if (!nodes.has(childPath)) {
      const ownValue = data[childPath];
      nodes.set(childPath, {
        oorepPath: childPath,
        chapterFile,
        displayName: segments[childDepth - 1],
        displayPath: oorepPathToDisplayPath(childPath),
        ownCount: ownValue ? countOwnRemedies(ownValue) : 0,
        childCount: 0,
        hasOwnEntry: !!ownValue,
      });
    }

    // Als dit pad een descendant is van de child, verhoog childCount op de child
    if (segments.length > childDepth) {
      const node = nodes.get(childPath)!;
      // Alleen unieke directe kinderen tellen
      const directChildPath = segments.slice(0, childDepth + 1).join(', ');
      // Gebruik een Set via closure — simplist: stockeer uniek-setje in een side-map
      (node as TreeNode & { _kids?: Set<string> })._kids ??= new Set<string>();
      (node as TreeNode & { _kids?: Set<string> })._kids!.add(directChildPath);
    }
  }

  // Finaliseer childCount en ruim _kids op
  const out: TreeNode[] = [];
  for (const node of nodes.values()) {
    const withKids = node as TreeNode & { _kids?: Set<string> };
    node.childCount = withKids._kids ? withKids._kids.size : 0;
    delete withKids._kids;
    out.push(node);
  }

  // Alfabetisch sorteren op laatste segment
  out.sort((a, b) => a.displayName.localeCompare(b.displayName));
  return out;
}

/**
 * Publieke versie van oorepPathToDisplayPath voor UI-componenten.
 */
export function oorepToDisplayPath(oorepPath: string): string {
  return oorepPathToDisplayPath(oorepPath);
}
