'use client';

import { useState, useEffect, useCallback } from 'react';
import { Case, Rubric, SavedRubric } from '@/lib/types';
import { parseRemedies } from '@/lib/parseRemedies';
import { createSampleCase, createSampleLibrary } from '@/lib/sampleData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { lookupRemedies } from '@/lib/repertoryLookup';
import { checkForSharedCase, clearShareParam } from '@/lib/shareCase';
import CaseManager from '@/components/CaseManager';
import RubricInput from '@/components/RubricInput';
import RepertorisationTable from '@/components/RepertorisationTable';
import ExportButtons from '@/components/ExportButtons';
import TranslationTool from '@/components/TranslationTool';
import RepertorySidebar from '@/components/RepertorySidebar';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prefillRubricName, setPrefillRubricName] = useState<string | null>(null);
  const [prefillRemedyString, setPrefillRemedyString] = useState<string | null>(null);
  const [isLoadingRemedies, setIsLoadingRemedies] = useState(false);
  const [importedCase, setImportedCase] = useState<Case | null>(null);

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

  // Toon een lege container tijdens SSR om hydration mismatch te voorkomen
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-lg font-bold">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Repertorisatie</h1>
                <p className="text-xs text-gray-500">Homeopathische acute anamnese</p>
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
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
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                  sidebarOpen
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
                title="Repertorium openen"
              >
                <span className="text-lg">📖</span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-lg font-bold">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Repertorisatie</h1>
                <p className="text-xs text-gray-500">Homeopathische acute anamnese</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">
                {cases.length} {cases.length === 1 ? 'casus' : 'casussen'} opgeslagen
              </span>
              <TranslationTool />
            </div>
          </div>
        </div>
      </header>

      {/* Import banner voor gedeelde casussen */}
      {importedCase && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-800">
                📥 Gedeelde casus ontvangen: <span className="text-indigo-600">&ldquo;{importedCase.name}&rdquo;</span>
              </p>
              <p className="text-xs text-indigo-600 mt-0.5">
                {importedCase.rubrics.length} rubrieken · Klik op &ldquo;Importeer&rdquo; om deze toe te voegen
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
                className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Importeer
              </button>
              <button
                onClick={() => {
                  setImportedCase(null);
                  clearShareParam();
                }}
                className="text-sm text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Negeer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Case Manager */}
        <CaseManager
          cases={cases}
          activeCaseId={activeCaseId}
          onSelectCase={setActiveCaseId}
          onCreateCase={handleCreateCase}
          onRenameCase={handleRenameCase}
          onDeleteCase={handleDeleteCase}
          onDuplicateCase={handleDuplicateCase}
        />

        {/* Actieve casus content */}
        {activeCase ? (
          <>
            {/* Rubriek invoer */}
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
            />

            {/* Export knoppen */}
            <ExportButtons caseName={activeCase.name} rubrics={activeCase.rubrics} activeCase={activeCase} />

            {/* Repertorisatie tabel */}
            <RepertorisationTable
              rubrics={activeCase.rubrics}
              onDeleteRubric={handleDeleteRubric}
            />
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Geen casus geselecteerd</h2>
            <p className="text-gray-400 mb-4">
              Maak een nieuwe casus aan of selecteer een bestaande om te beginnen.
            </p>
            <button
              onClick={() => handleCreateCase('Nieuwe casus')}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              + Nieuwe casus
            </button>
          </div>
        )}
      </main>

    </div>
  );
}
