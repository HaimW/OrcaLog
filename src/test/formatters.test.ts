import { describe, it, expect, vi } from 'vitest'

vi.mock('@/i18n', () => ({
  getLocale: (lang: string) => (lang === 'he' ? 'he-IL' : 'en-US'),
  t: (key: string) => key,
}))

// Mock constants dependency
vi.mock('@/shared/constants', () => ({
  DIVING_LOCATIONS: [{ id: 'loc1', he: 'מיקום 1', en: 'Location 1', region: 'north' }],
  COMMON_FISH_SPECIES: [{ id: 'bass', he: 'בס', en: 'Bass' }],
  FISHING_METHODS: [{ id: 'speargun', he: 'רובה צלילה', en: 'Speargun' }],
  WEATHER_CONDITIONS: [{ id: 'sunny', he: 'שמש', en: 'Sunny' }],
  COMPASS_DIRECTIONS: [{ id: 'N', he: 'צפון', en: 'North' }],
  EQUIPMENT_TYPES: {
    masks: [{ id: 'mask1', he: 'מסכה 1', en: 'Mask 1' }],
    fins: [{ id: 'fins1', he: 'סנפירים 1', en: 'Fins 1' }],
    suits: [{ id: 'suit1', he: 'חליפה 1', en: 'Suit 1' }],
  },
  getLabel: (list: any[], id: string, lang: string) => {
    const item = list.find((x: any) => x.id === id)
    return item ? (lang === 'he' ? item.he : item.en) : null
  },
}))

import { formatDate, formatNumber, formatRating } from '@/shared/formatters'

describe('formatDate', () => {
  it('returns empty string for null', () => {
    expect(formatDate(null, 'he')).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(formatDate('', 'he')).toBe('')
  })

  it('formats a date string for Hebrew locale', () => {
    const result = formatDate('2024-01-15', 'he')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-06-15'), 'en')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})

describe('formatNumber', () => {
  it('returns "-" for null', () => {
    expect(formatNumber(null, 'en')).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(formatNumber(undefined, 'en')).toBe('-')
  })

  it('formats 0 correctly', () => {
    const result = formatNumber(0, 'en')
    expect(result).toBe('0')
  })

  it('formats decimal number', () => {
    const result = formatNumber(3.14159, 'en', 2)
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('formats a whole number', () => {
    const result = formatNumber(42, 'en')
    expect(result).toBeTruthy()
  })
})

describe('formatRating', () => {
  it('returns empty string for null/0', () => {
    expect(formatRating(null)).toBe('')
    expect(formatRating(0)).toBe('')
  })

  it('returns 5 stars for rating 5', () => {
    const result = formatRating(5)
    expect(result).toHaveLength(5)
    expect(result).toBe('★★★★★')
  })

  it('returns mixed stars for rating 3', () => {
    const result = formatRating(3)
    expect(result).toHaveLength(5)
    expect(result).toBe('★★★☆☆')
  })
})
