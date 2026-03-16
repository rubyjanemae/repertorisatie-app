'use client';

import { Rubric, RemedyTally } from '@/lib/types';
import { tallyRemedies, sortTally } from '@/lib/tallyRemedies';
import { useMemo } from 'react';

interface ExportButtonsProps {
  caseName: string;
  rubrics: Rubric[];
}

export default function ExportButtons({ caseName, rubrics }: ExportButtonsProps) {
  const tally = useMemo(() => {
    const raw = tallyRemedies(rubrics);
    return sortTally(raw, { field: 'totalScore', direction: 'desc' });
  }, [rubrics]);

  if (rubrics.length === 0) return null;

  const exportAsText = () => {
    let text = `REPERTORISATIE: ${caseName}\n`;
    text += `${'='.repeat(60)}\n`;
    text += `Datum: ${new Date().toLocaleDateString('nl-NL')}\n`;
    text += `Rubrieken: ${rubrics.length}\n`;
    text += `Middelen: ${tally.length}\n\n`;

    // Rubrieken overzicht
    text += `RUBRIEKEN:\n${'-'.repeat(40)}\n`;
    rubrics.forEach((r, i) => {
      text += `R${i + 1}: ${r.name} (${r.remedies.length} middelen)\n`;
    });
    text += '\n';

    // Top middelen
    text += `RESULTATEN (gesorteerd op totaalscore):\n${'-'.repeat(60)}\n`;
    text += `${'#'.padStart(4)}  ${'Middel'.padEnd(16)}  ${'Score'.padStart(6)}  ${'Rubr.'.padStart(6)}  Per rubriek\n`;
    text += `${'-'.repeat(60)}\n`;

    tally.forEach((item, idx) => {
      const perRubric = item.perRubric
        .map(pr => {
          const ri = rubrics.findIndex(r => r.id === pr.rubricId);
          return `R${ri + 1}:${pr.grade}`;
        })
        .join(' ');

      text += `${String(idx + 1).padStart(4)}  ${item.name.padEnd(16)}  ${String(item.totalScore).padStart(6)}  ${`${item.rubricCount}/${rubrics.length}`.padStart(6)}  ${perRubric}\n`;
    });

    downloadFile(text, `repertorisatie-${caseName.replace(/\s+/g, '_')}.txt`, 'text/plain');
  };

  const exportAsCsv = () => {
    const headers = ['#', 'Middel', 'Totaalscore', 'Rubrieken'];
    rubrics.forEach((_, i) => headers.push(`R${i + 1}`));

    const rows = tally.map((item, idx) => {
      const row = [
        String(idx + 1),
        item.name,
        String(item.totalScore),
        `${item.rubricCount}/${rubrics.length}`,
      ];
      rubrics.forEach(r => {
        const pr = item.perRubric.find(p => p.rubricId === r.id);
        row.push(pr ? String(pr.grade) : '');
      });
      return row;
    });

    let csv = headers.join(';') + '\n';
    csv += rows.map(r => r.join(';')).join('\n');

    downloadFile(csv, `repertorisatie-${caseName.replace(/\s+/g, '_')}.csv`, 'text/csv');
  };

  const exportAsHtml = () => {
    let html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Repertorisatie: ${caseName}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; max-width: 1200px; margin: 0 auto; color: #333; }
    h1 { color: #065f46; border-bottom: 2px solid #065f46; padding-bottom: 0.5rem; }
    h2 { color: #047857; margin-top: 2rem; }
    .meta { color: #666; margin-bottom: 2rem; }
    table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
    th { background: #065f46; color: white; padding: 8px 12px; text-align: left; font-size: 0.85rem; }
    td { padding: 6px 12px; border-bottom: 1px solid #e5e7eb; font-size: 0.85rem; }
    tr:nth-child(even) { background: #f9fafb; }
    tr:hover { background: #ecfdf5; }
    .top3 { background: #ecfdf5 !important; font-weight: 600; }
    .grade-1 { color: #6b7280; }
    .grade-2 { color: #2563eb; font-weight: 500; }
    .grade-3 { color: #ea580c; font-weight: 700; }
    .grade-4 { color: #dc2626; font-weight: 800; }
    .badge { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem; margin: 1px; }
    .badge-1 { background: #f3f4f6; color: #4b5563; }
    .badge-2 { background: #dbeafe; color: #1e40af; }
    .badge-3 { background: #ffedd5; color: #c2410c; }
    .badge-4 { background: #fee2e2; color: #b91c1c; }
    .rubric-list { margin-top: 0.5rem; }
    .rubric-item { padding: 4px 0; color: #555; font-size: 0.85rem; }
  </style>
</head>
<body>
  <h1>Repertorisatie: ${caseName}</h1>
  <div class="meta">
    <p>Datum: ${new Date().toLocaleDateString('nl-NL')}</p>
    <p>Rubrieken: ${rubrics.length} | Middelen: ${tally.length}</p>
  </div>

  <h2>Rubrieken</h2>
  <div class="rubric-list">
    ${rubrics.map((r, i) => `<div class="rubric-item"><strong>R${i + 1}:</strong> ${r.name} (${r.remedies.length} middelen)</div>`).join('\n    ')}
  </div>

  <h2>Resultaten</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Middel</th>
        <th>Score</th>
        <th>Rubr.</th>
        <th>Per rubriek</th>
      </tr>
    </thead>
    <tbody>
      ${tally.map((item, idx) => {
        const badges = item.perRubric.map(pr => {
          const ri = rubrics.findIndex(r => r.id === pr.rubricId);
          return `<span class="badge badge-${pr.grade}">R${ri + 1}:${pr.grade}</span>`;
        }).join(' ');

        return `<tr class="${idx < 3 ? 'top3' : ''}">
        <td>${idx + 1}</td>
        <td>${item.name}</td>
        <td><strong>${item.totalScore}</strong></td>
        <td>${item.rubricCount}/${rubrics.length}</td>
        <td>${badges}</td>
      </tr>`;
      }).join('\n      ')}
    </tbody>
  </table>
</body>
</html>`;

    downloadFile(html, `repertorisatie-${caseName.replace(/\s+/g, '_')}.html`, 'text/html');
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-xs text-gray-500 self-center mr-1">Exporteer:</span>
      <button
        onClick={exportAsText}
        className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
      >
        📄 Tekst
      </button>
      <button
        onClick={exportAsCsv}
        className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
      >
        📊 CSV (Excel)
      </button>
      <button
        onClick={exportAsHtml}
        className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
      >
        🌐 HTML (print)
      </button>
    </div>
  );
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
