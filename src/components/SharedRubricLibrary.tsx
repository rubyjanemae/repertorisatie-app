'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchSharedRubrics, SharedRubric } from '@/lib/sharedRubrics';
import { isSupabaseAvailable } from '@/lib/supabase';

interface SharedRubricLibraryProps {
  onSelect: (name: string, remedyString: string) => void;
  onClose: () => void;
}

export default function SharedRubricLibrary({ onSelect, onClose }: SharedRubricLibraryProps) {
  const [rubrics, setRubrics] = useState<SharedRubric[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRubrics = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSharedRubrics(searchTerm);
      setRubrics(data);
    } catch {
      setError('Kon community rubrieken niet laden');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initieel laden
  useEffect(() => {
    loadRubrics();
  }, [loadRubrics]);

  // Debounced zoeken
  useEffect(() => {
    if (search.trim().length === 0) return;
    if (search.trim().length < 2) return;

    const timer = setTimeout(() => {
      loadRubrics(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, loadRubrics]);

  // Reset naar alle rubrieken als zoekveld leeggemaakt wordt
  useEffect(() => {
    if (search.trim().length === 0) {
      loadRubrics();
    }
  }, [search, loadRubrics]);

  if (!isSupabaseAvailable()) {
    return (
      <div className="mb-4 border border-warm-border rounded-lg bg-parchment/50 overflow-hidden animate-fade-in">
        <div className="px-4 py-3 border-b border-warm-border-subtle bg-forest-light/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🌐</span>
            <span className="text-xs font-body font-semibold text-forest uppercase tracking-wider">Community</span>
          </div>
          <button onClick={onClose} className="text-warm-text-muted hover:text-warm-text text-sm px-1 transition-colors">&times;</button>
        </div>
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-warm-text-muted font-display italic">
            Community rubrieken zijn nog niet geconfigureerd
          </p>
          <p className="text-[10px] text-warm-text-muted/60 font-body mt-1.5">
            Stel Supabase in via .env.local om rubrieken te delen
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 border border-forest/20 rounded-lg bg-forest-light/20 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-forest/15 bg-forest-light/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">🌐</span>
          <span className="text-[10px] font-body font-semibold text-forest uppercase tracking-wider">
            Community Rubrieken
          </span>
          {!loading && (
            <span className="text-[10px] text-warm-text-muted font-body">
              ({rubrics.length})
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-warm-text-muted hover:text-warm-text text-sm px-1 transition-colors"
        >
          &times;
        </button>
      </div>

      {/* Zoekbalk */}
      <div className="px-3 py-2 border-b border-forest/10">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Zoek in community rubrieken..."
          className="input-materia w-full !bg-warm-white"
          autoFocus
        />
      </div>

      {/* Content */}
      <div className="max-h-72 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-forest text-sm font-body">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Laden...
            </div>
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-danger font-body">{error}</p>
            <button
              onClick={() => loadRubrics(search || undefined)}
              className="text-xs text-forest hover:text-forest/80 font-body mt-2 underline"
            >
              Opnieuw proberen
            </button>
          </div>
        ) : rubrics.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-warm-text-muted font-display italic">
              {search ? 'Geen rubrieken gevonden' : 'Nog geen community rubrieken'}
            </p>
            <p className="text-[10px] text-warm-text-muted/60 font-body mt-1">
              {search ? 'Probeer een andere zoekterm' : 'Wees de eerste die een rubriek deelt!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest/10">
            {rubrics.map(rubric => (
              <button
                key={rubric.id}
                onClick={() => onSelect(rubric.name, rubric.remedy_string)}
                className="w-full text-left px-3 py-2.5 hover:bg-forest-light/40 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-warm-text group-hover:text-forest font-body block truncate">
                      {rubric.name}
                    </span>
                    <span className="text-[10px] text-warm-text-muted font-body flex items-center gap-1.5 mt-0.5">
                      <span className="text-forest/50">{rubric.contributor}</span>
                      <span className="text-warm-text-muted/40">&middot;</span>
                      <span>{rubric.remedy_count} middelen</span>
                    </span>
                  </div>
                  <span className="text-forest opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    &rarr;
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
