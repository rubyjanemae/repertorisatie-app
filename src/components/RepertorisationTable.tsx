'use client';

import { useMemo, useState } from 'react';
import { Rubric, RemedyTally, SortConfig, SortField, FilterConfig } from '@/lib/types';
import { tallyRemedies, sortTally, filterTally } from '@/lib/tallyRemedies';
import { gradeBgColor, gradeToDisplay } from '@/lib/parseRemedies';
import { lookupRemedy } from '@/lib/remedyDatabase';

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
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        <p className="text-lg mb-1">Nog geen rubrieken</p>
        <p className="text-sm">Voeg hierboven een rubriek toe om te beginnen met repertoriseren.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Repertorisatie
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
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
            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            {showRubricList ? 'Verberg rubrieken' : `Rubrieken (${rubrics.length})`}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`text-xs border px-3 py-1.5 rounded-lg transition-colors ${
              showFilters || filter.minScore > 0 || filter.minRubrics > 0 || filter.searchTerm
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Filters {(filter.minScore > 0 || filter.minRubrics > 0 || filter.searchTerm) && '●'}
          </button>
        </div>
      </div>

      {/* Rubrieken overzicht */}
      {showRubricList && (
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="space-y-1.5">
            {rubrics.map((r, idx) => (
              <div key={r.id} className="flex items-center justify-between text-sm group">
                <span className="text-gray-700">
                  <span className="text-gray-400 font-mono mr-2">R{idx + 1}</span>
                  {r.name}
                  <span className="text-gray-400 ml-2">({r.remedies.length} middelen)</span>
                </span>
                <button
                  onClick={() => {
                    if (confirm(`Rubriek "${r.name}" verwijderen?`)) onDeleteRubric(r.id);
                  }}
                  className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Zoek middel</label>
            <input
              type="text"
              value={filter.searchTerm}
              onChange={e => setFilter(f => ({ ...f, searchTerm: e.target.value }))}
              placeholder="bijv. sulph"
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Min. score</label>
            <input
              type="number"
              value={filter.minScore || ''}
              onChange={e => setFilter(f => ({ ...f, minScore: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 w-20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Min. rubrieken</label>
            <input
              type="number"
              value={filter.minRubrics || ''}
              onChange={e => setFilter(f => ({ ...f, minRubrics: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 w-20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={() => setFilter({ minScore: 0, minRubrics: 0, searchTerm: '' })}
            className="text-xs text-gray-500 hover:text-gray-700 pb-1"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">
                #
              </th>
              <th
                className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-emerald-600"
                onClick={() => toggleSort('name')}
              >
                Middel {sortIcon('name')}
              </th>
              <th
                className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-emerald-600 w-24"
                onClick={() => toggleSort('totalScore')}
              >
                Score {sortIcon('totalScore')}
              </th>
              <th
                className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-emerald-600 w-24"
                onClick={() => toggleSort('rubricCount')}
              >
                Rubr. {sortIcon('rubricCount')}
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Per rubriek
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item, idx) => (
              <tr
                key={item.name}
                className={`border-b border-gray-50 hover:bg-emerald-50/30 cursor-pointer transition-colors ${
                  idx < 3 ? 'bg-emerald-50/50' : ''
                }`}
                onClick={() => setExpandedRemedy(expandedRemedy === item.name ? null : item.name)}
              >
                <td className="px-5 py-2.5 text-gray-400 font-mono text-xs">
                  {idx + 1}
                </td>
                <td className="px-3 py-2.5 font-medium text-gray-800">
                  <span title={lookupRemedy(item.name)?.fullName || item.name}>
                    {item.name}
                  </span>
                  {lookupRemedy(item.name) && (
                    <span className="block text-[10px] text-gray-400 font-normal leading-tight">
                      {lookupRemedy(item.name)!.fullName}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`inline-block min-w-[2.5rem] text-center font-bold rounded-full px-2 py-0.5 text-xs ${
                    item.totalScore >= 15 ? 'bg-red-100 text-red-700' :
                    item.totalScore >= 10 ? 'bg-orange-100 text-orange-700' :
                    item.totalScore >= 5 ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.totalScore}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center text-gray-600">
                  {item.rubricCount}/{rubrics.length}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {item.perRubric.map((pr, i) => {
                      const rubricIdx = rubrics.findIndex(r => r.id === pr.rubricId);
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded ${gradeBgColor(pr.grade)}`}
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
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-gray-400">
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
                  className="text-xs border border-emerald-300 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                >
                  Toon volgende {Math.min(PAGE_SIZE, hiddenCount)}
                </button>
                <button
                  onClick={() => setVisibleCount(sorted.length)}
                  className="text-xs border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Toon alles ({sorted.length})
                </button>
              </>
            )}
            {isShowingAll && (
              <button
                onClick={() => setVisibleCount(PAGE_SIZE)}
                className="text-xs border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Toon top {PAGE_SIZE}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expanded detail */}
      {expandedRemedy && (
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
          {(() => {
            const item = sorted.find(s => s.name === expandedRemedy);
            if (!item) return null;
            return (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">{item.name} — Totaal: {item.totalScore}</h4>
                <div className="space-y-1">
                  {item.perRubric.map((pr, i) => {
                    const rubricIdx = rubrics.findIndex(r => r.id === pr.rubricId);
                    return (
                      <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded ${gradeBgColor(pr.grade)}`}>
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
