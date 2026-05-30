'use client'
import Link from 'next/link'
import type { PersonalRecords } from '@/shared/stats-calculator'

interface Props {
  records: PersonalRecords
  t: (key: string) => string
}

interface RecordTileProps {
  emoji: string;
  label: string;
  value: string | number | null;
  sub?: string | null;
  href?: string;
  gradient: string;
}

function RecordTile({ emoji, label, value, sub, href, gradient }: RecordTileProps) {
  const inner = (
    <div className="card flex flex-col items-center text-center p-4 relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl" style={{ background: gradient }} />
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl mb-2"
        style={{ background: "color-mix(in srgb, var(--color-ocean-deep) 10%, transparent)" }}
      >
        {emoji}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      {value != null ? (
        <>
          <p className="text-2xl font-bold leading-none" style={{ color: "var(--color-ocean-deep)" }}>{value}</p>
          {sub && <p className="text-[11px] mt-1 truncate max-w-full" style={{ color: "var(--text-muted)" }}>{sub}</p>}
        </>
      ) : (
        <p className="text-xl font-bold" style={{ color: "var(--text-muted)" }}>—</p>
      )}
    </div>
  );

  if (href && value != null) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function PersonalRecordsCard({ records, t }: Props) {
  return (
    <div className="space-y-3 animate-fade-in">
      <h2 className="section-title px-1">{t('stats.records.title')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <RecordTile
          emoji="🌊"
          label={t('stats.records.deepest')}
          value={records.deepestDive ? `${records.deepestDive.depth}m` : null}
          sub={records.deepestDive?.date}
          href={records.deepestDive ? `/entries/${records.deepestDive.entryId}` : undefined}
          gradient="linear-gradient(to right, #0B4F6C, #1B98A6)"
        />
        <RecordTile
          emoji="🐟"
          label={t('stats.records.biggest')}
          value={records.biggestCatch ? `${records.biggestCatch.weight}g` : null}
          sub={records.biggestCatch?.species}
          href={records.biggestCatch ? `/entries/${records.biggestCatch.entryId}` : undefined}
          gradient="linear-gradient(to right, #0891b2, #22d3ee)"
        />
        <RecordTile
          emoji="🔥"
          label={t('stats.records.streak')}
          value={records.longestStreak || null}
          sub={records.longestStreak ? t('stats.records.days') : null}
          gradient="linear-gradient(to right, #f97316, #fb923c)"
        />
        <RecordTile
          emoji="🎣"
          label={t('stats.records.mostProductive')}
          value={records.mostProductiveDive ? records.mostProductiveDive.catches : null}
          sub={records.mostProductiveDive?.date}
          href={records.mostProductiveDive ? `/entries/${records.mostProductiveDive.entryId}` : undefined}
          gradient="linear-gradient(to right, #059669, #34d399)"
        />
      </div>
    </div>
  );
}
