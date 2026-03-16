'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SavedRubric, Remedy } from '@/lib/types';
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
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Nieuwe rubriek toevoegen
        </h3>
        {savedRubrics && savedRubrics.length > 0 && (
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              showLibrary
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            📚 Bibliotheek ({savedRubrics.length})
          </button>
        )}
      </div>

      {/* Rubriekenbibliotheek */}
      {showLibrary && (
        <div className="mb-4 border border-amber-200 rounded-lg bg-amber-50/50 overflow-hidden">
          <div className="px-3 py-2 border-b border-amber-200 bg-amber-50">
            <input
              type="text"
              value={librarySearch}
              onChange={e => setLibrarySearch(e.target.value)}
              placeholder="Zoek in opgeslagen rubrieken..."
              className="w-full border border-amber-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-amber-100">
            {filteredLibrary.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">
                {librarySearch ? 'Geen rubrieken gevonden' : 'Nog geen opgeslagen rubrieken'}
              </p>
            ) : (
              filteredLibrary.map((rubric, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectFromLibrary(rubric)}
                  className="w-full text-left px-3 py-2.5 hover:bg-amber-100/50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-amber-800">
                      {rubric.name}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-2">
                      <span>{rubric.remedyCount} middelen</span>
                      <span className="text-amber-500">→ invullen</span>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rubriek naam
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="bijv. Generals - Sun - exposure to sun"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />

          {/* Autocomplete suggesties dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-emerald-200 rounded-lg shadow-lg overflow-hidden">
              <div className="px-3 py-1.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 font-medium">Suggesties uit Repertorium Publicum</span>
                <span className="text-[10px] text-emerald-400">{suggestions.length} resultaten</span>
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
                      className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 transition-colors border-b last:border-b-0 border-gray-100 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          <span className="font-semibold text-emerald-700">{chapter}</span>
                          <span className="text-gray-600">{rest}</span>
                        </span>
                        <span className="ml-auto text-[10px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          klik om in te vullen
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
            <label className="block text-sm font-medium text-gray-700">
              Middelen
              {(isLoadingRemedies || isLoadingSuggestion) && (
                <span className="ml-2 text-emerald-600 font-normal animate-pulse">
                  ⏳ Middelen opzoeken...
                </span>
              )}
              {!isLoadingRemedies && !isLoadingSuggestion && hasRemedies && (
                <span className="ml-2 text-gray-400 font-normal text-xs">
                  ({totalCount} totaal)
                </span>
              )}
            </label>
            {hasRemedies && (
              <button
                onClick={handleClearAll}
                className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
              >
                Alles wissen
              </button>
            )}
          </div>

          {(isLoadingRemedies || isLoadingSuggestion) && (
            <div className="flex items-center justify-center py-6 border border-emerald-200 rounded-lg bg-emerald-50/30">
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
                inputClassName="font-bold uppercase text-red-800"
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
                inputClassName="font-semibold uppercase text-orange-800"
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
                inputClassName="italic text-blue-800"
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
                inputClassName="text-gray-600"
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
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                + Samenvoegen met Synthesis
              </button>
            </div>
          )}
        </div>

        {/* Samenvoegen panel */}
        {showMerge && (
          <div className="border border-blue-200 rounded-lg bg-blue-50/50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-blue-200 bg-blue-50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-blue-800">Samenvoegen</h4>
                <p className="text-[10px] text-blue-600">Plak middelen uit Synthesis — dubbelen worden gefilterd, hoogste graad wint</p>
              </div>
              <button
                onClick={() => { setShowMerge(false); setMergeText(''); setMergeResult(null); }}
                className="text-blue-400 hover:text-blue-700 text-sm px-1.5"
              >
                ✕
              </button>
            </div>
            <div className="p-3 space-y-3">
              <textarea
                value={mergeText}
                onChange={e => { setMergeText(e.target.value); setMergeResult(null); }}
                placeholder="Plak hier de middelen uit Synthesis..."
                rows={3}
                className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-y"
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
                  className="bg-blue-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                    className="bg-emerald-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Toepassen ({mergeResult.totalCount} middelen)
                  </button>
                )}
              </div>

              {/* Merge resultaat */}
              {mergeResult && (
                <div className="border border-blue-200 rounded-lg p-3 bg-white text-xs space-y-2">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="text-gray-600">
                      Totaal: <strong>{mergeResult.totalCount}</strong> middelen
                    </span>
                    {mergeResult.addedCount > 0 && (
                      <span className="text-green-700">
                        +{mergeResult.addedCount} nieuw
                      </span>
                    )}
                    {mergeResult.upgradedCount > 0 && (
                      <span className="text-amber-700">
                        ↑{mergeResult.upgradedCount} verhoogd
                      </span>
                    )}
                    <span className="text-gray-400">
                      {mergeResult.unchangedCount} ongewijzigd
                    </span>
                  </div>

                  {mergeResult.addedCount > 0 && (
                    <div>
                      <p className="text-green-700 font-medium mb-1">Nieuw toegevoegd:</p>
                      <div className="flex flex-wrap gap-1">
                        {mergeResult.added.map((r, i) => (
                          <span key={i} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-green-300 bg-green-50 ${gradeBgColor(r.grade)}`}>
                            {r.displayName} {gradeToDisplay(r.grade)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {mergeResult.upgradedCount > 0 && (
                    <div>
                      <p className="text-amber-700 font-medium mb-1">Graad verhoogd:</p>
                      <div className="flex flex-wrap gap-1">
                        {mergeResult.upgraded.map((u, i) => (
                          <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800">
                            {u.remedy.displayName} {gradeToDisplay(u.oldGrade)}→{gradeToDisplay(u.newGrade)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {mergeResult.addedCount === 0 && mergeResult.upgradedCount === 0 && (
                    <p className="text-gray-500 italic">Alle middelen staan al in de lijst — niets om toe te voegen.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit knoppen */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !hasRemedies}
            className="bg-emerald-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
    red: 'border-red-200 focus-within:border-red-400 focus-within:ring-red-200',
    orange: 'border-orange-200 focus-within:border-orange-400 focus-within:ring-orange-200',
    blue: 'border-blue-200 focus-within:border-blue-400 focus-within:ring-blue-200',
    gray: 'border-gray-200 focus-within:border-gray-400 focus-within:ring-gray-200',
  };

  const badgeColors = {
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-700',
  };

  const bgColors = {
    red: value.trim() ? 'bg-red-50/30' : 'bg-white',
    orange: value.trim() ? 'bg-orange-50/30' : 'bg-white',
    blue: value.trim() ? 'bg-blue-50/30' : 'bg-white',
    gray: 'bg-white',
  };

  return (
    <div className={`flex items-start gap-2 border rounded-lg px-3 py-2 transition-all focus-within:ring-1 ${borderColors[accentColor]} ${bgColors[accentColor]}`}>
      <div className="flex items-center gap-1.5 pt-0.5 shrink-0">
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${badgeColors[accentColor]}`}>
          {grade}
        </span>
        <span className="text-[10px] text-gray-400 w-14">{label}</span>
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
        <span className={`text-[10px] pt-1 shrink-0 ${badgeColors[accentColor]} px-1.5 py-0.5 rounded-full`}>
          {count}
        </span>
      )}
    </div>
  );
}
