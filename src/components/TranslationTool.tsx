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
      case 'rubric': return 'bg-sienna-light text-sienna';
      case 'body': return 'bg-grade-2-bg text-grade-2';
      case 'symptom': return 'bg-gold-light text-sienna';
      case 'general': return 'bg-parchment text-warm-text-muted';
      default: return 'bg-parchment text-warm-text-muted';
    }
  };

  return (
    <div className="relative">
      {/* Trigger knop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-body font-medium ${
          isOpen
            ? 'bg-forest-dark text-cream border-forest-dark'
            : 'bg-cream/50 text-cream/70 border-cream/15 hover:bg-cream/10 hover:text-cream hover:border-cream/30'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 8 6 6"/>
          <path d="m4 14 6-6 2-3"/>
          <path d="M2 5h12"/>
          <path d="M7 2h1"/>
          <path d="m22 22-5-10-5 10"/>
          <path d="M14 18h6"/>
        </svg>
        <span>Vertaler</span>
      </button>

      {/* Dropdown paneel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-[420px] card-materia z-50 overflow-hidden animate-fade-in">
            {/* Tabs */}
            <div className="flex border-b border-warm-border-subtle">
              <button
                onClick={() => setActiveTab('vertaling')}
                className={`flex-1 text-xs font-body font-semibold py-2.5 transition-all duration-200 ${
                  activeTab === 'vertaling'
                    ? 'text-sienna border-b-2 border-sienna bg-sienna-light/30'
                    : 'text-warm-text-muted hover:text-warm-text-secondary hover:bg-parchment/50'
                }`}
              >
                NL / EN Vertaling
                {query.length >= 2 && translationResults.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-sienna-light text-sienna px-1.5 py-0.5 rounded-full">
                    {translationResults.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('middelen')}
                className={`flex-1 text-xs font-body font-semibold py-2.5 transition-all duration-200 ${
                  activeTab === 'middelen'
                    ? 'text-forest border-b-2 border-forest bg-forest-light/30'
                    : 'text-warm-text-muted hover:text-warm-text-secondary hover:bg-parchment/50'
                }`}
              >
                Middelen (Boericke)
                {query.length >= 2 && remedyResults.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-forest-light text-forest px-1.5 py-0.5 rounded-full">
                    {remedyResults.length}
                  </span>
                )}
              </button>
            </div>

            {/* Zoekbalk */}
            <div className="p-3 border-b border-warm-border-subtle bg-parchment/50">
              <input
                type="text"
                value={query}
                onChange={e => handleSearch(e.target.value)}
                placeholder={activeTab === 'vertaling'
                  ? 'Zoek in Nederlands of Engels...'
                  : 'Zoek op afkorting of volledige naam...'
                }
                className="input-materia w-full"
                autoFocus
              />
            </div>

            {/* Resultaten */}
            <div className="max-h-80 overflow-y-auto">
              {query.trim().length < 2 ? (
                <p className="text-center text-warm-text-muted text-sm py-8 font-display italic">
                  Typ minimaal 2 letters om te zoeken
                </p>
              ) : activeTab === 'vertaling' ? (
                /* Vertaling resultaten */
                translationResults.length === 0 ? (
                  <p className="text-center text-warm-text-muted text-sm py-8 font-display italic">
                    Geen vertalingen gevonden
                  </p>
                ) : (
                  <div className="divide-y divide-warm-border-subtle/50">
                    {translationResults.map((entry, i) => (
                      <div key={i} className="px-4 py-2.5 hover:bg-parchment/50 flex items-center gap-3 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-warm-text font-body">{entry.nl}</span>
                            <span className="text-gold text-xs">&rarr;</span>
                            <span className="text-sm font-medium text-sienna font-body">{entry.en}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-body ${categoryColor(entry.category)}`}>
                          {categoryLabel(entry.category)}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Middelen resultaten */
                remedyResults.length === 0 ? (
                  <p className="text-center text-warm-text-muted text-sm py-8 font-display italic">
                    Geen middelen gevonden
                  </p>
                ) : (
                  <div className="divide-y divide-warm-border-subtle/50">
                    {remedyResults.slice(0, 50).map((remedy, i) => (
                      <div key={i} className="px-4 py-2.5 hover:bg-parchment/50 flex items-center gap-3 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-forest font-mono">
                              {remedy.abbr}
                            </span>
                            <span className="text-warm-text-muted text-xs">&mdash;</span>
                            <span className="text-sm text-warm-text-secondary font-body italic">
                              {remedy.fullName}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {remedyResults.length > 50 && (
                      <p className="text-center text-warm-text-muted text-xs py-2 font-body">
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
