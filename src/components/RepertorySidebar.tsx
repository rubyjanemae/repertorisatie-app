'use client';

import { useState, useEffect, useCallback } from 'react';
import { repertoryChapters, searchRepertory, RepertoryChapter, SubRubric } from '@/lib/repertoryData';

interface RepertorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRubric: (rubricPath: string) => void;
}

export default function RepertorySidebar({ isOpen, onClose, onSelectRubric }: RepertorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [expandedSubRubrics, setExpandedSubRubrics] = useState<Set<string>>(new Set());

  const filteredChapters = searchQuery.length >= 2
    ? searchRepertory(searchQuery)
    : repertoryChapters;

  // Bij zoeken: auto-expand alle hoofdstukken met resultaten
  const chaptersToShow = searchQuery.length >= 2
    ? new Set(filteredChapters.map(c => c.name))
    : expandedChapters;

  // Escape toets sluit sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleChapter = useCallback((name: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const toggleSubRubric = useCallback((fullPath: string) => {
    setExpandedSubRubrics(prev => {
      const next = new Set(prev);
      if (next.has(fullPath)) next.delete(fullPath);
      else next.add(fullPath);
      return next;
    });
  }, []);

  const handleSelect = useCallback((fullPath: string) => {
    onSelectRubric(fullPath);
  }, [onSelectRubric]);

  const isExpanded = (name: string) =>
    searchQuery.length >= 2 ? chaptersToShow.has(name) : expandedChapters.has(name);

  // Totaal subrubrieken tellen (incl. kinderen)
  const countSubRubrics = (chapter: RepertoryChapter) => {
    let count = 0;
    for (const sub of chapter.subRubrics) {
      count++;
      if (sub.children) count += sub.children.length;
    }
    return count;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">📖</span>
            <div>
              <h2 className="font-semibold text-sm">Repertorium</h2>
              <p className="text-emerald-200 text-[10px]">{repertoryChapters.length} hoofdstukken</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-colors"
            title="Sluiten (Esc)"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>

        {/* Zoekbalk */}
        <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Zoek hoofdstuk of rubriek..."
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            autoFocus={isOpen}
          />
        </div>

        {/* Hoofdstukken lijst */}
        <div className="flex-1 overflow-y-auto">
          {filteredChapters.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              Geen resultaten gevonden
            </p>
          ) : (
            filteredChapters.map(chapter => (
              <div key={chapter.name} className="border-b border-gray-100">
                {/* Hoofdstuk header */}
                <button
                  onClick={() => toggleChapter(chapter.name)}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-emerald-50 transition-colors group ${
                    isExpanded(chapter.name) ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  <span className="text-base shrink-0">{chapter.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-emerald-800 truncate">
                        {chapter.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {chapter.nameDutch} · {countSubRubrics(chapter)} rubrieken
                    </span>
                  </div>
                  <span className={`text-gray-400 text-xs transition-transform duration-200 ${
                    isExpanded(chapter.name) ? 'rotate-90' : ''
                  }`}>
                    ▶
                  </span>
                </button>

                {/* Subrubrieken */}
                {isExpanded(chapter.name) && (
                  <div className="bg-gray-50/50 pb-1">
                    {chapter.subRubrics.map(sub => (
                      <SubRubricItem
                        key={sub.fullPath}
                        sub={sub}
                        depth={0}
                        onSelect={handleSelect}
                        isChildExpanded={expandedSubRubrics.has(sub.fullPath)}
                        onToggleChildren={() => toggleSubRubric(sub.fullPath)}
                        searchQuery={searchQuery}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 shrink-0">
          <p className="text-[10px] text-gray-400 text-center">
            Klik op een rubriek om de naam in te vullen
          </p>
        </div>
      </div>
    </>
  );
}

// Sub-component voor een subrubriek item
function SubRubricItem({
  sub,
  depth,
  onSelect,
  isChildExpanded,
  onToggleChildren,
  searchQuery,
}: {
  sub: SubRubric;
  depth: number;
  onSelect: (fullPath: string) => void;
  isChildExpanded: boolean;
  onToggleChildren: () => void;
  searchQuery: string;
}) {
  const hasChildren = sub.children && sub.children.length > 0;
  const pl = depth === 0 ? 'pl-10' : 'pl-14';

  // Highlight zoekterm in naam
  const highlightMatch = (text: string) => {
    if (searchQuery.length < 2) return text;
    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="bg-yellow-200 rounded-sm">{text.slice(idx, idx + searchQuery.length)}</span>
        {text.slice(idx + searchQuery.length)}
      </>
    );
  };

  return (
    <>
      <div className={`flex items-center ${pl} pr-3`}>
        <button
          onClick={() => onSelect(sub.fullPath)}
          className="flex-1 text-left py-1.5 text-sm text-gray-700 hover:text-emerald-700 transition-colors truncate"
          title={sub.fullPath}
        >
          {highlightMatch(sub.name)}
        </button>
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleChildren(); }}
            className="text-[10px] text-gray-400 hover:text-emerald-600 px-1.5 py-0.5 rounded hover:bg-emerald-100 transition-colors shrink-0"
          >
            {isChildExpanded ? '▼' : `+${sub.children!.length}`}
          </button>
        )}
      </div>

      {/* Kinderen (dieper niveau) */}
      {hasChildren && isChildExpanded && (
        <div className="bg-emerald-50/30">
          {sub.children!.map(child => (
            <button
              key={child.fullPath}
              onClick={() => onSelect(child.fullPath)}
              className="w-full text-left pl-14 pr-3 py-1 text-xs text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors truncate"
              title={child.fullPath}
            >
              ↳ {highlightMatch(child.name)}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
