'use client';

import { useState } from 'react';
import { searchTranslations, TranslationEntry } from '@/lib/translations';
import { searchRemedies, RemedyInfo } from '@/lib/remedyDatabase';

type Tab = 'vertaling' | 'middelen';

export default function TranslationTool() {
  const [query, setQuery] = useState('');
  const [translationResults, setTranslationResults] = useState<TranslationEntry[]>([]);
  const [remedyResults, setRemedyResults] = useState<RemedyInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('vertaling');

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      setTranslationResults(searchTranslations(value));
      setRemedyResults(searchRemedies(value));
    } else {
      setTranslationResults([]);
      setRemedyResults([]);
    }
  };

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case 'rubric': return 'Rubriek';
      case 'body': return 'Lichaamsdeel';
      case 'symptom': return 'Symptoom';
      case 'general': return 'Algemeen';
      default: return cat;
    }
  };

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'rubric': return 'bg-purple-100 text-purple-700';
      case 'body': return 'bg-blue-100 text-blue-700';
      case 'symptom': return 'bg-amber-100 text-amber-700';
      case 'general': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="relative">
      {/* Trigger knop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
          isOpen
            ? 'bg-indigo-600 text-white border-indigo-700'
            : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
        }`}
      >
        <span>🔤</span>
        <span className="font-medium">Vertaler</span>
      </button>

      {/* Dropdown paneel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-[420px] bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('vertaling')}
                className={`flex-1 text-xs font-medium py-2.5 transition-colors ${
                  activeTab === 'vertaling'
                    ? 'text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                NL ↔ EN Vertaling
                {query.length >= 2 && translationResults.length > 0 && (
                  <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 rounded-full">
                    {translationResults.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('middelen')}
                className={`flex-1 text-xs font-medium py-2.5 transition-colors ${
                  activeTab === 'middelen'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Middelen (Boericke)
                {query.length >= 2 && remedyResults.length > 0 && (
                  <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-600 px-1.5 rounded-full">
                    {remedyResults.length}
                  </span>
                )}
              </button>
            </div>

            {/* Zoekbalk */}
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <input
                type="text"
                value={query}
                onChange={e => handleSearch(e.target.value)}
                placeholder={activeTab === 'vertaling'
                  ? 'Zoek in Nederlands of Engels...'
                  : 'Zoek op afkorting of volledige naam...'
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Resultaten */}
            <div className="max-h-80 overflow-y-auto">
              {query.trim().length < 2 ? (
                <p className="text-center text-gray-400 text-sm py-6">
                  Typ minimaal 2 letters om te zoeken
                </p>
              ) : activeTab === 'vertaling' ? (
                /* Vertaling resultaten */
                translationResults.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-6">
                    Geen vertalingen gevonden
                  </p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {translationResults.map((entry, i) => (
                      <div key={i} className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{entry.nl}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-sm font-medium text-indigo-600">{entry.en}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColor(entry.category)}`}>
                          {categoryLabel(entry.category)}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Middelen resultaten */
                remedyResults.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-6">
                    Geen middelen gevonden
                  </p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {remedyResults.slice(0, 50).map((remedy, i) => (
                      <div key={i} className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-emerald-700 font-mono">
                              {remedy.abbr}
                            </span>
                            <span className="text-gray-400">—</span>
                            <span className="text-sm text-gray-700">
                              {remedy.fullName}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {remedyResults.length > 50 && (
                      <p className="text-center text-gray-400 text-xs py-2">
                        ...en {remedyResults.length - 50} meer
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
