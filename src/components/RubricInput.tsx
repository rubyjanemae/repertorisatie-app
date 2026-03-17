'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SavedRubric } from '@/lib/types';
import { parseRemedies, mergeRemedyStrings, gradeBgColor, gradeToDisplay, MergeResult } from '@/lib/parseRemedies';
import { searchRubrics, lookupRemediesDirect, RubricSearchResult } from '@/lib/repertoryLookup';

interface RubricInputProps {
  onAdd: (name: string, remedyString: string) => void;
  savedRubrics: SavedRubric[];
  prefillRubricName?: string | null;
  prefillRemedyString?: string | null;
  isLoadingRemedies?: boolean;
  onPrefillConsumed?: () => void;
}

/** Split een remedy-string in 4 grade-buckets */
function splitByGrade(remedyString: string): [string, string, string, string] {
  const remedies = parseRemedies(remedyString);
  const buckets: string[][] = [[], [], [], []];
  for (const r of remedies) {
    const idx = Math.min(Math.max(r.grade, 1), 4) - 1;
    buckets[idx].push(r.name); // canonical lowercase
  }
  return [
    buckets[3].join(', '), // grade 4
    buckets[2].join(', '), // grade 3
    buckets[1].join(', '), // grade 2
    buckets[0].join(', '), // grade 1
  ];
}

