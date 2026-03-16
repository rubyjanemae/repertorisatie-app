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
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Casussen</h2>
        <button
          onClick={() => setShowNew(true)}
          className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full hover:bg-emerald-700 transition-colors"
        >
          + Nieuwe casus
        </button>
      </div>

      {showNew && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Naam van de casus..."
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            autoFocus
          />
          <button onClick={handleCreate} className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">
            Toevoegen
          </button>
          <button onClick={() => { setShowNew(false); setNewName(''); }} className="text-sm text-gray-500 hover:text-gray-700 px-2">
            Annuleer
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {cases.map(c => (
          <div key={c.id} className="relative">
            {editingId === c.id ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRename(c.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="text-sm border border-emerald-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <button onClick={() => handleRename(c.id)} className="text-xs text-emerald-600 hover:text-emerald-800">
                  ✓
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectCase(c.id)}
                className={`text-sm px-4 py-2 rounded-lg transition-all border ${
                  activeCaseId === c.id
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <span className="mr-1">{c.name}</span>
                <span className={`text-xs ${activeCaseId === c.id ? 'text-emerald-200' : 'text-gray-400'}`}>
                  ({c.rubrics.length}R)
                </span>

                {/* Menu knop */}
                <span
                  onClick={e => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === c.id ? null : c.id);
                  }}
                  className={`ml-2 inline-block ${activeCaseId === c.id ? 'text-emerald-200 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ⋮
                </span>
              </button>
            )}

            {/* Dropdown menu */}
            {menuOpen === c.id && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[160px]">
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditName(c.name);
                      setMenuOpen(null);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-gray-50 text-gray-700"
                  >
                    Hernoemen
                  </button>
                  <button
                    onClick={() => {
                      onDuplicateCase(c.id);
                      setMenuOpen(null);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-gray-50 text-gray-700"
                  >
                    Dupliceren
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Weet je zeker dat je "${c.name}" wilt verwijderen?`)) {
                        onDeleteCase(c.id);
                      }
                      setMenuOpen(null);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-red-50 text-red-600"
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
