import { Rubric, RemedyTally, SortConfig, FilterConfig } from './types';

/**
 * Bereken de totaalscore per middel over alle rubrieken
 */
export function tallyRemedies(rubrics: Rubric[]): RemedyTally[] {
  const tallyMap = new Map<string, RemedyTally>();

  for (const rubric of rubrics) {
    for (const remedy of rubric.remedies) {
      const existing = tallyMap.get(remedy.name);

      if (existing) {
        existing.totalScore += remedy.grade;
        existing.rubricCount += 1;
        existing.perRubric.push({
          rubricId: rubric.id,
          rubricName: rubric.name,
          grade: remedy.grade,
        });
        // Gebruik de display naam met de hoogste grade
        if (remedy.grade > Math.max(...existing.perRubric.slice(0, -1).map(r => r.grade))) {
          existing.displayName = remedy.displayName;
        }
      } else {
        tallyMap.set(remedy.name, {
          name: remedy.name,
          displayName: remedy.displayName,
          totalScore: remedy.grade,
          rubricCount: 1,
          perRubric: [{
            rubricId: rubric.id,
            rubricName: rubric.name,
            grade: remedy.grade,
          }],
        });
      }
    }
  }

  return Array.from(tallyMap.values());
}

/**
 * Sorteer de tally resultaten
 */
export function sortTally(tally: RemedyTally[], config: SortConfig): RemedyTally[] {
  const sorted = [...tally];
  const multiplier = config.direction === 'desc' ? -1 : 1;

  sorted.sort((a, b) => {
    switch (config.field) {
      case 'totalScore':
        // Bij gelijke score, sorteer op rubricCount, dan naam
        if (a.totalScore !== b.totalScore) {
          return (a.totalScore - b.totalScore) * multiplier;
        }
        if (a.rubricCount !== b.rubricCount) {
          return (a.rubricCount - b.rubricCount) * multiplier;
        }
        return a.name.localeCompare(b.name);

      case 'rubricCount':
        if (a.rubricCount !== b.rubricCount) {
          return (a.rubricCount - b.rubricCount) * multiplier;
        }
        return (a.totalScore - b.totalScore) * multiplier;

      case 'name':
        return a.name.localeCompare(b.name) * multiplier;

      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Filter de tally resultaten
 */
export function filterTally(tally: RemedyTally[], config: FilterConfig): RemedyTally[] {
  return tally.filter(item => {
    if (item.totalScore < config.minScore) return false;
    if (item.rubricCount < config.minRubrics) return false;
    if (config.searchTerm) {
      const term = config.searchTerm.toLowerCase();
      if (!item.name.includes(term) && !item.displayName.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });
}
