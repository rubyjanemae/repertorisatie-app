'use client';

import { useMemo, useState } from 'react';
import { Rubric, SortConfig, SortField, FilterConfig } from '@/lib/types';
import { tallyRemedies, sortTally, filterTally } from '@/lib/tallyRemedies';
import { gradeBgColor, gradeToDisplay } from '@/lib/parseRemedies';
import { lookupRemedy } from '@/lib/remedyDatabase';
import RemedyCard from './RemedyCard';

interface RepertorisationTableProps {
  rubrics: Rubric[];
  onDeleteRubric: (id: string) => void;
}

const PAGE_SIZE = 15;

export default function RepertorisationTable({ rubrics, onDeleteRubric }: RepertorisationTableProps) {
  const [sort, setSort] = useState<SortConfig>({ field: 'totalScore', direction: 'desc' });
  const [filter, setFilter] = useState<FilterConfig>({ minScore: 0, minRubrics: 0, searchTerm: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRemedy, setExpandedRemedy] = useState<string | null>(null);
  const [showRubricList, setShowRubricList] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [cardRemedy, setCardRemedy] = useState<string | null>(null);
  const [cardAnchorRect, setCardAnchorRect] = useState<DOMRect | null>(null);

  const tally = useMemo(() => tallyRemedies(rubrics), [rubrics]);
  const filtered = useMemo(() => filterTally(tally, filter), [tally, filter]);
  const sorted = useMemo(() => sortTally(filtered, sort), [filtered, sort]);

  const isShowingAll = visibleCount >= sorted.length;
  const visibleItems = sorted.slice(0, visibleCount);
  const hiddenCount = sorted.length - visibleCount;

  const toggleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sortIcon = (field: SortField) => {
    if (sort.field !== field) return '↕';
    return sort.direction === 'desc' ? '↓' : '↑';
  };

  if (rubrics.length === 0) {
    return (
      <div className="card-materia p-10 text-center">
        <p className="font-display text-xl text-warm-text-secondary italic mb-1">Nog geen rubrieken</p>
        <p className="text-sm text-warm-text-muted font-body">Voeg hierboven een rubriek toe om te beginnen met repertoriseren.</p>
      </div>
    );
  }

  return (
    <div className="card-materia overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-warm-border-subtle flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-warm-text">
            Repertorisatie
          </h3>
          <p className="text-xs text-warm-text-muted font-body mt-0.5">
            {sorted.length} middelen uit {rubrics.length} rubrieken
            {filter.minScore > 0 || filter.minRubrics > 0 || filter.searchTerm
              ? ` (gefilterd uit ${tally.length})`
              : ''
            }
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowRubricList(!showRubricList)}
            className="btn-secondary"
          >
            {showRubricList ? 'Verberg rubrieken' : `Rubrieken (${rubrics.length})`}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${
              showFilters || filter.minScore > 0 || filter.minRubrics > 0 || filter.searchTerm
                ? '!border-forest/30 !bg-forest-light !text-forest'
                : ''
            }`}
          >
            Filters {(filter.minScore > 0 || filter.minRubrics > 0 || filter.searchTerm) && '●'}
          </button>
        </div>
      </div>

      {/* Rubrieken overzicht */}
      {showRubricList && (
        <div className="px-5 py-3 border-b border-warm-border-subtle bg-parchment/50 animate-fade-in">
          <div className="space-y-1.5">
            {rubrics.map((r, idx) => (
              <div key={r.id} className="flex items-center justify-between text-sm group">
                <span className="text-warm-text-secondary font-body">
                  <span className="text-warm-text-muted font-mono mr-2 text-xs">R{idx + 1}</span>
                  {r.name}
                  <span className="text-warm-text-muted ml-2">({r.remedies.length} middelen)</span>
                </span>
                <button
                  onClick={() => {
                    if (confirm(`Rubriek "${r.name}" verwijderen?`)) onDeleteRubric(r.id);
                  }}
                  className="text-xs text-danger/50 hover:text-danger opacity-0 group-hover:opacity-100 transition-all font-body"
                >
                  Verwijder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      {showFilters && (
        <div className="px-5 py-3 border-b border-warm-border-subtle bg-parchment/50 flex flex-wrap gap-4 items-end animate-fade-in">
          <div>
            <label className="block text-[10px] text-warm-text-muted mb-1 font-body uppercase tracking-wider">Zoek middel</label>
            <input
              type="text"
              value={filter.searchTerm}
              onChange={e => setFilter(f => ({ ...f, searchTerm: e.target.value }))}
              placeholder="bijv. sulph"
              className="input-materia w-40"
            />
          </div>
          <div>
            <label className="block text-[10px] text-warm-text-muted mb-1 font-body uppercase tracking-wider">Min. score</label>
            <input
              type="number"
              value={filter.minScore || ''}
              onChange={e => setFilter(f => ({ ...f, minScore: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
              className="input-materia w-20"
            />
          </div>
          <div>
            <label className="block text-[10px] text-warm-text-muted mb-1 font-body uppercase tracking-wider">Min. rubrieken</label>
            <input
              type="number"
              value={filter.minRubrics || ''}
              onChange={e => setFilter(f => ({ ...f, minRubrics: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
              className="input-materia w-20"
            />
          </div>
          <button
            onClick={() => setFilter({ minScore: 0, minRubrics: 0, searchTerm: '' })}
            className="text-xs text-warm-text-muted hover:text-warm-text pb-1.5 font-body transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-warm-border-subtle bg-forest-dark">
              <th className="text-left px-5 py-3 text-[10px] font-body font-semibold text-cream/50 uppercase tracking-widest w-8">
                #
              </th>
              <th
                className="text-left px-3 py-3 text-[10px] font-body font-semibold text-cream/50 uppercase tracking-widest cursor-pointer hover:text-cream transition-colors"
                onClick={() => toggleSort('name')}
              >
                Middel {sortIcon('name')}
              </th>
              <th
                className="text-center px-3 py-3 text-[10px] font-body font-semibold text-cream/50 uppercase tracking-widest cursor-pointer hover:text-cream transition-colors w-24"
                onClick={() => toggleSort('totalScore')}
              >
                Score {sortIcon('totalScore')}
              </th>
              <th
                className="text-center px-3 py-3 text-[10px] font-body font-semibold text-cream/50 uppercase tracking-widest cursor-pointer hover:text-cream transition-colors w-24"
                onClick={() => toggleSort('rubricCount')}
              >
                Rubr. {sortIcon('rubricCount')}
              </th>
              <th className="text-left px-3 py-3 text-[10px] font-body font-semibold text-cream/50 uppercase tracking-widest">
                Per rubriek
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item, idx) => (
              <tr
                key={item.name}
                className={`border-b border-warm-border-subtle/50 cursor-pointer transition-colors duration-150 ${
                  idx < 3
                    ? 'bg-forest-light/40 hover:bg-forest-light/60'
                    : idx % 2 === 0
                    ? 'bg-warm-white hover:bg-parchment/70'
                    : 'bg-parchment/30 hover:bg-parchment/70'
                }`}
                onClick={() => setExpandedRemedy(expandedRemedy === item.name ? null : item.name)}
              >
                <td className="px-5 py-2.5 text-warm-text-muted font-mono text-xs">
                  {idx + 1}
                </td>
                <td className="px-3 py-2.5 font-body font-medium text-warm-text">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setCardRemedy(item.name);
                      setCardAnchorRect(rect);
                    }}
                    className="text-left hover:text-forest transition-colors group"
                    title={`${lookupRemedy(item.name)?.fullName || item.name} — klik voor profiel`}
                  >
                    <span className="group-hover:underline decoration-forest/30 underline-offset-2">
                      {item.name}
                    </span>
                    {lookupRemedy(item.name) && (
                      <span className="block text-[10px] text-warm-text-muted font-display italic leading-tight group-hover:text-forest/60">
                        {lookupRemedy(item.name)!.fullName}
                      </span>
                    )}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`inline-block min-w-[2.5rem] text-center font-display font-bold rounded-full px-2 py-0.5 text-xs ${
                    item.totalScore >= 15 ? 'bg-grade-4-bg text-grade-4' :
                    item.totalScore >= 10 ? 'bg-grade-3-bg text-grade-3' :
                    item.totalScore >= 5 ? 'bg-gold-light text-sienna' :
                    'bg-grade-1-bg text-grade-1'
                  }`}>
                    {item.totalScore}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center text-warm-text-secondary font-mono text-xs">
                  {item.rubricCount}/{rubrics.length}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {item.perRubric.map((pr, i) => {
                      const rubricIdx = rubrics.findIndex(r => r.id === pr.rubricId);
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-mono ${gradeBgColor(pr.grade)}`}
                          title={pr.rubricName}
                        >
                          R{rubricIdx + 1}:{gradeToDisplay(pr.grade)}
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toon meer / Toon alles knoppen */}
      {sorted.length > PAGE_SIZE && (
        <div className="px-5 py-3 border-t border-warm-border-subtle flex items-center justify-between bg-parchment/30">
          <p className="text-xs text-warm-text-muted font-body">
            {isShowingAll
              ? `Alle ${sorted.length} middelen zichtbaar`
              : `${visibleCount} van ${sorted.length} middelen — ${hiddenCount} verborgen`
            }
          </p>
          <div className="flex gap-2">
            {!isShowingAll && (
              <>
                <button
                  onClick={() => setVisibleCount(prev => Math.min(prev + PAGE_SIZE, sorted.length))}
                  className="btn-secondary !border-forest/20 !bg-forest-light !text-forest"
                >
                  Toon volgende {Math.min(PAGE_SIZE, hiddenCount)}
                </button>
                <button
                  onClick={() => setVisibleCount(sorted.length)}
                  className="btn-secondary"
                >
                  Toon alles ({sorted.length})
                </button>
              </>
            )}
            {isShowingAll && (
              <button
                onClick={() => setVisibleCount(PAGE_SIZE)}
                className="btn-secondary"
              >
                Toon top {PAGE_SIZE}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Remedy profiel popup */}
      {cardRemedy && (
        <RemedyCard
          remedyAbbr={cardRemedy}
          anchorRect={cardAnchorRect}
          onClose={() => { setCardRemedy(null); setCardAnchorRect(null); }}
        />
      )}

      {/* Expanded detail */}
      {expandedRemedy && (
        <div className="px-5 py-4 border-t border-warm-border bg-parchment/50 animate-fade-in">
          {(() => {
            const item = sorted.find(s => s.name === expandedRemedy);
            if (!item) return null;
            return (
              <div>
                <h4 className="font-display text-lg font-semibold text-warm-text mb-3">
                  {item.name}
                  <span className="text-warm-text-muted font-body text-sm font-normal ml-2">
                    Totaal: {item.totalScore}
                  </span>
                </h4>
                <div className="space-y-1.5">
                  {item.perRubric.map((pr, i) => {
                    const rubricIdx = rubrics.findIndex(r => r.id === pr.rubricId);
                    return (
                      <div key={i} className="text-sm text-warm-text-secondary flex items-center gap-2 font-body">
                        <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded font-mono ${gradeBgColor(pr.grade)}`}>
                          {gradeToDisplay(pr.grade)} Graad {pr.grade}
                        </span>
                        <span>R{rubricIdx + 1}: {pr.rubricName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
