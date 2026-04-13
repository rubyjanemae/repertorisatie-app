'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  DifferentialDiagnosis,
  DDRemedyData,
  DDCustomRow,
  DDCategory,
  DD_CATEGORIES,
} from '@/lib/types';
import { searchRemedies, RemedyInfo, lookupRemedy } from '@/lib/remedyDatabase';
import { lookupRemedyProfile } from '@/lib/remedyProfiles';

interface DDBuilderProps {
  ddList: DifferentialDiagnosis[];
  onUpdate: (ddList: DifferentialDiagnosis[]) => void;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Textarea die automatisch meegroeit met de inhoud */
function AutoTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    // Gebruik requestAnimationFrame zodat de browser layout compleet is
    const raf = requestAnimationFrame(resize);
    return () => cancelAnimationFrame(raf);
  }, [props.value, resize]);

  return (
    <textarea
      {...props}
      ref={ref}
      rows={undefined}
      onInput={e => {
        resize();
        props.onInput?.(e);
      }}
      style={{ ...props.style, minHeight: '3rem', overflow: 'hidden' }}
    />
  );
}

/** Vul cellen automatisch in vanuit een remedyProfile */
function autoFillFromProfile(abbr: string): Record<DDCategory, string> {
  const profile = lookupRemedyProfile(abbr);
  if (!profile) {
    return { causa: '', cp: '', mind: '', pijnSensatie: '', uitscheiding: '', modErger: '', modBeter: '', sleutelSx: '' };
  }
  return {
    causa: profile.causa.join('. '),
    cp: profile.centrumPathologie.join(', '),
    mind: profile.opvallendheden.join('. '),
    pijnSensatie: profile.pijnSensatie.join('. '),
    uitscheiding: '',
    modErger: profile.modaliteiten.erger.join(', '),
    modBeter: profile.modaliteiten.beter.join(', '),
    sleutelSx: profile.sleutelSx.join('. '),
  };
}

function createEmptyCells(): Record<DDCategory, string> {
  return { causa: '', cp: '', mind: '', pijnSensatie: '', uitscheiding: '', modErger: '', modBeter: '', sleutelSx: '' };
}

