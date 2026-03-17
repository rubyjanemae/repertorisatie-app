'use client';

import { Case } from '@/lib/types';
import { useState } from 'react';

interface CaseManagerProps {
  cases: Case[];
  activeCaseId: string | null;
  onSelectCase: (id: string) => void;
  onCreateCase: (name: string) => void;
  onRenameCase: (id: string, name: string) => void;
  onDeleteCase: (id: string) => void;
  onDuplicateCase: (id: string) => void;
}

export default function CaseManager({
  cases,
  activeCaseId,
  onSelectCase,
  onCreateCase,
  onRenameCase,
  onDeleteCase,
  onDuplicateCase,
}: CaseManagerProps) {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateCase(newName.trim());
      setNewName('');
      setShowNew(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRenameCase(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-display text-sm font-semibold text-warm-text-secondary uppercase tracking-widest">
          Casussen
        </h2>
        <div className="flex-1 h-px bg-warm-border-subtle" />
        <button
          onClick={() => setShowNew(true)}
          className="text-xs font-body font-semibold text-forest hover:text-forest-dark bg-forest-light hover:bg-forest-light/80 px-3 py-1.5 rounded-lg border border-forest/10 transition-all duration-200"
        >
          + Nieuwe casus
        </button>
      </div>

      {showNew && (
        <div className="flex gap-2 mb-3 animate-fade-in">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Naam van de casus..."
            className="input-materia flex-1"
            autoFocus
          />
          <button onClick={handleCreate} className="btn-primary text-xs py-1.5">
            Toevoegen
          </button>
          <button
            onClick={() => { setShowNew(false); setNewName(''); }}
            className="text-sm text-warm-text-muted hover:text-warm-text px-2 transition-colors"
          >
            Annuleer
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {cases.map(c => (
          <div key={c.id} className="relative">
            {editingId === c.id ? (
              <div className="flex gap-1 animate-fade-in">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRename(c.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="input-materia text-sm py-1 !border-forest"
                  autoFocus
                />
                <button onClick={() => handleRename(c.id)} className="text-xs text-forest hover:text-forest-dark font-semibold px-1">
                  ✓
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectCase(c.id)}
                className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 border font-body ${
                  activeCaseId === c.id
                    ? 'bg-forest-dark text-cream border-forest-dark shadow-md shadow-forest/10'
                    : 'bg-warm-white text-warm-text border-warm-border-subtle hover:border-forest/30 hover:bg-forest-light/50'
                }`}
              >
                <span className="mr-1.5 font-medium">{c.name}</span>
                <span className={`text-xs font-mono ${activeCaseId === c.id ? 'text-cream/40' : 'text-warm-text-muted'}`}>
                  ({c.rubrics.length}R)
                </span>

                {/* Menu knop */}
                <span
                  onClick={e => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === c.id ? null : c.id);
                  }}
                  className={`ml-2 inline-block transition-colors ${
                    activeCaseId === c.id
                      ? 'text-cream/30 hover:text-cream'
                      : 'text-warm-text-muted/50 hover:text-warm-text-secondary'
                  }`}
                >
                  ⋮
                </span>
              </button>
            )}

            {/* Dropdown menu */}
            {menuOpen === c.id && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                <div className="absolute top-full left-0 mt-1.5 bg-warm-white border border-warm-border rounded-lg shadow-lg z-20 py-1 min-w-[160px] animate-fade-in">
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditName(c.name);
                      setMenuOpen(null);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-parchment text-warm-text-secondary font-body transition-colors"
                  >
                    Hernoemen
                  </button>
                  <button
                    onClick={() => {
                      onDuplicateCase(c.id);
                      setMenuOpen(null);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-parchment text-warm-text-secondary font-body transition-colors"
                  >
                    Dupliceren
                  </button>
                  <div className="h-px bg-warm-border-subtle mx-2 my-1" />
                  <button
                    onClick={() => {
                      if (confirm(`Weet je zeker dat je "${c.name}" wilt verwijderen?`)) {
                        onDeleteCase(c.id);
                      }
                      setMenuOpen(null);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-danger-light text-danger font-body transition-colors"
                  >
                    Verwijderen
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
