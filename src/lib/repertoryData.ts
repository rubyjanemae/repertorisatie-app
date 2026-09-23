// Repertorium metadata — hoofdstuk-definities voor de sidebar.
// De rubriek-data zelf komt uit public/repertory/*.json (OOREP) en wordt
// on-demand geladen via repertoryLookup.ts.

export interface RepertoryChapter {
  name: string;         // Sidebar-label, bijv. "Mind"
  nameDutch: string;    // Nederlandse naam voor weergave
  icon: string;         // Emoji
  chapterFile: string;  // Bestandsnaam zonder .json in public/repertory/
  rootPath: string;     // OOREP-pad dat als wortel van dit hoofdstuk geldt
                        // (meestal gelijk aan name, maar bijv. "Sleep, dreams"
                        // voor het Dreams-hoofdstuk, "Generalities" voor Generals)
}

export const repertoryChapters: RepertoryChapter[] = [
  { name: 'Mind',                 nameDutch: 'Gemoed',                     icon: '🧠', chapterFile: 'mind',                rootPath: 'Mind' },
  { name: 'Vertigo',              nameDutch: 'Duizeligheid',               icon: '💫', chapterFile: 'vertigo',             rootPath: 'Vertigo' },
  { name: 'Head',                 nameDutch: 'Hoofd',                      icon: '🗣️', chapterFile: 'head',                rootPath: 'Head' },
  { name: 'Eye',                  nameDutch: 'Oog',                        icon: '👁️', chapterFile: 'eye',                 rootPath: 'Eye' },
  { name: 'Vision',               nameDutch: 'Gezichtsvermogen',           icon: '🔍', chapterFile: 'vision',              rootPath: 'Vision' },
  { name: 'Ear',                  nameDutch: 'Oor',                        icon: '👂', chapterFile: 'ear',                 rootPath: 'Ear' },
  { name: 'Hearing',              nameDutch: 'Gehoor',                     icon: '🔊', chapterFile: 'hearing',             rootPath: 'Hearing' },
  { name: 'Nose',                 nameDutch: 'Neus',                       icon: '👃', chapterFile: 'nose',                rootPath: 'Nose' },
  { name: 'Face',                 nameDutch: 'Gezicht',                    icon: '😶', chapterFile: 'face',                rootPath: 'Face' },
  { name: 'Mouth',                nameDutch: 'Mond',                       icon: '👄', chapterFile: 'mouth',               rootPath: 'Mouth' },
  { name: 'Teeth',                nameDutch: 'Tanden',                     icon: '🦷', chapterFile: 'teeth',               rootPath: 'Teeth' },
  { name: 'Throat',               nameDutch: 'Keel',                       icon: '🫁', chapterFile: 'throat',              rootPath: 'Throat' },
  { name: 'External Throat',      nameDutch: 'Uitwendige keel',            icon: '🔗', chapterFile: 'external-throat',     rootPath: 'External throat' },
  { name: 'Stomach',              nameDutch: 'Maag',                       icon: '🫃', chapterFile: 'stomach',             rootPath: 'Stomach' },
  { name: 'Abdomen',              nameDutch: 'Buik',                       icon: '🔘', chapterFile: 'abdomen',             rootPath: 'Abdomen' },
  { name: 'Rectum',               nameDutch: 'Rectum',                     icon: '🔻', chapterFile: 'rectum',              rootPath: 'Rectum' },
  { name: 'Stool',                nameDutch: 'Ontlasting',                 icon: '💩', chapterFile: 'stool',               rootPath: 'Stool' },
  { name: 'Bladder',              nameDutch: 'Blaas',                      icon: '🫧', chapterFile: 'bladder',             rootPath: 'Bladder' },
  { name: 'Kidneys',              nameDutch: 'Nieren',                     icon: '🫘', chapterFile: 'kidneys',             rootPath: 'Kidneys' },
  { name: 'Prostate Gland',       nameDutch: 'Prostaat',                   icon: '⚕️', chapterFile: 'prostate-gland',      rootPath: 'Prostate gland' },
  { name: 'Urethra',              nameDutch: 'Urethra',                    icon: '🔸', chapterFile: 'urethra',             rootPath: 'Urethra' },
  { name: 'Urine',                nameDutch: 'Urine',                      icon: '🧪', chapterFile: 'urine',               rootPath: 'Urine' },
  { name: 'Male Genitalia/Sex',   nameDutch: 'Mannelijke geslachtsdelen',  icon: '♂️', chapterFile: 'genitalia-male',      rootPath: 'Genitalia male' },
  { name: 'Female Genitalia/Sex', nameDutch: 'Vrouwelijke geslachtsdelen', icon: '♀️', chapterFile: 'genitalia-female',    rootPath: 'Genitalia female' },
  { name: 'Larynx & Trachea',     nameDutch: 'Strottenhoofd & luchtpijp',  icon: '🎤', chapterFile: 'larynx-and-trachea',  rootPath: 'Larynx and trachea' },
  { name: 'Respiration',          nameDutch: 'Ademhaling',                 icon: '🌬️', chapterFile: 'respiration',         rootPath: 'Respiration' },
  { name: 'Cough',                nameDutch: 'Hoest',                      icon: '🤧', chapterFile: 'cough',               rootPath: 'Cough' },
  { name: 'Expectoration',        nameDutch: 'Ophoesten',                  icon: '💧', chapterFile: 'expectoration',       rootPath: 'Expectoration' },
  { name: 'Chest',                nameDutch: 'Borst',                      icon: '🫀', chapterFile: 'chest',               rootPath: 'Chest' },
  { name: 'Back',                 nameDutch: 'Rug',                        icon: '🦴', chapterFile: 'back',                rootPath: 'Back' },
  { name: 'Extremities',          nameDutch: 'Ledematen',                  icon: '🦵', chapterFile: 'extremities',         rootPath: 'Extremities' },
  { name: 'Sleep',                nameDutch: 'Slaap',                      icon: '😴', chapterFile: 'sleep',               rootPath: 'Sleep' },
  { name: 'Dreams',               nameDutch: 'Dromen',                     icon: '🌙', chapterFile: 'sleep',               rootPath: 'Sleep, dreams' },
  { name: 'Chill',                nameDutch: 'Koude rillingen',            icon: '🥶', chapterFile: 'chill',               rootPath: 'Chill' },
  { name: 'Fever',                nameDutch: 'Koorts',                     icon: '🤒', chapterFile: 'fever',               rootPath: 'Fever' },
  { name: 'Perspiration',         nameDutch: 'Zweten',                     icon: '💦', chapterFile: 'perspiration',        rootPath: 'Perspiration' },
  { name: 'Skin',                 nameDutch: 'Huid',                       icon: '🖐️', chapterFile: 'skin',                rootPath: 'Skin' },
  { name: 'Generals',             nameDutch: 'Algemeenheden',              icon: '⚡', chapterFile: 'generalities',        rootPath: 'Generalities' },
];

