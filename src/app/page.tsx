'use client';

import { useState, useEffect, useCallback } from 'react';
import { Case, Rubric, SavedRubric, DifferentialDiagnosis } from '@/lib/types';
import { parseRemedies } from '@/lib/parseRemedies';
import { createSampleCase, createSampleLibrary } from '@/lib/sampleData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { lookupRemedies } from '@/lib/repertoryLookup';
import { checkForSharedCase, clearShareParam } from '@/lib/shareCase';
import { shareRubric } from '@/lib/sharedRubrics';
import CaseManager from '@/components/CaseManager';
import RubricInput from '@/components/RubricInput';
import RepertorisationTable from '@/components/RepertorisationTable';
import ExportButtons from '@/components/ExportButtons';
import TranslationTool from '@/components/TranslationTool';
import RepertorySidebar from '@/components/RepertorySidebar';
import DDBuilder from '@/components/DDBuilder';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function Home() {
  // Hydration guard: voorkom mismatch tussen server en client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [cases, setCases] = useLocalStorage<Case[]>('repertorisatie-cases', []);
  const [activeCaseId, setActiveCaseId] = useLocalStorage<string | null>('repertorisatie-active-case', null);
  const [sampleLoaded, setSampleLoaded] = useLocalStorage<boolean>('repertorisatie-sample-loaded', false);
  const [savedRubrics, setSavedRubrics] = useLocalStorage<SavedRubric[]>('repertorisatie-rubric-library', []);
  const [contributorName, setContributorName] = useLocalStorage<string>('repertorisatie-contributor', '');
  const [ddPerCase, setDdPerCase] = useLocalStorage<Record<string, DifferentialDiagnosis[]>>('repertorisatie-dd', {});
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [activeTab, setActiveTab] = useState<'repertorisatie' | 'dd'>('repertorisatie');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prefillRubricName, setPrefillRubricName] = useState<string | null>(null);
  const [prefillRemedyString, setPrefillRemedyString] = useState<string | null>(null);
  const [isLoadingRemedies, setIsLoadingRemedies] = useState(false);
  const [importedCase, setImportedCase] = useState<Case | null>(null);

  // Toon naamprompt als contributor nog niet ingesteld is
  useEffect(() => {
    if (mounted && !contributorName) {
      setShowNamePrompt(true);
    }
  }, [mounted, contributorName]);

  // Check of er een gedeelde casus in de URL zit
  useEffect(() => {
    const shared = checkForSharedCase();
    if (shared) {
      setImportedCase(shared);
    }
  }, []);

  // Laad sample data als het de eerste keer is
  if (!sampleLoaded && cases.length === 0) {
    const sample = createSampleCase();
    setCases([sample]);
    setActiveCaseId(sample.id);
    setSavedRubrics(createSampleLibrary());
    setSampleLoaded(true);
  }

  // Migratie: vul bibliotheek als die leeg is maar er al casussen bestaan
  if (savedRubrics.length === 0 && cases.length > 0) {
    const libraryFromCases: SavedRubric[] = [];
    for (const c of cases) {
      for (const r of c.rubrics) {
        const remedyString = r.remedies
          .map(rem => rem.displayName + (rem.grade === 4 ? ' (4)' : ''))
          .join(', ');
        if (!libraryFromCases.find(lr => lr.name.toLowerCase() === r.name.toLowerCase())) {
          libraryFromCases.push({
            name: r.name,
            remedyString,
            remedyCount: r.remedies.length,
            lastUsed: r.createdAt,
            usageCount: 1,
          });
        }
      }
    }
    if (libraryFromCases.length > 0) {
      setSavedRubrics(libraryFromCases);
    }
  }

  const activeCase = cases.find(c => c.id === activeCaseId) || null;

  const updateCase = useCallback((id: string, updater: (c: Case) => Case) => {
    setCases(prev => prev.map(c => c.id === id ? updater(c) : c));
  }, [setCases]);

  // Case acties
  const handleCreateCase = useCallback((name: string) => {
    const newCase: Case = {
      id: generateId(),
      name,
      rubrics: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCases(prev => [...prev, newCase]);
    setActiveCaseId(newCase.id);
  }, [setCases, setActiveCaseId]);

  const handleRenameCase = useCallback((id: string, name: string) => {
    updateCase(id, c => ({ ...c, name, updatedAt: Date.now() }));
  }, [updateCase]);

  const handleDeleteCase = useCallback((id: string) => {
    setCases(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (activeCaseId === id) {
        setActiveCaseId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  }, [setCases, activeCaseId, setActiveCaseId]);

  const handleDuplicateCase = useCallback((id: string) => {
    const original = cases.find(c => c.id === id);
    if (!original) return;
    const dup: Case = {
      ...original,
      id: generateId(),
      name: `${original.name} (kopie)`,
      rubrics: original.rubrics.map(r => ({ ...r, id: generateId() })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCases(prev => [...prev, dup]);
    setActiveCaseId(dup.id);
  }, [cases, setCases, setActiveCaseId]);

  // Rubriek acties
  const handleAddRubric = useCallback((name: string, remedyString: string) => {
    if (!activeCaseId) return;
    const newRubric: Rubric = {
      id: generateId(),
      name,
      remedies: parseRemedies(remedyString),
      createdAt: Date.now(),
    };
    updateCase(activeCaseId, c => ({
      ...c,
      rubrics: [...c.rubrics, newRubric],
      updatedAt: Date.now(),
    }));

    // Sla de rubriek op in de bibliotheek
    setSavedRubrics(prev => {
      const existing = prev.findIndex(r => r.name.toLowerCase() === name.trim().toLowerCase());
      if (existing >= 0) {
        // Update bestaande rubriek
        return prev.map((r, i) => i === existing ? {
          ...r,
          remedyString: remedyString.trim(),
          remedyCount: parseRemedies(remedyString).length,
          lastUsed: Date.now(),
          usageCount: r.usageCount + 1,
        } : r);
      } else {
        // Nieuwe rubriek toevoegen
        return [...prev, {
          name: name.trim(),
          remedyString: remedyString.trim(),
          remedyCount: parseRemedies(remedyString).length,
          lastUsed: Date.now(),
          usageCount: 1,
        }];
      }
    });
  }, [activeCaseId, updateCase, setSavedRubrics]);

  const handleDeleteRubric = useCallback((rubricId: string) => {
    if (!activeCaseId) return;
    updateCase(activeCaseId, c => ({
      ...c,
      rubrics: c.rubrics.filter(r => r.id !== rubricId),
      updatedAt: Date.now(),
    }));
  }, [activeCaseId, updateCase]);

  // Deel een rubriek met de community via Supabase
  const handleShareRubric = useCallback(async (name: string, remedyString: string): Promise<boolean> => {
    const result = await shareRubric(name, remedyString, contributorName || 'Anoniem');
    return result.success;
  }, [contributorName]);

  // DD per casus
  const activeDDList = activeCaseId ? (ddPerCase[activeCaseId] || []) : [];
  const handleDDUpdate = useCallback((newList: DifferentialDiagnosis[]) => {
    if (!activeCaseId) return;
    setDdPerCase(prev => ({ ...prev, [activeCaseId]: newList }));
  }, [activeCaseId, setDdPerCase]);

  // Toon een lege container tijdens SSR om hydration mismatch te voorkomen
  if (!mounted) {
    return (
      <div className="min-h-screen bg-parchment">
        <header className="bg-forest-dark/95 backdrop-blur-xl sticky top-0 z-40 border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 animate-pulse" />
              <span className="font-display text-xl text-cream tracking-tight">Repertorisatie</span>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Repertorium Sidebar */}
      <RepertorySidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectRubric={async (name) => {
          setPrefillRubricName(name);
          setPrefillRemedyString(null);
          setSidebarOpen(false);
          setIsLoadingRemedies(true);
          try {
            const result = await lookupRemedies(name);
            if (result.found) {
              setPrefillRemedyString(result.remedyString);
            }
          } catch (err) {
            console.warn('Kon middelen niet opzoeken:', err);
          } finally {
            setIsLoadingRemedies(false);
          }
        }}
      />

      {/* Header */}
      <header className="bg-forest-dark/95 backdrop-blur-xl sticky top-0 z-40 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  sidebarOpen
                    ? 'bg-gold/20 text-gold'
                    : 'text-cream/50 hover:bg-white/10 hover:text-cream'
                }`}
                title="Repertorium openen"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
                  <span className="font-display text-gold text-sm italic">RP</span>
                </div>
                <div>
                  <h1 className="font-display text-lg text-cream tracking-tight leading-tight">Repertorisatie</h1>
                  <p className="text-[10px] text-cream/30 font-body tracking-wider uppercase">Acute Anamnese</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {contributorName && (
                <button
                  onClick={() => { setNameInput(contributorName); setShowNamePrompt(true); }}
                  className="text-[10px] text-cream/30 hover:text-cream/60 font-body hidden sm:block transition-colors"
                  title="Naam wijzigen"
                >
                  {contributorName}
                </button>
              )}
              <span className="text-xs text-cream/25 font-body hidden sm:block">
                {cases.length} {cases.length === 1 ? 'casus' : 'casussen'}
              </span>
              <TranslationTool />
            </div>
          </div>
        </div>
      </header>

      {/* Import banner voor gedeelde casussen */}
      {importedCase && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 animate-fade-in-up">
          <div className="card-materia border-gold/30 bg-gold-light/50 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-warm-text font-display text-lg">
                Gedeelde casus ontvangen
              </p>
              <p className="text-xs text-warm-text-secondary mt-0.5">
                <span className="font-semibold text-sienna">&ldquo;{importedCase.name}&rdquo;</span>
                {' '}&middot; {importedCase.rubrics.length} rubrieken
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCases(prev => [...prev, importedCase]);
                  setActiveCaseId(importedCase.id);
                  setImportedCase(null);
                  clearShareParam();
                }}
                className="btn-primary text-sm"
              >
                Importeer
              </button>
              <button
                onClick={() => {
                  setImportedCase(null);
                  clearShareParam();
                }}
                className="btn-secondary"
              >
                Negeer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Naam prompt voor community */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/30 backdrop-blur-[2px] animate-fade-in">
          <div className="card-materia w-full max-w-sm mx-4 overflow-hidden shadow-xl">
            <div className="bg-forest-dark px-5 py-4">
              <h3 className="font-display text-lg font-semibold text-cream">Welkom!</h3>
              <p className="text-xs text-cream/50 font-body mt-0.5">
                Hoe heet je? Je naam wordt getoond als je rubrieken deelt.
              </p>
            </div>
            <div className="p-5 space-y-4">
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && nameInput.trim()) {
                    setContributorName(nameInput.trim());
                    setShowNamePrompt(false);
                  }
                }}
                placeholder="bijv. Ruby"
                className="input-materia w-full text-center text-lg"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setContributorName(nameInput.trim() || 'Anoniem');
                    setShowNamePrompt(false);
                  }}
                  className="btn-primary flex-1"
                >
                  {nameInput.trim() ? 'Opslaan' : 'Anoniem doorgaan'}
                </button>
              </div>
              <p className="text-[10px] text-warm-text-muted/60 font-body text-center">
                Je kunt dit later altijd wijzigen
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Case Manager */}
        <div className="animate-fade-in-up stagger-1">
          <CaseManager
            cases={cases}
            activeCaseId={activeCaseId}
            onSelectCase={setActiveCaseId}
            onCreateCase={handleCreateCase}
            onRenameCase={handleRenameCase}
            onDeleteCase={handleDeleteCase}
            onDuplicateCase={handleDuplicateCase}
          />
        </div>

        {/* Actieve casus content */}
        {activeCase ? (
          <>
            {/* Tab navigatie */}
            <div className="animate-fade-in-up stagger-2 mb-4">
              <div className="flex border-b border-warm-border-subtle">
                <button
                  onClick={() => setActiveTab('repertorisatie')}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-body font-semibold transition-all duration-200 border-b-2 -mb-px ${
                    activeTab === 'repertorisatie'
                      ? 'text-forest border-forest bg-forest-light/20'
                      : 'text-warm-text-muted border-transparent hover:text-warm-text-secondary hover:bg-parchment/50'
                  }`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                    <path d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Repertorisatie
                  {activeCase.rubrics.length > 0 && (
                    <span className="text-[10px] bg-forest-light text-forest px-1.5 py-0.5 rounded-full">
                      {activeCase.rubrics.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('dd')}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-body font-semibold transition-all duration-200 border-b-2 -mb-px ${
                    activeTab === 'dd'
                      ? 'text-sienna border-sienna bg-sienna-light/20'
                      : 'text-warm-text-muted border-transparent hover:text-warm-text-secondary hover:bg-parchment/50'
                  }`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 3h5v5"/><path d="M8 3H3v5"/>
                    <path d="M12 22v-8.3a4 4 0 00-1.172-2.872L3 3"/>
                    <path d="m15 9 6-6"/>
                  </svg>
                  Differentiaal Diagnose
                  {activeDDList.length > 0 && (
                    <span className="text-[10px] bg-sienna-light text-sienna px-1.5 py-0.5 rounded-full">
                      {activeDDList.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Tab content */}
            {activeTab === 'repertorisatie' ? (
              <>
                {/* Rubriek invoer */}
                <div className="animate-fade-in-up stagger-2">
                  <RubricInput
                    onAdd={handleAddRubric}
                    savedRubrics={savedRubrics}
                    prefillRubricName={prefillRubricName}
                    prefillRemedyString={prefillRemedyString}
                    isLoadingRemedies={isLoadingRemedies}
                    onPrefillConsumed={() => {
                      setPrefillRubricName(null);
                      setPrefillRemedyString(null);
                    }}
                    contributorName={contributorName}
                    onShareRubric={handleShareRubric}
                  />
                </div>

                {/* Export knoppen */}
                <div className="animate-fade-in-up stagger-3">
                  <ExportButtons caseName={activeCase.name} rubrics={activeCase.rubrics} activeCase={activeCase} />
                </div>

                {/* Repertorisatie tabel */}
                <div className="animate-fade-in-up stagger-4">
                  <RepertorisationTable
                    rubrics={activeCase.rubrics}
                    onDeleteRubric={handleDeleteRubric}
                  />
                </div>
              </>
            ) : (
              /* Differentiaal Diagnose tab */
              <div className="animate-fade-in">
                <DDBuilder
                  ddList={activeDDList}
                  onUpdate={handleDDUpdate}
                />
              </div>
            )}
          </>
        ) : (
          <div className="card-materia p-14 text-center animate-fade-in-up stagger-2">
            <div className="w-16 h-16 rounded-2xl bg-forest-light border border-forest/10 flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-forest">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h2 className="font-display text-2xl font-semibold text-warm-text mb-2">Geen casus geselecteerd</h2>
            <p className="text-warm-text-muted mb-6 max-w-md mx-auto">
              Maak een nieuwe casus aan of selecteer een bestaande om te beginnen met repertoriseren.
            </p>
            <button
              onClick={() => handleCreateCase('Nieuwe casus')}
              className="btn-primary text-sm"
            >
              + Nieuwe casus
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 pt-4">
        <div className="decorative-rule mb-5" />
        <p className="text-center text-[10px] text-warm-text-muted/40 font-body tracking-widest uppercase">
          Repertorisatie · Homeopathische Analyse
        </p>
      </footer>
    </div>
  );
}
