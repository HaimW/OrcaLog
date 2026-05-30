'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/i18n/LanguageProvider'

export default function ProfilePage() {
  const { t, lang, setLang } = useLanguage()
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [showInLeaderboard, setShowInLeaderboard] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        if (data) {
          setProfile(data)
          setFullName(data.fullName || '')
          setShowInLeaderboard(!!data.showInLeaderboard)
          setEmailNotifications(data.emailNotifications !== false)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName || null,
        language: lang,
        showInLeaderboard,
        emailNotifications,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) return <p className="text-center py-12">...</p>

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-ocean-deep">{t('profile.title')}</h1>

      <div className="card space-y-4">
        <div>
          <label className="label">{t('auth.fullName')}</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="input"
            placeholder={profile?.email || ''}
          />
        </div>

        <div>
          <label className="label">{t('auth.email')}</label>
          <input type="email" value={profile?.email || ''} readOnly className="input opacity-60 cursor-not-allowed" />
        </div>

        <div>
          <label className="label">{t('nav.langToggle')}</label>
          <div className="flex gap-2">
            <button
              onClick={() => setLang('he')}
              className={`px-4 py-2 rounded-lg border text-sm ${lang === 'he' ? 'bg-ocean-deep text-white border-ocean-deep' : 'border-gray-300'}`}
            >
              עברית
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-lg border text-sm ${lang === 'en' ? 'bg-ocean-deep text-white border-ocean-deep' : 'border-gray-300'}`}
            >
              English
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="leaderboard-optin"
            checked={showInLeaderboard}
            onChange={e => setShowInLeaderboard(e.target.checked)}
          />
          <label htmlFor="leaderboard-optin" className="text-sm">
            {t('profile.showInLeaderboard')}
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="email-notifications"
            checked={emailNotifications}
            onChange={e => setEmailNotifications(e.target.checked)}
          />
          <label htmlFor="email-notifications" className="text-sm">
            {t('profile.emailNotifications')}
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? '...' : t('profile.save')}
          </button>
          {saved && <span className="text-green-600 text-sm">{t('profile.saved')}</span>}
        </div>
      </div>
    </div>
  )
}
