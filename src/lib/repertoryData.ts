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
