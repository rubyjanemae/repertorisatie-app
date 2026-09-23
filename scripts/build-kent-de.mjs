#!/usr/bin/env node
/**
 * Bouwt public/repertory/kent-de/ uit de OOREP database-dump.
 *
 * Bron: Kents Repertorium [deutsch], vertaling door Bildungswerk für
 * therapeutische Berufe / Joscha Körschgen, GPL v3 (via OOREP).
 * https://github.com/nondeterministic/oorep  (bestand: oorep.sql.gz)
 *
 * Gebruik:
 *   curl -L -o oorep.sql.gz https://github.com/nondeterministic/oorep/raw/master/oorep.sql.gz
 *   node scripts/build-kent-de.mjs oorep.sql.gz
 *
 * Uitvoerformaat is gelijk aan de Publicum-bestanden: per hoofdstuk één JSON
 * { "Volledig, pad": "MIDDEL3, Middel2, middel1" } — hoofdletters coderen de graad
 * (zie src/lib/parseRemedies.ts).
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import readline from 'node:readline';
import { PassThrough } from 'node:stream';
import { fileURLToPath } from 'node:url';

const REPERTORY = 'kent-de';
const input = process.argv[2];
if (!input) {
  console.error('Gebruik: node scripts/build-kent-de.mjs <pad/naar/oorep.sql.gz>');
  process.exit(1);
}

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'repertory', REPERTORY);

// PostgreSQL COPY-tekstformaat: \N = NULL, backslash-escapes
function unescape(field) {
  if (field === '\\N') return null;
  return field.replace(/\\(.)/g, (_, c) => ({ t: '\t', n: '\n', r: '\r', '\\': '\\' }[c] ?? c));
}

// "Gemüt" → "gemuet", "Hals-Außenseite" → "hals-aussenseite"
function slug(name) {
  return name
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/Ä/g, 'ae').replace(/Ö/g, 'oe').replace(/Ü/g, 'ue').replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Graad → schrijfwijze volgens de conventie van parseRemedies
function formatRemedy(abbrev, grade) {
  const base = abbrev.replace(/\.$/, '').toLowerCase();
  if (grade >= 3) return base.toUpperCase();
  if (grade === 2) return base.charAt(0).toUpperCase() + base.slice(1);
  return base;
}

const remedies = new Map();     // remedyId → afkorting
const rubrics = new Map();      // rubricId → volledig pad
const rubricRemedies = [];      // [rubricId, remedyId, graad]

let table = null;
const rl = readline.createInterface({
  input: fs.createReadStream(input).pipe(input.endsWith('.gz') ? zlib.createGunzip() : new PassThrough()),
  crlfDelay: Infinity,
});

for await (const line of rl) {
  if (table === null) {
    const m = line.match(/^COPY public\.(\w+) /);
    if (m && ['remedy', 'rubric', 'rubricremedy'].includes(m[1])) table = m[1];
    continue;
  }
  if (line === '\\.') { table = null; continue; }

  const f = line.split('\t').map(unescape);
  if (table === 'remedy') {
    // (id, nameabbrev, namelong, namealt)
    remedies.set(f[0], f[1]);
  } else if (table === 'rubric' && f[0] === REPERTORY) {
    // (abbrev, id, mother, ismother, chapterid, fullpath, path, textt)
    if (f[5]) rubrics.set(f[1], f[5].trim());
  } else if (table === 'rubricremedy' && f[0] === REPERTORY) {
    // (abbrev, rubricid, remedyid, weight, chapterid)
    rubricRemedies.push([f[1], f[2], Number(f[3])]);
  }
}

// Middelen per pad verzamelen; bij dubbele paden telt de hoogste graad
const byPath = new Map();       // pad → Map(afkorting → graad)
for (const [rubricId, remedyId, grade] of rubricRemedies) {
  const fullPath = rubrics.get(rubricId);
  const abbrev = remedies.get(remedyId);
  if (!fullPath || !abbrev || !(grade > 0)) continue;
  if (!byPath.has(fullPath)) byPath.set(fullPath, new Map());
  const m = byPath.get(fullPath);
  m.set(abbrev, Math.max(m.get(abbrev) ?? 0, grade));
}

// Per hoofdstuk (eerste padsegment) wegschrijven
const chapters = new Map();     // hoofdstuknaam → { pad: middelenstring }
for (const [fullPath, rems] of byPath) {
  const chapter = fullPath.split(', ')[0];
  const sorted = [...rems.entries()].sort(
    ([a, ga], [b, gb]) => gb - ga || a.toLowerCase().localeCompare(b.toLowerCase())
  );
  if (!chapters.has(chapter)) chapters.set(chapter, {});
  chapters.get(chapter)[fullPath] = sorted.map(([a, g]) => formatRemedy(a, g)).join(', ');
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const index = {};
const searchIndex = {};
let totalRubrics = 0;
let totalEntries = 0;

for (const [chapter, data] of [...chapters.entries()].sort(([a], [b]) => a.localeCompare(b, 'de'))) {
  const file = slug(chapter);
  const sortedData = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b, 'de')));
  const json = JSON.stringify(sortedData);
  fs.writeFileSync(path.join(outDir, `${file}.json`), json);

  const count = Object.keys(sortedData).length;
  totalRubrics += count;
  totalEntries += Object.values(sortedData).reduce((n, s) => n + s.split(', ').length, 0);
  index[chapter] = { file: `${file}.json`, rubricCount: count, sizeKB: Math.round(json.length / 102.4) / 10 };
  // Sleutel = chapterFile zoals de app die gebruikt (inclusief map-prefix)
  searchIndex[`${REPERTORY}/${file}`] = Object.keys(sortedData);
}

fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'rubric-search-index.json'), JSON.stringify(searchIndex));

console.log(`Kent (deutsch): ${chapters.size} hoofdstukken, ${totalRubrics} rubrieken, ${totalEntries} middelvermeldingen → ${outDir}`);
