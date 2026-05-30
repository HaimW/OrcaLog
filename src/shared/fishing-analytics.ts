export function getSeason(month: number): 'spring' | 'summer' | 'fall' | 'winter' {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

function parseCatches(entry: any): any[] {
  if (!entry.catches) return []
  if (Array.isArray(entry.catches)) return entry.catches
  try {
    return JSON.parse(entry.catches) || []
  } catch {
    return []
  }
}

export function speciesPerSeason(entries: any[]): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {
    spring: {},
    summer: {},
    fall: {},
    winter: {},
  }
  entries.forEach(entry => {
    if (!entry.date) return
    const month = new Date(entry.date).getMonth() + 1
    const season = getSeason(month)
    const catches = parseCatches(entry)
    catches.forEach((c: any) => {
      if (!c.species) return
      result[season][c.species] = (result[season][c.species] || 0) + (c.quantity || 1)
    })
  })
  return result
}

export function avgWeightPerSpecies(entries: any[]): Array<{ species: string; avgWeight: number; count: number }> {
  const data: Record<string, { total: number; count: number }> = {}
  entries.forEach(entry => {
    const catches = parseCatches(entry)
    catches.forEach((c: any) => {
      if (!c.species || !c.weight) return
      const w = parseFloat(c.weight)
      if (isNaN(w)) return
      if (!data[c.species]) data[c.species] = { total: 0, count: 0 }
      data[c.species].total += w
      data[c.species].count += 1
    })
  })
  return Object.entries(data)
    .map(([species, { total, count }]) => ({
      species,
      avgWeight: Math.round((total / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => b.avgWeight - a.avgWeight)
}

export function releaseRate(entries: any[]): number {
  let total = 0
  let released = 0
  entries.forEach(entry => {
    const catches = parseCatches(entry)
    catches.forEach((c: any) => {
      total += c.quantity || 1
      if (c.released) released += c.quantity || 1
    })
  })
  if (total === 0) return 0
  return Math.round((released / total) * 100)
}

export function topLocationPerSpecies(entries: any[]): Array<{ species: string; location: string; count: number }> {
  const data: Record<string, Record<string, number>> = {}
  entries.forEach(entry => {
    if (!entry.location) return
    const catches = parseCatches(entry)
    catches.forEach((c: any) => {
      if (!c.species) return
      if (!data[c.species]) data[c.species] = {}
      data[c.species][entry.location] = (data[c.species][entry.location] || 0) + (c.quantity || 1)
    })
  })
  return Object.entries(data).map(([species, locations]) => {
    const topEntry = Object.entries(locations).sort(([, a], [, b]) => b - a)[0]
    return {
      species,
      location: topEntry[0],
      count: topEntry[1],
    }
  }).sort((a, b) => b.count - a.count)
}
