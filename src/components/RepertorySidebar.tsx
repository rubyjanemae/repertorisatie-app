'use client';

import { useState, useEffect, useCallback, useMemo, useRef, Dispatch, SetStateAction } from 'react';
import { chaptersByRepertory, repertories, RepertoryChapter, RepertoryId } from '@/lib/repertoryData';
import {
  getDirectChildren,
  lookupRemediesDirect,
  countOwnRemedies,
  searchRubrics,
  TreeNode,
  RubricSearchResult,
} from '@/lib/repertoryLookup';

interface RepertorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRubric: (name: string, remedyString: string) => void;
  existingRubricPaths: Set<string>;
  expandedPaths: Set<string>;
  setExpandedPaths: Dispatch<SetStateAction<Set<string>>>;
}

type ChildrenState = { status: 'loading' } | { status: 'ready'; nodes: TreeNode[] };

export default function RepertorySidebar({
  isOpen,
  onClose,
  onAddRubric,
  existingRubricPaths,
  expandedPaths,
  setExpandedPaths,
}: RepertorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [repertory, setRepertory] = useState<RepertoryId>('publicum');
  const chapters = chaptersByRepertory[repertory];
  const repertoryInfo = repertories.find(r => r.id === repertory)!;
  const [childrenByPath, setChildrenByPath] = useState<Map<string, ChildrenState>>(new Map());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<RubricSearchResult[]>([]);
  const [searchCounts, setSearchCounts] = useState<Map<string, number>>(new Map());
  const [searchLoading, setSearchLoading] = useState(false);

  // Dedup-refs voor lazy load (voorkom dubbele fetches zonder nested setState)
  const loadingRef = useRef<Set<string>>(new Set());
  const loadedRef = useRef<Set<string>>(new Set());

  // Esc sluit
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const isInSearchMode = searchQuery.trim().length >= 2;

  // Helper: laad kinderen voor een pad (chapter-root of diepere rubriek)
  const loadChildren = useCallback(async (chapterFile: string, parentPath: string) => {
    if (loadingRef.current.has(parentPath) || loadedRef.current.has(parentPath)) return;
    loadingRef.current.add(parentPath);
    setChildrenByPath(prev => {
      const next = new Map(prev);
      next.set(parentPath, { status: 'loading' });
      return next;
    });
    try {
      const nodes = await getDirectChildren(chapterFile, parentPath);
      loadedRef.current.add(parentPath);
      setChildrenByPath(prev => {
        const next = new Map(prev);
        next.set(parentPath, { status: 'ready', nodes });
        return next;
      });
    } catch {
      loadedRef.current.add(parentPath);
      setChildrenByPath(prev => {
        const next = new Map(prev);
        next.set(parentPath, { status: 'ready', nodes: [] });
        return next;
      });
    } finally {
      loadingRef.current.delete(parentPath);
    }
  }, []);

  const togglePath = useCallback((oorepPath: string, chapterFile: string) => {
    const wasExpanded = expandedPaths.has(oorepPath);
    if (!wasExpanded) {
      void loadChildren(chapterFile, oorepPath);
    }
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(oorepPath)) next.delete(oorepPath);
      else next.add(oorepPath);
      return next;
    });
  }, [expandedPaths, loadChildren, setExpandedPaths]);

  const toggleChapter = useCallback((chapter: RepertoryChapter) => {
    togglePath(chapter.rootPath, chapter.chapterFile);
  }, [togglePath]);

  // Search: debounced
  useEffect(() => {
    if (!isInSearchMode) { setSearchResults([]); setSearchCounts(new Map()); return; }
    let cancelled = false;
    setSearchLoading(true);
    const t = setTimeout(async () => {
      const res = await searchRubrics(searchQuery, 50, [repertory]);
      if (cancelled) return;
      setSearchResults(res);
      setSearchLoading(false);
      // Count per hit ophalen (chapters worden gecached door loadChapter)
      const counts = new Map<string, number>();
      await Promise.all(res.map(async hit => {
        const remStr = await lookupRemediesDirect(hit.oorepPath, hit.chapterFile);
        counts.set(hit.oorepPath, countOwnRemedies(remStr));
      }));
      if (!cancelled) setSearchCounts(counts);
    }, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [searchQuery, isInSearchMode, repertory]);

  const handleAdd = useCallback(async (oorepPath: string, chapterFile: string, displayPath: string) => {
    if (existingRubricPaths.has(displayPath)) return;
    const remStr = await lookupRemediesDirect(oorepPath, chapterFile);
    if (!remStr) {
      setToastMessage(`${displayPath} heeft geen eigen middelen — kies een sub-rubriek`);
      return;
    }
    onAddRubric(displayPath, remStr);
    setToastMessage(`${displayPath} · toegevoegd`);
  }, [existingRubricPaths, onAddRubric]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-forest-deep/50 backdrop-blur-[2px] z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-full md:w-[640px] bg-warm-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out border-r border-warm-border ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-forest-dark text-cream px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <div>
              <h2 className="font-display font-semibold text-sm text-cream">Repertorium</h2>
              <p className="text-cream/30 text-[10px] font-body">{chapters.length} hoofdstukken · OOREP · {repertoryInfo.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-forest hover:bg-forest-muted flex items-center justify-center transition-colors"
            title="Sluiten (Esc)"
          >
            <span className="text-cream/60 text-sm">&times;</span>
          </button>
        </div>
        <div className="decorative-rule-dark" />

        {/* Keuze repertorium + zoekbalk */}
        <div className="px-3 py-2.5 border-b border-warm-border-subtle bg-parchment/50 shrink-0 space-y-2">
          <div className="flex gap-1 p-0.5 bg-warm-border-subtle/60 rounded-lg" role="tablist" aria-label="Repertorium">
            {repertories.map(r => (
              <button
                key={r.id}
                role="tab"
                aria-selected={repertory === r.id}
                onClick={() => setRepertory(r.id)}
                title={r.description}
                className={`flex-1 text-xs font-body font-medium py-1.5 rounded-md transition-colors ${
                  repertory === r.id
                    ? 'bg-warm-white text-forest shadow-sm'
                    : 'text-warm-text-muted hover:text-warm-text'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={repertory === 'kent-de'
              ? 'Zoek in Kent, Duitse termen (bijv. Angst, Kopf Schmerz)...'
              : 'Zoek in het Publicum, Engelse termen (min. 2 tekens)...'}
            className="input-materia w-full"
            autoFocus={isOpen}
          />
        </div>

        {/* Inhoud */}
        <div className="flex-1 overflow-y-auto">
          {isInSearchMode ? (
            <SearchResultsList
              results={searchResults}
              counts={searchCounts}
              loading={searchLoading}
              existingRubricPaths={existingRubricPaths}
              onAdd={handleAdd}
            />
          ) : (
            chapters.map(chapter => {
              const expanded = expandedPaths.has(chapter.rootPath);
              const state = childrenByPath.get(chapter.rootPath);
              return (
                <div key={chapter.name} className="border-b border-warm-border-subtle/50">
                  <button
                    onClick={() => toggleChapter(chapter)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-forest-light/40 transition-colors group ${
                      expanded ? 'bg-forest-light/20' : ''
                    }`}
                  >
                    <span className="text-base shrink-0">{chapter.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-display font-semibold text-warm-text group-hover:text-forest truncate">
                          {chapter.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-warm-text-muted font-body">
                        {chapter.nameDutch}
                        {state?.status === 'ready' ? ` · ${state.nodes.length} rubrieken` : ''}
                      </span>
                    </div>
                    <span className={`text-warm-text-muted text-xs transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
                      &#9654;
                    </span>
                  </button>

                  {expanded && (
                    <div className="bg-parchment/30 pb-1 animate-fade-in">
                      {state?.status === 'loading' || !state ? (
                        <SkeletonRows />
                      ) : (
                        state.nodes.map(node => (
                          <TreeRow
                            key={node.oorepPath}
                            node={node}
                            depth={0}
                            expandedPaths={expandedPaths}
                            childrenByPath={childrenByPath}
                            onToggle={togglePath}
                            onAdd={handleAdd}
                            existingRubricPaths={existingRubricPaths}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2 border-t border-warm-border-subtle bg-parchment/50 shrink-0">
          <p className="text-[10px] text-warm-text-muted/60 text-center font-body italic">
            Klik op een naam om te openen · klik op <span className="font-semibold">＋</span> om toe te voegen
          </p>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-forest-dark text-cream px-4 py-2 rounded-lg shadow-lg text-sm font-body animate-fade-in max-w-[90%] text-center">
            {toastMessage}
          </div>
        )}
      </div>
    </>
  );
}

// ──────────────────────────────────────────
// Tree row (recursief)
// ──────────────────────────────────────────

function TreeRow({
  node,
  depth,
  expandedPaths,
  childrenByPath,
  onToggle,
  onAdd,
  existingRubricPaths,
}: {
  node: TreeNode;
  depth: number;
  expandedPaths: Set<string>;
  childrenByPath: Map<string, ChildrenState>;
  onToggle: (oorepPath: string, chapterFile: string) => void;
  onAdd: (oorepPath: string, chapterFile: string, displayPath: string) => void;
  existingRubricPaths: Set<string>;
}) {
  const expanded = expandedPaths.has(node.oorepPath);
  const state = childrenByPath.get(node.oorepPath);
  const canExpand = node.childCount > 0;
  const isAdded = existingRubricPaths.has(node.displayPath);
  const canAdd = node.hasOwnEntry && node.ownCount > 0;

  // Indent op basis van depth (beperkt tot max 8)
  const indent = Math.min(depth, 8);
  const padLeft = `calc(${0.75 + indent * 0.9}rem)`;

  return (
    <>
      <div className="flex items-center pr-2 group hover:bg-forest-light/20 transition-colors" style={{ paddingLeft: padLeft }}>
        <button
          onClick={() => canExpand && onToggle(node.oorepPath, node.chapterFile)}
          className={`flex-1 text-left py-1.5 flex items-center gap-2 min-w-0 ${canExpand ? 'cursor-pointer' : 'cursor-default'}`}
          title={node.displayPath}
        >
          <span className={`text-[10px] text-warm-text-muted shrink-0 w-3 transition-transform duration-150 ${expanded ? 'rotate-90' : ''} ${canExpand ? '' : 'opacity-0'}`}>
            &#9654;
          </span>
          <span className={`text-sm font-body truncate ${isAdded ? 'text-warm-text-muted' : 'text-warm-text-secondary group-hover:text-forest'}`}>
            {node.displayName}
          </span>
          {node.hasOwnEntry && node.ownCount > 0 && (
            <span className="text-[11px] font-mono text-forest/80 shrink-0">
              {node.ownCount}
            </span>
          )}
          {node.childCount > 0 && (
            <span className="text-[10px] font-mono text-warm-text-muted/70 shrink-0">
              +{node.childCount}
            </span>
          )}
        </button>

        {isAdded ? (
          <span
            className="w-6 h-6 flex items-center justify-center text-forest shrink-0"
            title="Al toegevoegd aan casus"
          >
            ✓
          </span>
        ) : canAdd ? (
          <button
            onClick={() => onAdd(node.oorepPath, node.chapterFile, node.displayPath)}
            className="w-6 h-6 rounded-md hover:bg-gold/30 text-forest hover:text-forest-dark flex items-center justify-center text-base leading-none shrink-0 transition-colors"
            title="Toevoegen aan casus"
          >
            ＋
          </button>
        ) : (
          <span className="w-6 h-6 shrink-0" />
        )}
      </div>

      {expanded && (
        <div className="animate-fade-in">
          {!state || state.status === 'loading' ? (
            <SkeletonRows />
          ) : (
            state.nodes.map(child => (
              <TreeRow
                key={child.oorepPath}
                node={child}
                depth={depth + 1}
                expandedPaths={expandedPaths}
                childrenByPath={childrenByPath}
                onToggle={onToggle}
                onAdd={onAdd}
                existingRubricPaths={existingRubricPaths}
              />
            ))
          )}
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────
// Search results
// ──────────────────────────────────────────

function SearchResultsList({
  results,
  counts,
  loading,
  existingRubricPaths,
  onAdd,
}: {
  results: RubricSearchResult[];
  counts: Map<string, number>;
  loading: boolean;
  existingRubricPaths: Set<string>;
  onAdd: (oorepPath: string, chapterFile: string, displayPath: string) => void;
}) {
  if (loading && results.length === 0) return <SkeletonRows n={6} />;
  if (results.length === 0) {
    return (
      <p className="text-center text-warm-text-muted text-sm py-8 font-display italic">
        Geen rubrieken gevonden
      </p>
    );
  }

  return (
    <div className="py-1">
      {results.map(hit => {
        const count = counts.get(hit.oorepPath);
        const isAdded = existingRubricPaths.has(hit.displayPath);
        return (
          <div key={hit.oorepPath} className="flex items-center px-3 py-1.5 group hover:bg-forest-light/20 transition-colors">
            <div className="flex-1 min-w-0 pr-2">
              <div className={`text-sm font-body truncate ${isAdded ? 'text-warm-text-muted' : 'text-warm-text'}`}>
                {hit.displayPath}
              </div>
            </div>
            {count !== undefined && count > 0 && (
              <span className="text-[11px] font-mono text-forest/80 shrink-0 mr-2">
                {count}
              </span>
            )}
            {isAdded ? (
              <span className="w-6 h-6 flex items-center justify-center text-forest shrink-0" title="Al toegevoegd">
                ✓
              </span>
            ) : count && count > 0 ? (
              <button
                onClick={() => onAdd(hit.oorepPath, hit.chapterFile, hit.displayPath)}
                className="w-6 h-6 rounded-md hover:bg-gold/30 text-forest hover:text-forest-dark flex items-center justify-center text-base leading-none shrink-0 transition-colors"
                title="Toevoegen aan casus"
              >
                ＋
              </button>
            ) : (
              <span className="w-6 h-6 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Eenvoudig skelet van een paar grijze rijen tijdens chapter-load
function SkeletonRows({ n = 4 }: { n?: number }) {
  const arr = useMemo(() => Array.from({ length: n }), [n]);
  return (
    <div className="py-1 animate-pulse">
      {arr.map((_, i) => (
        <div key={i} className="px-6 py-2">
          <div className="h-3 bg-warm-border rounded w-[60%]" />
        </div>
      ))}
    </div>
  );
}

