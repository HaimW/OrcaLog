'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/i18n/LanguageProvider'
import { StatCard } from '@/components/stats/StatCard'
import {
  speciesPerSeason,
  avgWeightPerSpecies,
  releaseRate,
  topLocationPerSpecies,
} from '@/shared/fishing-analytics'
import { formatSpecies, formatLocation } from '@/shared/formatters'
import Link from 'next/link'

const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const

export default function FishingStatsPage() {
  const { t, lang } = useLanguage()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/entries?take=9999')
      .then(r => r.json())
      .then(d => { setEntries(d.items || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center py-12">...</p>

  const rate = releaseRate(entries)
  const avgWeights = avgWeightPerSpecies(entries)
  const topLocs = topLocationPerSpecies(entries)
  const seasonData = speciesPerSeason(entries)

  // Collect all species that appear in season data
  const allSpecies = Array.from(
    new Set(
      SEASONS.flatMap(s => Object.keys(seasonData[s] || {}))
    )
  ).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stats" className="text-ocean-teal text-sm">← {t('detail.back')}</Link>
        <h1 className="text-2xl font-bold text-ocean-deep">{t('stats.fishing.title')}</h1>
      </div>

      {/* Release Rate */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label={t('stats.fishing.releaseRate')} value={`${rate}%`} icon="🔄" />
      </div>

      {/* Avg Weight Per Species */}
      {avgWeights.length > 0 && (
        <div className="card">
          <h2 className="section-title">{t('stats.fishing.avgWeight')}</h2>
          <div className="space-y-2">
            {avgWeights.map(item => (
              <div key={item.species} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium">{formatSpecies(item.species, lang)}</span>
                <span className="text-sm text-gray-600">{item.avgWeight}g <span className="text-xs text-gray-400">(n={item.count})</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Species Per Season */}
      {allSpecies.length > 0 && (
        <div className="card overflow-x-auto">
          <h2 className="section-title">{t('stats.fishing.speciesPerSeason')}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-start py-2 font-medium text-gray-600">Species</th>
                {SEASONS.map(s => (
                  <th key={s} className="text-center py-2 font-medium text-gray-600">{t(`season.${s}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allSpecies.map(species => (
                <tr key={species} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2">{formatSpecies(species, lang)}</td>
                  {SEASONS.map(s => (
                    <td key={s} className="text-center py-2">
                      {seasonData[s][species] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Top Location Per Species */}
      {topLocs.length > 0 && (
        <div className="card">
          <h2 className="section-title">{t('stats.fishing.topLocations')}</h2>
          <div className="space-y-2">
            {topLocs.map(item => (
              <div key={item.species} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium">{formatSpecies(item.species, lang)}</span>
                <span className="text-sm text-gray-600">
                  {formatLocation(item.location, lang) || item.location}
                  <span className="text-xs text-gray-400 ml-1">({item.count})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <p className="text-center text-gray-500 py-12">{t('stats.noData')}</p>
      )}
    </div>
  )
}
