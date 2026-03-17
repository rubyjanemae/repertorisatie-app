'use client';

import { Rubric, Case } from '@/lib/types';
import { tallyRemedies, sortTally } from '@/lib/tallyRemedies';
import { generateShareUrl } from '@/lib/shareCase';
import { useMemo, useState } from 'react';

interface ExportButtonsProps {
  caseName: string;
  rubrics: Rubric[];
  activeCase?: Case | null;
}

export default function ExportButtons({ caseName, rubrics, activeCase }: ExportButtonsProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'json-copied'>('idle');

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
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; max-width: 1200px; margin: 0 auto; color: #2d2a24; background: #faf7f2; }
    h1 { color: #3d6b4e; border-bottom: 2px solid #c4973b; padding-bottom: 0.5rem; font-family: Georgia, serif; }
    h2 { color: #3d6b4e; margin-top: 2rem; font-family: Georgia, serif; }
    .meta { color: #6b6456; margin-bottom: 2rem; }
    table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
    th { background: #2d3830; color: #faf7f2; padding: 8px 12px; text-align: left; font-size: 0.85rem; }
    td { padding: 6px 12px; border-bottom: 1px solid #e8dfd0; font-size: 0.85rem; }
    tr:nth-child(even) { background: #f5f0e8; }
    tr:hover { background: #e8f0eb; }
    .top3 { background: #e8f0eb !important; font-weight: 600; }
    .grade-1 { color: #8a8379; }
    .grade-2 { color: #3468a3; font-weight: 500; }
    .grade-3 { color: #c77c2a; font-weight: 700; }
    .grade-4 { color: #a62b1f; font-weight: 800; }
    .badge { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem; margin: 1px; }
    .badge-1 { background: #f0ede8; color: #8a8379; }
    .badge-2 { background: #e5eef8; color: #3468a3; }
    .badge-3 { background: #fef3e2; color: #c77c2a; }
    .badge-4 { background: #fde8e5; color: #a62b1f; }
    .rubric-list { margin-top: 0.5rem; }
    .rubric-item { padding: 4px 0; color: #6b6456; font-size: 0.85rem; }
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

  const handleShare = async () => {
    if (!activeCase) return;
    const result = generateShareUrl(activeCase);
    try {
      if (!result.tooLarge) {
        await navigator.clipboard.writeText(result.url);
        setShareStatus('copied');
      } else {
        await navigator.clipboard.writeText(result.json);
        setShareStatus('json-copied');
      }
      setTimeout(() => setShareStatus('idle'), 3000);
    } catch {
      // Fallback als clipboard API niet werkt
      const textArea = document.createElement('textarea');
      textArea.value = result.tooLarge ? result.json : result.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareStatus(result.tooLarge ? 'json-copied' : 'copied');
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <span className="text-[11px] text-warm-text-muted font-body uppercase tracking-wider mr-1">Exporteer</span>
      <button
        onClick={exportAsText}
        className="btn-secondary"
      >
        Tekst
      </button>
      <button
        onClick={exportAsCsv}
        className="btn-secondary"
      >
        CSV
      </button>
      <button
        onClick={exportAsHtml}
        className="btn-secondary"
      >
        HTML
      </button>
      {activeCase && (
        <>
          <span className="w-px h-4 bg-warm-border-subtle mx-1" />
          <button
            onClick={handleShare}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium font-body border ${
              shareStatus === 'copied'
                ? 'bg-forest-light text-forest border-forest/20'
                : shareStatus === 'json-copied'
                ? 'bg-gold-light text-sienna border-gold/30'
                : 'bg-sienna-light text-sienna border-sienna/20 hover:bg-sienna-light/80 hover:border-sienna/30'
            }`}
          >
            {shareStatus === 'copied'
              ? '✓ Link gekopieerd'
              : shareStatus === 'json-copied'
              ? '✓ JSON gekopieerd'
              : 'Deel casus'}
          </button>
        </>
      )}
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