// ──────────────────────────────────────────
// Beschikbare repertoria
// ──────────────────────────────────────────

export type RepertoryId = 'publicum' | 'kent-de';

export interface RepertoryInfo {
  id: RepertoryId;
  label: string;        // Korte naam voor knoppen en badges
  description: string;  // Uitleg bij de keuze
}

export const repertories: RepertoryInfo[] = [
  { id: 'publicum', label: 'Publicum', description: 'Repertorium Publicum (Engels)' },
  { id: 'kent-de',  label: 'Kent',     description: 'Kents Repertorium (Duitse vertaling)' },
];

/** Kent-hoofdstukbestanden staan in een submap: chapterFile "kent-de/gemuet" */
export function repertoryOfChapterFile(chapterFile: string): RepertoryId {
  return chapterFile.startsWith('kent-de/') ? 'kent-de' : 'publicum';
}

// Kent (Duitse vertaling, OOREP, GPL v3). Zelfde volgorde, iconen en Nederlandse
// namen als het Publicum; `name` is het Duitse hoofdstuk zoals Kent het noemt.
export const kentChapters: RepertoryChapter[] = [
  { name: 'Gemüt',                      nameDutch: 'Gemoed',                     icon: '🧠', chapterFile: 'kent-de/gemuet',                     rootPath: 'Gemüt' },
  { name: 'Schwindel',                  nameDutch: 'Duizeligheid',               icon: '💫', chapterFile: 'kent-de/schwindel',                  rootPath: 'Schwindel' },
  { name: 'Kopf',                       nameDutch: 'Hoofd',                      icon: '🗣️', chapterFile: 'kent-de/kopf',                       rootPath: 'Kopf' },
  { name: 'Auge',                       nameDutch: 'Oog',                        icon: '👁️', chapterFile: 'kent-de/auge',                       rootPath: 'Auge' },
  { name: 'Sehen',                      nameDutch: 'Gezichtsvermogen',           icon: '🔍', chapterFile: 'kent-de/sehen',                      rootPath: 'Sehen' },
  { name: 'Ohr',                        nameDutch: 'Oor',                        icon: '👂', chapterFile: 'kent-de/ohr',                        rootPath: 'Ohr' },
  { name: 'Gehör',                      nameDutch: 'Gehoor',                     icon: '🔊', chapterFile: 'kent-de/gehoer',                     rootPath: 'Gehör' },
  { name: 'Nase',                       nameDutch: 'Neus',                       icon: '👃', chapterFile: 'kent-de/nase',                       rootPath: 'Nase' },
  { name: 'Gesicht',                    nameDutch: 'Gezicht',                    icon: '😶', chapterFile: 'kent-de/gesicht',                    rootPath: 'Gesicht' },
  { name: 'Mund',                       nameDutch: 'Mond',                       icon: '👄', chapterFile: 'kent-de/mund',                       rootPath: 'Mund' },
  { name: 'Zähne',                      nameDutch: 'Tanden',                     icon: '🦷', chapterFile: 'kent-de/zaehne',                     rootPath: 'Zähne' },
  { name: 'Hals',                       nameDutch: 'Keel',                       icon: '🫁', chapterFile: 'kent-de/hals',                       rootPath: 'Hals' },
  { name: 'Hals-Außenseite',            nameDutch: 'Uitwendige keel',            icon: '🔗', chapterFile: 'kent-de/hals-aussenseite',           rootPath: 'Hals-Außenseite' },
  { name: 'Magen',                      nameDutch: 'Maag',                       icon: '🫃', chapterFile: 'kent-de/magen',                      rootPath: 'Magen' },
  { name: 'Bauch',                      nameDutch: 'Buik',                       icon: '🔘', chapterFile: 'kent-de/bauch',                      rootPath: 'Bauch' },
  { name: 'Mastdarm',                   nameDutch: 'Rectum',                     icon: '🔻', chapterFile: 'kent-de/mastdarm',                   rootPath: 'Mastdarm' },
  { name: 'Stuhl',                      nameDutch: 'Ontlasting',                 icon: '💩', chapterFile: 'kent-de/stuhl',                      rootPath: 'Stuhl' },
  { name: 'Blase',                      nameDutch: 'Blaas',                      icon: '🫧', chapterFile: 'kent-de/blase',                      rootPath: 'Blase' },
  { name: 'Nieren',                     nameDutch: 'Nieren',                     icon: '🫘', chapterFile: 'kent-de/nieren',                     rootPath: 'Nieren' },
  { name: 'Prostata',                   nameDutch: 'Prostaat',                   icon: '⚕️', chapterFile: 'kent-de/prostata',                   rootPath: 'Prostata' },
  { name: 'Harnröhre',                  nameDutch: 'Urethra',                    icon: '🔸', chapterFile: 'kent-de/harnroehre',                 rootPath: 'Harnröhre' },
  { name: 'Urin',                       nameDutch: 'Urine',                      icon: '🧪', chapterFile: 'kent-de/urin',                       rootPath: 'Urin' },
  { name: 'Geschlechtsorgane männlich', nameDutch: 'Mannelijke geslachtsdelen',  icon: '♂️', chapterFile: 'kent-de/geschlechtsorgane-maennlich', rootPath: 'Geschlechtsorgane männlich' },
  { name: 'Geschlechtsorgane weiblich', nameDutch: 'Vrouwelijke geslachtsdelen', icon: '♀️', chapterFile: 'kent-de/geschlechtsorgane-weiblich', rootPath: 'Geschlechtsorgane weiblich' },
  { name: 'Kehlkopf und Luftröhre',     nameDutch: 'Strottenhoofd & luchtpijp',  icon: '🎤', chapterFile: 'kent-de/kehlkopf-und-luftroehre',    rootPath: 'Kehlkopf und Luftröhre' },
  { name: 'Atmung',                     nameDutch: 'Ademhaling',                 icon: '🌬️', chapterFile: 'kent-de/atmung',                     rootPath: 'Atmung' },
  { name: 'Husten',                     nameDutch: 'Hoest',                      icon: '🤧', chapterFile: 'kent-de/husten',                     rootPath: 'Husten' },
  { name: 'Auswurf',                    nameDutch: 'Ophoesten',                  icon: '💧', chapterFile: 'kent-de/auswurf',                    rootPath: 'Auswurf' },
  { name: 'Brust',                      nameDutch: 'Borst',                      icon: '🫀', chapterFile: 'kent-de/brust',                      rootPath: 'Brust' },
  { name: 'Rücken',                     nameDutch: 'Rug',                        icon: '🦴', chapterFile: 'kent-de/ruecken',                    rootPath: 'Rücken' },
  { name: 'Extremitäten',               nameDutch: 'Ledematen',                  icon: '🦵', chapterFile: 'kent-de/extremitaeten',              rootPath: 'Extremitäten' },
  { name: 'Schlaf',                     nameDutch: 'Slaap',                      icon: '😴', chapterFile: 'kent-de/schlaf',                     rootPath: 'Schlaf' },
  { name: 'Träume',                     nameDutch: 'Dromen',                     icon: '🌙', chapterFile: 'kent-de/schlaf',                     rootPath: 'Schlaf, Träume' },
  { name: 'Frost',                      nameDutch: 'Koude rillingen',            icon: '🥶', chapterFile: 'kent-de/frost',                      rootPath: 'Frost' },
  { name: 'Fieber',                     nameDutch: 'Koorts',                     icon: '🤒', chapterFile: 'kent-de/fieber',                     rootPath: 'Fieber' },
  { name: 'Schweiß',                    nameDutch: 'Zweten',                     icon: '💦', chapterFile: 'kent-de/schweiss',                   rootPath: 'Schweiß' },
  { name: 'Haut',                       nameDutch: 'Huid',                       icon: '🖐️', chapterFile: 'kent-de/haut',                       rootPath: 'Haut' },
  { name: 'Allgemeines',                nameDutch: 'Algemeenheden',              icon: '⚡', chapterFile: 'kent-de/allgemeines',                rootPath: 'Allgemeines' },
];

export const chaptersByRepertory: Record<RepertoryId, RepertoryChapter[]> = {
  'publicum': repertoryChapters,
  'kent-de': kentChapters,
};
