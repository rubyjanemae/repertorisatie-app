'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { lookupRemedy } from '@/lib/remedyDatabase';
import { lookupRemedyProfile } from '@/lib/remedyProfiles';

interface RemedyCardProps {
  remedyAbbr: string;
  anchorRect: DOMRect | null;
  onClose: () => void;
}

export default function RemedyCard({ remedyAbbr, anchorRect, onClose }: RemedyCardProps) {
  const remedyInfo = lookupRemedy(remedyAbbr);
  const profile = lookupRemedyProfile(remedyAbbr);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Escape sluit kaart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Bereken positie op basis van anchorRect
  const position = useMemo(() => {
    if (!anchorRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const cardWidth = 380;
    const cardMaxHeight = 480;
    const margin = 8;

    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 768;

    // Onder het element als er ruimte is, anders erboven
    const spaceBelow = viewportH - anchorRect.bottom;
    const showBelow = spaceBelow > cardMaxHeight + margin;

    const top = showBelow
      ? anchorRect.bottom + margin
      : Math.max(margin, anchorRect.top - cardMaxHeight - margin);

    // Horizontaal: start bij het element, clamp aan viewport
    let left = anchorRect.left;
    if (left + cardWidth > viewportW - margin) {
      left = viewportW - cardWidth - margin;
    }
    if (left < margin) left = margin;

    return { top: `${top}px`, left: `${left}px` };
  }, [anchorRect]);

  const displayName = remedyAbbr.charAt(0).toUpperCase() + remedyAbbr.slice(1);

  // Render via portal op document.body om overflow-hidden te ontsnappen
  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-forest-deep/20 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Kaart */}
      <div
        className="fixed z-50 w-[380px] max-w-[calc(100vw-2rem)] card-materia overflow-hidden animate-fade-in shadow-xl"
        style={position}
      >
        {/* Header */}
        <div className="bg-forest-dark px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display text-base font-semibold text-cream">
                {displayName}
              </h4>
              {remedyInfo && (
                <p className="text-xs text-cream/40 font-display italic">
                  {remedyInfo.fullName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Sluiten (Esc)"
            >
              <span className="text-cream/60 text-sm">&times;</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {profile ? (
            <>
              <ProfileSection
                label="Causa"
                icon="⚡"
                items={profile.causa}
                pillClass="bg-sienna/10 text-sienna border-sienna/15"
              />
              <ProfileSection
                label="Pijn / Sensatie"
                icon="💢"
                items={profile.pijnSensatie}
                pillClass="bg-grade-4-bg/40 text-grade-4 border-grade-4/15"
              />
              <ProfileSection
                label="Opvallendheden"
                icon="✦"
                items={profile.opvallendheden}
                pillClass="bg-gold-light text-sienna border-gold/20"
              />
              <ModaliteitenSection
                erger={profile.modaliteiten.erger}
                beter={profile.modaliteiten.beter}
              />
              <ProfileSection
                label="Sleutel SX"
                icon="🔑"
                items={profile.sleutelSx}
                pillClass="bg-forest-light text-forest border-forest/15"
              />
              <ProfileSection
                label="Veel gebruikt bij"
                icon="🩺"
                items={profile.veelGebruiktBij}
                pillClass="bg-info-light text-info border-info/15"
              />
            </>
          ) : (
            <div className="py-6 text-center">
              <p className="text-warm-text-muted font-display italic text-sm">
                Geen profiel beschikbaar
              </p>
              <p className="text-warm-text-muted/60 text-[10px] font-body mt-1">
                {remedyInfo?.fullName || remedyAbbr}
              </p>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

/** Sectie met label en pills */
function ProfileSection({
  label,
  icon,
  items,
  pillClass,
}: {
  label: string;
  icon: string;
  items: string[];
  pillClass: string;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs">{icon}</span>
        <span className="text-[10px] font-body font-semibold text-warm-text-muted uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span
            key={i}
            className={`text-xs font-body px-2 py-0.5 rounded-lg border ${pillClass}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Modaliteiten sectie met < > kleuring */
function ModaliteitenSection({
  erger,
  beter,
}: {
  erger: string[];
  beter: string[];
}) {
  if (erger.length === 0 && beter.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs">⚖️</span>
        <span className="text-[10px] font-body font-semibold text-warm-text-muted uppercase tracking-wider">
          Modaliteiten
        </span>
      </div>
      <div className="space-y-1.5">
        {erger.length > 0 && (
          <div className="flex flex-wrap items-start gap-1">
            <span className="text-grade-4 font-bold text-sm w-4 shrink-0 pt-0.5">&lt;</span>
            <div className="flex flex-wrap gap-1 flex-1">
              {erger.map((item, i) => (
                <span
                  key={i}
                  className="text-xs font-body px-2 py-0.5 rounded-lg border bg-grade-4-bg/30 text-grade-4 border-grade-4/15"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        {beter.length > 0 && (
          <div className="flex flex-wrap items-start gap-1">
            <span className="text-forest font-bold text-sm w-4 shrink-0 pt-0.5">&gt;</span>
            <div className="flex flex-wrap gap-1 flex-1">
              {beter.map((item, i) => (
                <span
                  key={i}
                  className="text-xs font-body px-2 py-0.5 rounded-lg border bg-forest-light text-forest border-forest/15"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