/** Combineer 4 grade-velden tot één remedy-string die parseRemedies snapt */
function combineGrades(g4: string, g3: string, g2: string, g1: string): string {
  const parts: string[] = [];

  // Grade 4: UPPERCASE (4)
  for (const name of splitNames(g4)) {
    parts.push(`${name.toUpperCase()} (4)`);
  }
  // Grade 3: UPPERCASE
  for (const name of splitNames(g3)) {
    parts.push(name.toUpperCase());
  }
  // Grade 2: Capitalized
  for (const name of splitNames(g2)) {
    parts.push(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
  }
  // Grade 1: lowercase
  for (const name of splitNames(g1)) {
    parts.push(name.toLowerCase());
  }

  return parts.join(', ');
}

/** Split een komma-gescheiden string in individuele namen, met trim */
function splitNames(input: string): string[] {
  if (!input.trim()) return [];
  return input
    .split(/[,]+/)
    .map(s => s.trim().replace(/\.$/, ''))
    .filter(Boolean);
}

/** Tel het totaal aantal middelen over alle velden */
function countRemedies(g4: string, g3: string, g2: string, g1: string): number {
  return splitNames(g4).length + splitNames(g3).length + splitNames(g2).length + splitNames(g1).length;
}

export default function RubricInput({ onAdd, savedRubrics, prefillRubricName, prefillRemedyString, isLoadingRemedies, onPrefillConsumed }: RubricInputProps) {
  const [name, setName] = useState('');
  const [grade4, setGrade4] = useState('');
  const [grade3, setGrade3] = useState('');
  const [grade2, setGrade2] = useState('');
  const [grade1, setGrade1] = useState('');
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [showMerge, setShowMerge] = useState(false);
  const [mergeText, setMergeText] = useState('');
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);

  // Autocomplete suggesties
  const [suggestions, setSuggestions] = useState<RubricSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const suppressSuggestionsRef = useRef(false);

  const totalCount = useMemo(() => countRemedies(grade4, grade3, grade2, grade1), [grade4, grade3, grade2, grade1]);
  const combinedRemedyText = useMemo(() => combineGrades(grade4, grade3, grade2, grade1), [grade4, grade3, grade2, grade1]);
  const hasRemedies = totalCount > 0;

  /** Vul alle 4 grade-velden vanuit een remedy-string */
  const fillFromRemedyString = useCallback((remedyString: string) => {
    const [g4, g3, g2, g1] = splitByGrade(remedyString);
    setGrade4(g4);
    setGrade3(g3);
    setGrade2(g2);
    setGrade1(g1);
  }, []);

  // Debounced autocomplete zoeken
  useEffect(() => {
    if (suppressSuggestionsRef.current) {
      suppressSuggestionsRef.current = false;
      return;
    }
    if (name.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchRubrics(name, 10);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [name]);

  // Klik op een autocomplete suggestie
  const handleSuggestionClick = useCallback(async (suggestion: RubricSearchResult) => {
    suppressSuggestionsRef.current = true;
    setName(suggestion.displayPath);
    setShowSuggestions(false);
    setSuggestions([]);

    // Laad de middelen voor deze rubriek
    setIsLoadingSuggestion(true);
    try {
      const remedyString = await lookupRemediesDirect(suggestion.oorepPath, suggestion.chapterFile);
      if (remedyString) {
        fillFromRemedyString(remedyString);
      }
    } catch (err) {
      console.warn('Kon middelen niet laden:', err);
    } finally {
      setIsLoadingSuggestion(false);
    }
  }, [fillFromRemedyString]);

  // Consumeer prefill van de sidebar (rubriektitel)
  useEffect(() => {
    if (prefillRubricName) {
      suppressSuggestionsRef.current = true;
      setName(prefillRubricName);
      setShowSuggestions(false);
    }
  }, [prefillRubricName]);

  // Consumeer prefill van de OOREP lookup (middelen)
  useEffect(() => {
    if (prefillRemedyString) {
      fillFromRemedyString(prefillRemedyString);
      onPrefillConsumed?.();
    }
  }, [prefillRemedyString, onPrefillConsumed, fillFromRemedyString]);

  const handleSubmit = () => {
    if (name.trim() && hasRemedies) {
      onAdd(name.trim(), combinedRemedyText);
      setName('');
      setGrade4('');
      setGrade3('');
      setGrade2('');
      setGrade1('');
    }
  };

  const handleSelectFromLibrary = (rubric: SavedRubric) => {
    setName(rubric.name);
    fillFromRemedyString(rubric.remedyString);
    setShowLibrary(false);
    setLibrarySearch('');
  };

  const handleClearAll = () => {
    setGrade4('');
    setGrade3('');
    setGrade2('');
    setGrade1('');
  };

  // Filter en sorteer de bibliotheek
  const filteredLibrary = (savedRubrics || [])
    .filter(r => {
      if (!librarySearch.trim()) return true;
      return r.name.toLowerCase().includes(librarySearch.toLowerCase());
    })
    .sort((a, b) => b.lastUsed - a.lastUsed);

  return (
    <div className="card-materia p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg font-semibold text-warm-text">
            Nieuwe rubriek
          </h3>
          <div className="h-px flex-1 bg-warm-border-subtle hidden sm:block" />
        </div>
        {savedRubrics && savedRubrics.length > 0 && (
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className={`btn-secondary ${
              showLibrary
                ? '!bg-gold-light !border-gold/30 !text-sienna'
                : ''
            }`}
          >
            Bibliotheek ({savedRubrics.length})
          </button>
        )}
      </div>

      {/* Rubriekenbibliotheek */}
      {showLibrary && (
        <div className="mb-4 border border-gold/20 rounded-lg bg-gold-light/30 overflow-hidden animate-fade-in">
          <div className="px-3 py-2 border-b border-gold/15 bg-gold-light/50">
            <input
              type="text"
              value={librarySearch}
              onChange={e => setLibrarySearch(e.target.value)}
              placeholder="Zoek in opgeslagen rubrieken..."
              className="input-materia w-full !bg-warm-white"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-gold/10">
            {filteredLibrary.length === 0 ? (
              <p className="text-center text-warm-text-muted text-sm py-4 font-display italic">
                {librarySearch ? 'Geen rubrieken gevonden' : 'Nog geen opgeslagen rubrieken'}
              </p>
            ) : (
              filteredLibrary.map((rubric, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectFromLibrary(rubric)}
                  className="w-full text-left px-3 py-2.5 hover:bg-gold-light/40 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-warm-text group-hover:text-sienna font-body">
                      {rubric.name}
                    </span>
                    <span className="text-[10px] text-warm-text-muted flex items-center gap-2 font-body">
                      <span>{rubric.remedyCount} middelen</span>
                      <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Rubriek naam met autocomplete */}
        <div className="relative">
          <label className="block text-xs font-body font-semibold text-warm-text-secondary mb-1.5 uppercase tracking-wider">
            Rubriek naam
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="bijv. Generals - Sun - exposure to sun"
            className="input-materia w-full"
          />

          {/* Autocomplete suggesties dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 card-materia overflow-hidden animate-fade-in">
              <div className="px-3 py-1.5 bg-forest-light/50 border-b border-forest/10 flex items-center justify-between">
                <span className="text-[10px] text-forest font-body font-semibold uppercase tracking-wider">Repertorium Publicum</span>
                <span className="text-[10px] text-warm-text-muted font-body">{suggestions.length} resultaten</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {suggestions.map((s, i) => {
                  // Markeer de eerste " - " als scheidslijn tussen hoofdstuk en subrubriek
                  const dashIdx = s.displayPath.indexOf(' - ');
                  const chapter = dashIdx > -1 ? s.displayPath.slice(0, dashIdx) : s.displayPath;
                  const rest = dashIdx > -1 ? s.displayPath.slice(dashIdx) : '';

                  return (
                    <button
                      key={i}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full text-left px-3 py-2.5 hover:bg-forest-light/30 transition-colors border-b last:border-b-0 border-warm-border-subtle/50 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-body">
                          <span className="font-semibold text-forest">{chapter}</span>
                          <span className="text-warm-text-secondary">{rest}</span>
                        </span>
                        <span className="ml-auto text-[10px] text-forest opacity-0 group-hover:opacity-100 transition-opacity shrink-0 font-body">
                          invullen
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Middelen per graad */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-body font-semibold text-warm-text-secondary uppercase tracking-wider">
              Middelen
              {(isLoadingRemedies || isLoadingSuggestion) && (
                <span className="ml-2 text-forest font-normal normal-case tracking-normal" style={{ animation: 'gentlePulse 1.5s ease-in-out infinite' }}>
                  Middelen opzoeken...
                </span>
              )}
              {!isLoadingRemedies && !isLoadingSuggestion && hasRemedies && (
                <span className="ml-2 text-warm-text-muted font-normal text-[11px] normal-case tracking-normal">
                  ({totalCount} totaal)
                </span>
              )}
            </label>
            {hasRemedies && (
              <button
                onClick={handleClearAll}
                className="text-[10px] text-warm-text-muted hover:text-danger transition-colors font-body"
              >
                Alles wissen
              </button>
            )}
          </div>

          {(isLoadingRemedies || isLoadingSuggestion) && (
            <div className="flex items-center justify-center py-6 border border-forest/15 rounded-lg bg-forest-light/30">
              <div className="flex items-center gap-2 text-forest text-sm font-body">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Laden uit Repertorium Publicum...
              </div>
            </div>
          )}

          {!isLoadingRemedies && !isLoadingSuggestion && (
            <div className="space-y-2">
              {/* Grade 4 */}
              <GradeInput
                grade={4}
                value={grade4}
                onChange={setGrade4}
                label="4-waardig"
                placeholder="bijv. sulph, lyc, phos..."
                inputClassName="font-bold uppercase text-grade-4"
                accentColor="red"
                count={splitNames(grade4).length}
              />
              {/* Grade 3 */}
              <GradeInput
                grade={3}
                value={grade3}
                onChange={setGrade3}
                label="3-waardig"
                placeholder="bijv. acon, bell, nux-v..."
                inputClassName="font-semibold uppercase text-grade-3"
                accentColor="orange"
                count={splitNames(grade3).length}
              />
              {/* Grade 2 */}
              <GradeInput
                grade={2}
                value={grade2}
                onChange={setGrade2}
                label="2-waardig"
                placeholder="bijv. apis, bry, puls..."
                inputClassName="italic text-grade-2"
                accentColor="blue"
                count={splitNames(grade2).length}
              />
              {/* Grade 1 */}
              <GradeInput
                grade={1}
                value={grade1}
                onChange={setGrade1}
                label="1-waardig"
                placeholder="bijv. arn, cham, ign..."
                inputClassName="text-grade-1"
                accentColor="gray"
                count={splitNames(grade1).length}
              />
            </div>
          )}

          {/* Samenvoegen link */}
          {hasRemedies && !showMerge && (
            <div className="mt-2">
              <button
                onClick={() => { setShowMerge(true); setMergeText(''); setMergeResult(null); }}
                className="text-xs text-sienna hover:text-sienna/80 transition-colors font-body font-medium"
              >
                + Samenvoegen met Synthesis
              </button>
            </div>
          )}
        </div>

        {/* Samenvoegen panel */}
        {showMerge && (
          <div className="border border-info/20 rounded-lg bg-info-light/30 overflow-hidden animate-fade-in">
            <div className="px-4 py-2.5 border-b border-info/15 bg-info-light/50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-display font-semibold text-info">Samenvoegen</h4>
                <p className="text-[10px] text-info/70 font-body">Plak middelen uit Synthesis — dubbelen gefilterd, hoogste graad wint</p>
              </div>
              <button
                onClick={() => { setShowMerge(false); setMergeText(''); setMergeResult(null); }}
                className="text-warm-text-muted hover:text-warm-text text-sm px-1.5 transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="p-3 space-y-3">
              <textarea
                value={mergeText}
                onChange={e => { setMergeText(e.target.value); setMergeResult(null); }}
                placeholder="Plak hier de middelen uit Synthesis..."
                rows={3}
                className="input-materia w-full font-mono resize-y"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (mergeText.trim()) {
                      const result = mergeRemedyStrings(combinedRemedyText, mergeText);
                      setMergeResult(result);
                    }
                  }}
                  disabled={!mergeText.trim()}
                  className="text-xs font-body font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 bg-info text-white hover:bg-info/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Vergelijk
                </button>
                {mergeResult && (
                  <button
                    onClick={() => {
                      fillFromRemedyString(mergeResult.merged);
                      setShowMerge(false);
                      setMergeText('');
                      setMergeResult(null);
                    }}
                    className="btn-primary text-xs py-1.5"
                  >
                    Toepassen ({mergeResult.totalCount} middelen)
                  </button>
                )}
              </div>

              {/* Merge resultaat */}
              {mergeResult && (
                <div className="border border-warm-border-subtle rounded-lg p-3 bg-warm-white text-xs space-y-2 animate-fade-in">
                  <div className="flex flex-wrap gap-3 text-sm font-body">
                    <span className="text-warm-text-secondary">
                      Totaal: <strong className="text-warm-text">{mergeResult.totalCount}</strong>
                    </span>
                    {mergeResult.addedCount > 0 && (
                      <span className="text-forest font-semibold">
                        +{mergeResult.addedCount} nieuw
                      </span>
                    )}
                    {mergeResult.upgradedCount > 0 && (
                      <span className="text-gold font-semibold">
                        &uarr;{mergeResult.upgradedCount} verhoogd
                      </span>
                    )}
                    <span className="text-warm-text-muted">
                      {mergeResult.unchangedCount} ongewijzigd
                    </span>
                  </div>

                  {mergeResult.addedCount > 0 && (
                    <div>
                      <p className="text-forest font-body font-semibold mb-1">Nieuw toegevoegd:</p>
                      <div className="flex flex-wrap gap-1">
                        {mergeResult.added.map((r, i) => (
                          <span key={i} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-forest/15 font-mono text-[11px] ${gradeBgColor(r.grade)}`}>
                            {r.displayName} {gradeToDisplay(r.grade)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {mergeResult.upgradedCount > 0 && (
                    <div>
                      <p className="text-gold font-body font-semibold mb-1">Graad verhoogd:</p>
                      <div className="flex flex-wrap gap-1">
                        {mergeResult.upgraded.map((u, i) => (
                          <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-gold/20 bg-gold-light text-sienna font-mono text-[11px]">
                            {u.remedy.displayName} {gradeToDisplay(u.oldGrade)}&rarr;{gradeToDisplay(u.newGrade)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {mergeResult.addedCount === 0 && mergeResult.upgradedCount === 0 && (
                    <p className="text-warm-text-muted font-display italic">Alle middelen staan al in de lijst — niets om toe te voegen.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit knoppen */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !hasRemedies}
            className="btn-primary"
          >
            Rubriek toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}

/** Sub-component voor een grade-invoerveld */
function GradeInput({
  grade,
  value,
  onChange,
  label,
  placeholder,
  inputClassName,
  accentColor,
  count,
}: {
  grade: 1 | 2 | 3 | 4;
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder: string;
  inputClassName: string;
  accentColor: 'red' | 'orange' | 'blue' | 'gray';
  count: number;
}) {
  const borderColors = {
    red: 'border-grade-4/25 focus-within:border-grade-4/50 focus-within:ring-grade-4/10',
    orange: 'border-grade-3/25 focus-within:border-grade-3/50 focus-within:ring-grade-3/10',
    blue: 'border-grade-2/25 focus-within:border-grade-2/50 focus-within:ring-grade-2/10',
    gray: 'border-warm-border focus-within:border-warm-text-muted/50 focus-within:ring-warm-text-muted/10',
  };

  const badgeColors = {
    red: 'bg-grade-4-bg text-grade-4',
    orange: 'bg-grade-3-bg text-grade-3',
    blue: 'bg-grade-2-bg text-grade-2',
    gray: 'bg-grade-1-bg text-grade-1',
  };

  const bgColors = {
    red: value.trim() ? 'bg-grade-4-bg/20' : 'bg-warm-white',
    orange: value.trim() ? 'bg-grade-3-bg/20' : 'bg-warm-white',
    blue: value.trim() ? 'bg-grade-2-bg/20' : 'bg-warm-white',
    gray: 'bg-warm-white',
  };

  return (
    <div className={`flex items-start gap-2 border rounded-lg px-3 py-2 transition-all duration-200 focus-within:ring-2 ${borderColors[accentColor]} ${bgColors[accentColor]}`}>
      <div className="flex items-center gap-1.5 pt-0.5 shrink-0">
        <span className={`grade-badge w-5 h-5 text-[10px] ${badgeColors[accentColor]}`}>
          {grade}
        </span>
        <span className="text-[10px] text-warm-text-muted font-body w-14">{label}</span>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={1}
        className={`flex-1 text-sm font-mono resize-none bg-transparent focus:outline-none min-h-[1.5rem] ${inputClassName}`}
        onInput={(e) => {
          // Auto-resize textarea
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = el.scrollHeight + 'px';
        }}
      />
      {count > 0 && (
        <span className={`text-[10px] pt-1 shrink-0 font-body font-semibold px-1.5 py-0.5 rounded-full ${badgeColors[accentColor]}`}>
          {count}
        </span>
      )}
    </div>
  );
}
