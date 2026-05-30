'use client'
import Link from 'next/link'
import type { PersonalRecords } from '@/shared/stats-calculator'

interface Props {
  records: PersonalRecords
  t: (key: string) => string
}

export default function PersonalRecordsCard({ records, t }: Props) {
  return (
    <div className="card">
      <h2 className="section-title">{t('stats.records.title')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Deepest Dive */}
        <div className="bg-ocean-deep/5 rounded-lg p-3 text-center">
          <p className="text-2xl">🌊</p>
          <p className="text-xs text-gray-500 mt-1">{t('stats.records.deepest')}</p>
          {records.deepestDive ? (
            <Link href={`/entries/${records.deepestDive.entryId}`} className="block">
              <p className="text-xl font-bold text-ocean-deep">{records.deepestDive.depth}m</p>
              <p className="text-xs text-gray-400">{records.deepestDive.date}</p>
            </Link>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </div>

        {/* Biggest Catch */}
        <div className="bg-ocean-deep/5 rounded-lg p-3 text-center">
          <p className="text-2xl">🐟</p>
          <p className="text-xs text-gray-500 mt-1">{t('stats.records.biggest')}</p>
          {records.biggestCatch ? (
            <Link href={`/entries/${records.biggestCatch.entryId}`} className="block">
              <p className="text-xl font-bold text-ocean-deep">{records.biggestCatch.weight}g</p>
              <p className="text-xs text-gray-400">{records.biggestCatch.species}</p>
            </Link>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </div>

        {/* Longest Streak */}
        <div className="bg-ocean-deep/5 rounded-lg p-3 text-center">
          <p className="text-2xl">🔥</p>
          <p className="text-xs text-gray-500 mt-1">{t('stats.records.streak')}</p>
          <p className="text-xl font-bold text-ocean-deep">{records.longestStreak}</p>
          <p className="text-xs text-gray-400">{t('stats.records.days')}</p>
        </div>

        {/* Most Productive */}
        <div className="bg-ocean-deep/5 rounded-lg p-3 text-center">
          <p className="text-2xl">🎣</p>
          <p className="text-xs text-gray-500 mt-1">{t('stats.records.mostProductive')}</p>
          {records.mostProductiveDive ? (
            <Link href={`/entries/${records.mostProductiveDive.entryId}`} className="block">
              <p className="text-xl font-bold text-ocean-deep">{records.mostProductiveDive.catches}</p>
              <p className="text-xs text-gray-400">{records.mostProductiveDive.date}</p>
            </Link>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </div>
      </div>
    </div>
  )
}
