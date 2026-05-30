import { describe, it, expect } from 'vitest'
import { computeStats, emptyStats } from '@/shared/stats-calculator'

const now = new Date()
const recent = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
const old = new Date('2020-01-01').toISOString()

const sampleEntries = [
  {
    id: '1',
    date: recent,
    depth: 15,
    duration: 60,
    rating: 4,
    visibility: 10,
    catches: [
      { id: 'c1', species: 'bass', quantity: 2, released: false },
      { id: 'c2', species: 'tuna', quantity: 1, released: false },
    ],
    fishingTypes: ['speargun'],
    weather: { waterTemperature: 22 },
  },
  {
    id: '2',
    date: recent,
    depth: 25,
    duration: 90,
    rating: 5,
    visibility: 15,
    catches: [
      { id: 'c3', species: 'bass', quantity: 3, released: false },
    ],
    fishingTypes: ['speargun', 'hook'],
    weather: { waterTemperature: 24 },
  },
  {
    id: '3',
    date: old,
    depth: 10,
    duration: 45,
    rating: 3,
    visibility: 5,
    catches: [],
    fishingTypes: ['hook'],
    weather: { waterTemperature: 18 },
  },
]

describe('computeStats', () => {
  it('returns emptyStats for empty array', () => {
    const result = computeStats([])
    expect(result.totalDives).toBe(0)
    expect(result.totalFishCaught).toBe(0)
    expect(result.maxDepth).toBe(0)
    expect(result.topSpecies).toHaveLength(0)
  })

  it('returns emptyStats for null/undefined', () => {
    const result = computeStats(null as any)
    expect(result.totalDives).toBe(0)
  })

  it('counts total dives correctly', () => {
    const result = computeStats(sampleEntries)
    expect(result.totalDives).toBe(3)
  })

  it('calculates max depth correctly', () => {
    const result = computeStats(sampleEntries)
    expect(result.maxDepth).toBe(25)
  })

  it('calculates average depth correctly', () => {
    const result = computeStats(sampleEntries)
    expect(result.averageDepth).toBeCloseTo((15 + 25 + 10) / 3, 1)
  })

  it('counts total fish caught (not released)', () => {
    const result = computeStats(sampleEntries)
    // 2 + 1 + 3 = 6
    expect(result.totalFishCaught).toBe(6)
  })

  it('ranks top species correctly', () => {
    const result = computeStats(sampleEntries)
    // bass: 5, tuna: 1
    expect(result.topSpecies[0].species).toBe('bass')
    expect(result.topSpecies[0].count).toBe(5)
  })

  it('calculates total hours in water', () => {
    const result = computeStats(sampleEntries)
    // (60 + 90 + 45) / 60 = 3.25
    expect(result.totalHoursInWater).toBeCloseTo(3.3, 0)
  })

  it('calculates recent activity (within 30 days)', () => {
    const result = computeStats(sampleEntries)
    // Only 2 entries are recent
    expect(result.recentActivity).toBe(2)
  })

  it('calculates average rating', () => {
    const result = computeStats(sampleEntries)
    expect(result.averageRating).toBeCloseTo((4 + 5 + 3) / 3, 1)
  })

  it('calculates method breakdown', () => {
    const result = computeStats(sampleEntries)
    const speargun = result.methodBreakdown.find(m => m.method === 'speargun')
    const hook = result.methodBreakdown.find(m => m.method === 'hook')
    expect(speargun?.count).toBe(2)
    expect(hook?.count).toBe(2)
  })
})

describe('emptyStats', () => {
  it('returns all zeros', () => {
    const s = emptyStats()
    expect(s.totalDives).toBe(0)
    expect(s.topSpecies).toEqual([])
    expect(s.methodBreakdown).toEqual([])
  })
})
