// Types voor de Repertorisatie App

export interface Remedy {
  name: string;       // Middel naam (lowercase canonical form, e.g. "acon")
  displayName: string; // Originele weergave naam
  grade: 1 | 2 | 3 | 4;
}

export interface Rubric {
  id: string;
  name: string;         // Rubriek naam, e.g. "Generals - Sun - exposure to sun"
  remedies: Remedy[];
  createdAt: number;
}

export interface RemedyTally {
  name: string;          // canonical lowercase
  displayName: string;   // Meest voorkomende weergave
  totalScore: number;
  rubricCount: number;   // In hoeveel rubrieken het voorkomt
  perRubric: {
    rubricId: string;
    rubricName: string;
    grade: 1 | 2 | 3 | 4;
  }[];
}

export interface Case {
  id: string;
  name: string;
  rubrics: Rubric[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  cases: Case[];
  activeCaseId: string | null;
}

export type SortField = 'totalScore' | 'rubricCount' | 'name';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  minScore: number;
  minRubrics: number;
  searchTerm: string;
}

// Opgeslagen rubriek in de bibliotheek (met originele invoertekst)
export interface SavedRubric {
  name: string;           // Rubriek naam
  remedyString: string;   // Originele invoertekst (zodat graden behouden blijven)
  remedyCount: number;    // Aantal middelen
  lastUsed: number;       // Timestamp
  usageCount: number;     // Hoe vaak gebruikt
}

// Differentiaal Diagnose
export type DDCategory = 'causa' | 'mind' | 'pijnSensatie' | 'uitscheiding' | 'modErger' | 'modBeter' | 'sleutelSx';

export const DD_CATEGORIES: { key: DDCategory; label: string; icon: string }[] = [
  { key: 'causa', label: 'Causa', icon: '⚡' },
  { key: 'mind', label: 'Mind / CP', icon: '🧠' },
  { key: 'pijnSensatie', label: 'Pijn / Sensatie', icon: '💢' },
  { key: 'uitscheiding', label: 'Uitscheiding', icon: '💧' },
  { key: 'modErger', label: 'Mod <', icon: '🔴' },
  { key: 'modBeter', label: 'Mod >', icon: '🟢' },
  { key: 'sleutelSx', label: 'Sleutel SX', icon: '🔑' },
];

export interface DDRemedyData {
  abbr: string;
  fullName: string;
  cells: Record<DDCategory, string>;  // tekst per categorie
}

export interface DifferentialDiagnosis {
  id: string;
  title: string;          // bijv. "Oorontsteking"
  remedies: DDRemedyData[];
  createdAt: number;
  updatedAt: number;
}
