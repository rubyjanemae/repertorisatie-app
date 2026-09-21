'use client';

import { RefObject, useMemo, useState } from 'react';
import { Rubric, Case } from '@/lib/types';
import { tallyRemedies, sortTally } from '@/lib/tallyRemedies';
import { generateShareUrl } from '@/lib/shareCase';
import { gradeToDisplay } from '@/lib/parseRemedies';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  HeadingLevel,
  ShadingType,
  AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';

interface ExportButtonsProps {
  caseName: string;
  rubrics: Rubric[];
  activeCase?: Case | null;
  /** Wrapper rond de resultatentabel; doelwit voor de screenshot-exports */
  tableRef: RefObject<HTMLDivElement | null>;
}

// Kleuren per graad, gelijk aan de tokens in globals.css (zonder #)
const GRADE_COLORS: Record<number, { fill: string; text: string }> = {
  1: { fill: 'f4f4f4', text: '8a8a8a' },
  2: { fill: 'eef4fb', text: '2e7bbd' },
  3: { fill: 'fef7ec', text: 'd4841a' },
  4: { fill: 'fef2f0', text: 'c0392b' },
};

export default function ExportButtons({ caseName, rubrics, activeCase, tableRef }: ExportButtonsProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'json-copied'>('idle');
  const [busy, setBusy] = useState<string | null>(null);

  const tally = useMemo(() => {
    const raw = tallyRemedies(rubrics);
    return sortTally(raw, { field: 'totalScore', direction: 'desc' });
  }, [rubrics]);

  if (rubrics.length === 0) return null;

  const fileBase = `repertorisatie-${caseName.replace(/\s+/g, '_')}`;
  const datum = new Date().toLocaleDateString('nl-NL');

  const exportAsText = () => {
    let text = `REPERTORISATIE: ${caseName}\n`;
    text += `${'='.repeat(60)}\n`;
    text += `Datum: ${datum}\n`;
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

    downloadFile(text, `${fileBase}.txt`, 'text/plain');
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

    downloadFile(csv, `${fileBase}.csv`, 'text/csv');
  };

  /**
   * Legt de resultatentabel vast zoals die nu in de browser staat (zelfde
   * paginering en filters). Wil je alle middelen op de afbeelding, klik dan
   * eerst op "Toon alles"; honderden rijen renderen kost anders tientallen seconden.
   */
  const captureTable = async (): Promise<HTMLCanvasElement | null> => {
    const el = tableRef.current;
    if (!el) return null;

    // Browsers begrenzen canvasgrootte (Chrome: 32767 px per zijde, 268M px totaal);
    // daarboven blijft het canvas leeg. Schaal terug bij lange tabellen.
    const MAX_SIDE = 32000;
    const MAX_AREA = 268_000_000;
    const scale = Math.min(
      2,
      MAX_SIDE / el.scrollHeight,
      MAX_SIDE / el.scrollWidth,
      Math.sqrt(MAX_AREA / (el.scrollWidth * el.scrollHeight)),
    );
    return await html2canvas(el, {
      backgroundColor: '#ffffff',
      scale,
      useCORS: true,
      logging: false,
      ignoreElements: node => node instanceof HTMLElement && node.hasAttribute('data-export-hide'),
    });
  };

  const exportAsImage = async (format: 'png' | 'jpeg') => {
    setBusy(format);
    try {
      const canvas = await captureTable();
      if (!canvas) return;
      const ext = format === 'png' ? 'png' : 'jpg';
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, `image/${format}`, 0.92)
      );
      if (blob) saveAs(blob, `${fileBase}.${ext}`);
    } finally {
      setBusy(null);
    }
  };

  const exportAsPdf = async () => {
    setBusy('pdf');
    try {
      const canvas = await captureTable();
      if (!canvas) return;

      const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
      const margin = 28;
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - margin * 2;
      const pxPerPt = canvas.width / imgW;
      const sliceHeightPx = Math.floor((pageH - margin * 2) * pxPerPt);

      // Lange tabellen worden in stukken over meerdere pagina's verdeeld
      for (let offset = 0, page = 0; offset < canvas.height; offset += sliceHeightPx, page++) {
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = Math.min(sliceHeightPx, canvas.height - offset);
        const ctx = slice.getContext('2d');
        if (!ctx) break;
        ctx.drawImage(canvas, 0, offset, canvas.width, slice.height, 0, 0, canvas.width, slice.height);

        if (page > 0) pdf.addPage();
        pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, imgW, slice.height / pxPerPt);
      }

      pdf.save(`${fileBase}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  const exportAsDocx = async () => {
    setBusy('docx');
    try {
      const cell = (text: string, opts: { bold?: boolean; color?: string; fill?: string; center?: boolean } = {}) =>
        new TableCell({
          shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill, color: 'auto' } : undefined,
          children: [
            new Paragraph({
              alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
              children: [new TextRun({ text, bold: opts.bold, color: opts.color, size: 18 })],
            }),
          ],
        });

      const headerFill = '1b3a2d';
      const headerRow = new TableRow({
        tableHeader: true,
        children: [
          cell('#', { bold: true, color: 'ffffff', fill: headerFill }),
          cell('Middel', { bold: true, color: 'ffffff', fill: headerFill }),
          cell('Score', { bold: true, color: 'ffffff', fill: headerFill, center: true }),
          cell('Rubr.', { bold: true, color: 'ffffff', fill: headerFill, center: true }),
          ...rubrics.map((_, i) => cell(`R${i + 1}`, { bold: true, color: 'ffffff', fill: headerFill, center: true })),
        ],
      });

      const bodyRows = tally.map((item, idx) => {
        const top3 = idx < 3;
        return new TableRow({
          children: [
            cell(String(idx + 1)),
            cell(item.name, { bold: top3 }),
            cell(String(item.totalScore), { bold: true, center: true }),
            cell(`${item.rubricCount}/${rubrics.length}`, { center: true }),
            ...rubrics.map(r => {
              const pr = item.perRubric.find(p => p.rubricId === r.id);
              if (!pr) return cell('');
              const c = GRADE_COLORS[pr.grade];
              return cell(gradeToDisplay(pr.grade), { bold: pr.grade >= 3, color: c.text, fill: c.fill, center: true });
            }),
          ],
        });
      });

      const doc = new Document({
        sections: [
          {
            properties: { page: { size: { orientation: rubrics.length > 6 ? 'landscape' : 'portrait' } } },
            children: [
              new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(`Repertorisatie: ${caseName}`)] }),
              new Paragraph({ children: [new TextRun({ text: `Datum: ${datum}  ·  Rubrieken: ${rubrics.length}  ·  Middelen: ${tally.length}`, color: '5c5c5c' })] }),
              new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Rubrieken')] }),
              ...rubrics.map((r, i) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `R${i + 1}: `, bold: true }),
                    new TextRun(`${r.name} (${r.remedies.length} middelen)`),
                  ],
                })
              ),
              new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Resultaten')] }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [headerRow, ...bodyRows],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${fileBase}.docx`);
    } finally {
      setBusy(null);
    }
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

  const exportButton = (label: string, key: string, onClick: () => void) => (
    <button onClick={onClick} disabled={busy !== null} className="btn-secondary disabled:opacity-50">
      {busy === key ? 'Bezig…' : label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <span className="text-[11px] text-warm-text-muted font-body uppercase tracking-wider mr-1">Exporteer</span>
      {exportButton('Tekst', 'txt', exportAsText)}
      {exportButton('CSV', 'csv', exportAsCsv)}
      {exportButton('PNG', 'png', () => exportAsImage('png'))}
      {exportButton('JPG', 'jpeg', () => exportAsImage('jpeg'))}
      {exportButton('PDF', 'pdf', exportAsPdf)}
      {exportButton('Word', 'docx', exportAsDocx)}
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
  saveAs(blob, filename);
}
