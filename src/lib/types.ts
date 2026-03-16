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
