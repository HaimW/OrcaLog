'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/i18n/LanguageProvider'
import { StatCard } from '@/components/stats/StatCard'

type RankItem = { name: string; [key: string]: any }

function RankList({ items, valueKey, suffix = '' }: { items: RankItem[]; valueKey: string; suffix?: string }) {
  if (!items || items.length === 0) return <p className="text-sm text-gray-500">—</p>
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
            <span className="text-sm font-medium">{item.name}</span>
            {item.species && <span className="text-xs text-gray-400">({item.species})</span>}
          </div>
          <span className="text-sm text-ocean-teal font-semibold">
            {item[valueKey]}{suffix}
          </span>
        </li>
      ))}
    </ol>
  )
}

export default function LeaderboardPage() {
  const { t } = useLanguage()
  const [leaderboardEnabled, setLeaderboardEnabled] = useState<boolean | null>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.ok ? r.json() : { leaderboardEnabled: false })
      .then((c: any) => {
        setLeaderboardEnabled(!!c.leaderboardEnabled)
        if (c.leaderboardEnabled) {
          return fetch('/api/leaderboard').then(r => r.ok ? r.json() : null)
        }
        return null
      })
      .then((d: any) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center py-12">...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ocean-deep">🏆 {t('leaderboard.title')}</h1>

      {!leaderboardEnabled ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">{t('leaderboard.disabled')}</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="section-title">🤿 {t('leaderboard.mostDives')}</h2>
            <RankList items={data.mostDives || []} valueKey="count" />
          </div>

          <div className="card">
            <h2 className="section-title">🐟 {t('leaderboard.heaviestCatch')}</h2>
            <RankList items={data.heaviestCatch || []} valueKey="weight" suffix="g" />
          </div>

          <div className="card">
            <h2 className="section-title">🎣 {t('leaderboard.mostSpecies')}</h2>
            <RankList items={data.mostSpecies || []} valueKey="count" />
          </div>

          <div className="card">
            <h2 className="section-title">🌊 {t('leaderboard.deepestDive')}</h2>
            <RankList items={data.deepest || []} valueKey="depth" suffix="m" />
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">{t('stats.noData')}</p>
        </div>
      )}
    </div>
  )
}