// ─── Middel zoeker (met vrije invoer) ────────────────────────
function RemedySearch({ onSelect, existingAbbrs }: { onSelect: (info: RemedyInfo) => void; existingAbbrs: string[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RemedyInfo[]>([]);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) { setResults([]); setShow(false); return; }
    const r = searchRemedies(query).filter(rem => !existingAbbrs.includes(rem.abbr));
    setResults(r.slice(0, 12));
    setShow(true);
  }, [query, existingAbbrs]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Vrije invoer: voeg als custom middel toe
  const addCustomRemedy = () => {
    const abbr = query.trim().toLowerCase();
    if (!abbr || existingAbbrs.includes(abbr)) return;
    // Kijk of het middel in de database staat
    const known = lookupRemedy(abbr);
    onSelect({
      abbr: known?.abbr || abbr,
      fullName: known?.fullName || abbr.charAt(0).toUpperCase() + abbr.slice(1),
    });
    setQuery('');
    setShow(false);
  };

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (results.length > 0) {
              // Selecteer eerste resultaat
              onSelect(results[0]);
              setQuery('');
              setShow(false);
            } else if (query.trim()) {
              addCustomRemedy();
            }
          }
        }}
        placeholder="Middel zoeken of typen..."
        className="input-materia w-full text-sm"
        onFocus={() => query.trim().length >= 1 && setShow(true)}
      />
      {show && query.trim().length >= 1 && (
        <div className="absolute z-30 w-full mt-1 card-materia overflow-hidden animate-fade-in">
          <div className="max-h-48 overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={i}
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  onSelect(r);
                  setQuery('');
                  setShow(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-forest-light/30 transition-colors text-sm font-body flex items-center gap-2"
              >
                <span className="font-bold text-forest font-mono">{r.abbr}</span>
                <span className="text-warm-text-muted">—</span>
                <span className="text-warm-text-secondary italic">{r.fullName}</span>
              </button>
            ))}
            {/* Vrije invoer optie als het middel niet gevonden wordt */}
            {results.length === 0 && (
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={addCustomRemedy}
                className="w-full text-left px-3 py-2.5 hover:bg-sienna-light/30 transition-colors text-sm font-body flex items-center gap-2 border-t border-warm-border-subtle/50"
              >
                <span className="text-sienna font-semibold">+</span>
                <span className="font-bold text-sienna font-mono">{query.trim().toLowerCase()}</span>
                <span className="text-warm-text-muted text-xs">— toevoegen als vrij middel</span>
              </button>
            )}
            {results.length > 0 && !results.find(r => r.abbr === query.trim().toLowerCase()) && query.trim().length >= 2 && (
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={addCustomRemedy}
                className="w-full text-left px-3 py-2 hover:bg-sienna-light/20 transition-colors text-xs font-body flex items-center gap-2 border-t border-warm-border-subtle/50 text-warm-text-muted"
              >
                <span className="text-sienna">+</span>
                <span className="font-mono">{query.trim().toLowerCase()}</span>
                <span>— of voeg toe als vrij middel</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DD Card (één DD) ───────────────────────────────────────
function DDCard({
  dd,
  onUpdate,
  onDelete,
}: {
  dd: DifferentialDiagnosis;
  onUpdate: (updated: DifferentialDiagnosis) => void;
  onDelete: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'copied'>('idle');
  const titleRef = useRef<HTMLInputElement>(null);

  // Zorg dat customRows altijd bestaat (migratie van oude data)
  const customRows: DDCustomRow[] = dd.customRows || [];

  // Export DD als tekst
  const exportAsText = useCallback(() => {
    const colWidth = 30;
    const labelWidth = 22;

    let text = `DIFFERENTIAAL DIAGNOSE: ${dd.title || 'Naamloze DD'}\n`;
    text += `${'='.repeat(labelWidth + colWidth * dd.remedies.length)}\n`;
    text += `Datum: ${new Date().toLocaleDateString('nl-NL')}\n`;
    text += `Middelen: ${dd.remedies.map(r => r.abbr.toUpperCase()).join(', ')}\n\n`;

    // Header
    text += `${''.padEnd(labelWidth)}`;
    dd.remedies.forEach(r => { text += `${r.abbr.toUpperCase().padEnd(colWidth)}`; });
    text += '\n';
    text += `${'-'.repeat(labelWidth + colWidth * dd.remedies.length)}\n`;

    // Standaard rijen
    DD_CATEGORIES.forEach(cat => {
      text += `${(cat.icon + ' ' + cat.label).padEnd(labelWidth)}`;
      dd.remedies.forEach(r => {
        const val = (r.cells[cat.key] || '').replace(/\n/g, '; ');
        text += `${val.substring(0, colWidth - 2).padEnd(colWidth)}`;
      });
      text += '\n';
    });

    // Custom rijen
    customRows.forEach(row => {
      if (!row.label && !dd.remedies.some(r => row.values[r.abbr]?.trim())) return;
      text += `${'✏️ ' + (row.label || 'Extra').padEnd(labelWidth - 3)}`;
      dd.remedies.forEach(r => {
        const val = (row.values[r.abbr] || '').replace(/\n/g, '; ');
        text += `${val.substring(0, colWidth - 2).padEnd(colWidth)}`;
      });
      text += '\n';
    });

    return text;
  }, [dd, customRows]);

  const handleExportText = useCallback(() => {
    const text = exportAsText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DD-${dd.title || 'naamloos'}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dd.title, exportAsText]);

  // Export DD als CSV (opent als tabel in Excel/Numbers)
  const handleExportCsv = useCallback(() => {
    const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/\n/g, '; ')}"`;

    // Header rij
    const headers = ['Categorie', ...dd.remedies.map(r => r.abbr.toUpperCase())];
    const rows: string[][] = [];

    // Standaard categorieën
    DD_CATEGORIES.forEach(cat => {
      rows.push([
        cat.icon + ' ' + cat.label,
        ...dd.remedies.map(r => r.cells[cat.key] || ''),
      ]);
    });

    // Custom rijen
    customRows.forEach(row => {
      if (!row.label && !dd.remedies.some(r => row.values[r.abbr]?.trim())) return;
      rows.push([
        row.label || 'Extra',
        ...dd.remedies.map(r => row.values[r.abbr] || ''),
      ]);
    });

    const csv = [headers.map(esc).join(';'), ...rows.map(r => r.map(esc).join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }); // BOM voor Excel
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DD-${dd.title || 'naamloos'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dd, customRows]);

  const handleCopyText = useCallback(() => {
    navigator.clipboard.writeText(exportAsText());
    setExportStatus('copied');
    setTimeout(() => setExportStatus('idle'), 2000);
  }, [exportAsText]);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  const updateCell = useCallback((remedyIdx: number, cat: DDCategory, value: string) => {
    const updated = { ...dd, updatedAt: Date.now() };
    updated.remedies = dd.remedies.map((rem, i) =>
      i === remedyIdx ? { ...rem, cells: { ...rem.cells, [cat]: value } } : rem
    );
    onUpdate(updated);
  }, [dd, onUpdate]);

  const addRemedy = useCallback((info: RemedyInfo) => {
    if (dd.remedies.length >= 6) return;
    const cells = autoFillFromProfile(info.abbr);
    const newRemedy: DDRemedyData = {
      abbr: info.abbr,
      fullName: info.fullName,
      cells,
    };
    onUpdate({ ...dd, remedies: [...dd.remedies, newRemedy], updatedAt: Date.now() });
  }, [dd, onUpdate]);

  const removeRemedy = useCallback((idx: number) => {
    onUpdate({
      ...dd,
      remedies: dd.remedies.filter((_, i) => i !== idx),
      updatedAt: Date.now(),
    });
  }, [dd, onUpdate]);

  const refreshRemedy = useCallback((idx: number) => {
    const rem = dd.remedies[idx];
    const cells = autoFillFromProfile(rem.abbr);
    onUpdate({
      ...dd,
      remedies: dd.remedies.map((r, i) => i === idx ? { ...r, cells } : r),
      updatedAt: Date.now(),
    });
  }, [dd, onUpdate]);

  // Custom rij functies
  const addCustomRow = useCallback(() => {
    const newRow: DDCustomRow = {
      id: generateId(),
      label: '',
      values: {},
      collapsed: false,
    };
    onUpdate({ ...dd, customRows: [...customRows, newRow], updatedAt: Date.now() });
  }, [dd, customRows, onUpdate]);

  const updateCustomRowLabel = useCallback((rowId: string, label: string) => {
    onUpdate({
      ...dd,
      customRows: customRows.map(r => r.id === rowId ? { ...r, label } : r),
      updatedAt: Date.now(),
    });
  }, [dd, customRows, onUpdate]);

  const updateCustomRowValue = useCallback((rowId: string, remedyAbbr: string, value: string) => {
    onUpdate({
      ...dd,
      customRows: customRows.map(r =>
        r.id === rowId ? { ...r, values: { ...r.values, [remedyAbbr]: value } } : r
      ),
      updatedAt: Date.now(),
    });
  }, [dd, customRows, onUpdate]);

  const toggleCustomRow = useCallback((rowId: string) => {
    onUpdate({
      ...dd,
      customRows: customRows.map(r =>
        r.id === rowId ? { ...r, collapsed: !r.collapsed } : r
      ),
      updatedAt: Date.now(),
    });
  }, [dd, customRows, onUpdate]);

  const deleteCustomRow = useCallback((rowId: string) => {
    onUpdate({
      ...dd,
      customRows: customRows.filter(r => r.id !== rowId),
      updatedAt: Date.now(),
    });
  }, [dd, customRows, onUpdate]);

  const existingAbbrs = dd.remedies.map(r => r.abbr);

  return (
    <div className="card-materia overflow-hidden">
      {/* Header */}
      <div className="bg-forest-dark px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-cream/60 hover:text-cream transition-colors shrink-0"
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {editingTitle ? (
            <input
              ref={titleRef}
              type="text"
              value={dd.title}
              onChange={e => onUpdate({ ...dd, title: e.target.value, updatedAt: Date.now() })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
              className="bg-transparent border-b border-cream/30 text-cream font-display text-lg outline-none flex-1 min-w-0"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="font-display text-lg text-cream hover:text-gold transition-colors truncate text-left"
              title="Klik om titel te wijzigen"
            >
              {dd.title || 'Naamloze DD'}
            </button>
          )}

          <span className="text-[10px] text-cream/30 font-body shrink-0">
            {dd.remedies.length} middelen
          </span>
        </div>

        <div className="flex items-center gap-1 ml-2 shrink-0">
          {/* Kopieer naar klembord */}
          {dd.remedies.length > 0 && (
            <button
              onClick={handleCopyText}
              className={`text-cream/30 hover:text-cream transition-colors p-1 ${exportStatus === 'copied' ? '!text-gold' : ''}`}
              title={exportStatus === 'copied' ? 'Gekopieerd!' : 'Kopieer als tekst'}
            >
              {exportStatus === 'copied' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              )}
            </button>
          )}
          {/* Download als CSV tabel */}
          {dd.remedies.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="text-cream/30 hover:text-cream transition-colors p-1"
              title="Download als CSV tabel (Excel/Numbers)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
            </button>
          )}
          {/* Download als tekst */}
          {dd.remedies.length > 0 && (
            <button
              onClick={handleExportText}
              className="text-cream/30 hover:text-cream transition-colors p-1"
              title="Download als .txt bestand"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          )}
          {/* Verwijder DD */}
          <button
            onClick={onDelete}
            className="text-cream/30 hover:text-danger transition-colors p-1"
            title="Verwijder DD"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="p-4">
          {/* Middel toevoegen */}
          {dd.remedies.length < 6 && (
            <div className="mb-4 max-w-xs">
              <RemedySearch onSelect={addRemedy} existingAbbrs={existingAbbrs} />
            </div>
          )}

          {dd.remedies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-warm-text-muted font-display italic text-sm">
                Voeg middelen toe om te vergelijken
              </p>
              <p className="text-[10px] text-warm-text-muted/50 font-body mt-1">
                Typ een afkorting of naam hierboven
              </p>
            </div>
          ) : (
            /* Vergelijkingstabel */
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-[10px] font-body font-semibold text-warm-text-muted uppercase tracking-wider py-2 px-2 w-28 align-bottom sticky left-0 bg-warm-white z-10">
                      Categorie
                    </th>
                    {dd.remedies.map((rem, i) => (
                      <th key={i} className="text-center py-2 px-2 min-w-[180px]" style={{ width: `${100 / dd.remedies.length}%` }}>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-mono font-bold text-forest text-sm">{rem.abbr.toUpperCase()}</span>
                          <div className="flex items-center gap-0.5 ml-1">
                            <button
                              onClick={() => refreshRemedy(i)}
                              className="text-warm-text-muted/40 hover:text-forest transition-colors p-0.5"
                              title="Opnieuw vullen vanuit profiel"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                <polyline points="21 3 21 9 15 9"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => removeRemedy(i)}
                              className="text-warm-text-muted/40 hover:text-danger transition-colors p-0.5"
                              title="Verwijder middel"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <span className="text-[10px] text-warm-text-muted font-body font-normal italic block mt-0.5 truncate">
                          {rem.fullName}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Standaard categorieën */}
                  {DD_CATEGORIES.map(cat => (
                    <tr key={cat.key} className="border-t border-warm-border-subtle/50">
                      <td className={`py-2 px-2 align-top sticky left-0 z-10 ${
                        cat.key === 'modErger' ? 'text-red-600 font-bold bg-red-50/50'
                        : cat.key === 'modBeter' ? 'text-emerald-600 font-bold bg-emerald-50/50'
                        : 'text-warm-text-secondary bg-warm-white'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{cat.icon}</span>
                          <span className="text-[11px] font-body font-semibold whitespace-nowrap">{cat.label}</span>
                        </div>
                      </td>
                      {dd.remedies.map((rem, i) => (
                        <td key={i} className="py-1.5 px-1.5 align-top">
                          <AutoTextarea
                            value={rem.cells[cat.key] || ''}
                            onChange={e => updateCell(i, cat.key, e.target.value)}
                            placeholder="..."
                            className={`w-full text-xs font-body rounded-md border resize-y p-2 transition-colors focus:outline-none focus:ring-1 ${
                              cat.key === 'modErger'
                                ? 'border-red-300 bg-red-100 focus:border-red-500 focus:ring-red-400/30 text-red-800 font-medium'
                                : cat.key === 'modBeter'
                                ? 'border-emerald-300 bg-emerald-100 focus:border-emerald-500 focus:ring-emerald-400/30 text-emerald-800 font-medium'
                                : 'border-warm-border-subtle bg-parchment/30 focus:border-forest/30 focus:ring-forest/20 text-warm-text'
                            }`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Custom rijen */}
                  {customRows.map(row => (
                    <tr key={row.id} className="border-t border-sienna/15">
                      <td className="py-1.5 px-2 align-top sticky left-0 z-10 bg-sienna-light/10">
                        <div className="flex items-center gap-1">
                          {/* Inklap pijltje */}
                          <button
                            onClick={() => toggleCustomRow(row.id)}
                            className="text-sienna/40 hover:text-sienna transition-colors p-0.5 shrink-0"
                            title={row.collapsed ? 'Uitklappen' : 'Inklappen'}
                          >
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                              className={`transition-transform ${row.collapsed ? '-rotate-90' : ''}`}>
                              <path d="m6 9 6 6 6-6"/>
                            </svg>
                          </button>
                          {/* Bewerkbaar label */}
                          <input
                            type="text"
                            value={row.label}
                            onChange={e => updateCustomRowLabel(row.id, e.target.value)}
                            placeholder="Label..."
                            className="text-[11px] font-body font-semibold text-sienna/70 bg-transparent border-none outline-none w-full min-w-0 placeholder:text-sienna/30"
                          />
                          {/* Verwijder knop */}
                          <button
                            onClick={() => deleteCustomRow(row.id)}
                            className="text-sienna/20 hover:text-danger transition-colors p-0.5 shrink-0"
                            title="Verwijder rij"
                          >
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                      {!row.collapsed ? (
                        dd.remedies.map((rem, i) => (
                          <td key={i} className="py-1.5 px-1.5 align-top">
                            <AutoTextarea
                              value={row.values[rem.abbr] || ''}
                              onChange={e => updateCustomRowValue(row.id, rem.abbr, e.target.value)}
                              placeholder="..."
                              className="w-full text-xs font-body rounded-md border border-sienna/15 bg-sienna-light/5 resize-y p-2 transition-colors focus:outline-none focus:ring-1 focus:border-sienna/30 focus:ring-sienna/15 text-warm-text italic"
                            />
                          </td>
                        ))
                      ) : (
                        <td colSpan={dd.remedies.length} className="py-1.5 px-2 text-[10px] text-sienna/30 font-body italic">
                          ingeklapt
                        </td>
                      )}
                    </tr>
                  ))}

                  {/* + Rij toevoegen knop */}
                  <tr className="border-t border-warm-border-subtle/30">
                    <td colSpan={dd.remedies.length + 1} className="py-1.5 px-2">
                      <button
                        onClick={addCustomRow}
                        className="flex items-center gap-1.5 text-[10px] text-sienna/40 hover:text-sienna transition-colors font-body py-0.5 group"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span className="group-hover:underline">Rij toevoegen</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Hoofd DD Builder ───────────────────────────────────────
export default function DDBuilder({ ddList, onUpdate }: DDBuilderProps) {
  const createDD = useCallback(() => {
    const newDD: DifferentialDiagnosis = {
      id: generateId(),
      title: 'Nieuwe DD',
      remedies: [],
      customRows: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onUpdate([...ddList, newDD]);
  }, [ddList, onUpdate]);

  const updateDD = useCallback((id: string, updated: DifferentialDiagnosis) => {
    onUpdate(ddList.map(dd => dd.id === id ? updated : dd));
  }, [ddList, onUpdate]);

  const deleteDD = useCallback((id: string) => {
    onUpdate(ddList.filter(dd => dd.id !== id));
  }, [ddList, onUpdate]);

  return (
    <div>
      {/* + Nieuwe DD knop */}
      <div className="flex justify-end mb-4">
        <button
          onClick={createDD}
          className="btn-secondary text-xs flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nieuwe DD
        </button>
      </div>

      {/* DD Lijst */}
      <div className="space-y-4">
        {ddList.length === 0 ? (
          <div className="card-materia p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sienna-light/50 border border-sienna/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="font-display text-lg font-semibold text-warm-text mb-1">
              Differentiaal Diagnose
            </h3>
            <p className="text-warm-text-muted font-body text-sm mb-1">
              Vergelijk 3-5 middelen naast elkaar per indicatie
            </p>
            <p className="text-[10px] text-warm-text-muted/50 font-body mb-5">
              Middelen worden automatisch gevuld vanuit de materia medica profielen
            </p>
            <button onClick={createDD} className="btn-primary text-sm">
              + Eerste DD maken
            </button>
          </div>
        ) : (
          ddList.map(dd => (
            <DDCard
              key={dd.id}
              dd={dd}
              onUpdate={(updated) => updateDD(dd.id, updated)}
              onDelete={() => deleteDD(dd.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
