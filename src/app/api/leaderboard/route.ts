import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, isErrorResponse } from '@/lib/auth-guard'

export async function GET() {
  const authResult = await requireAuth()
  if (isErrorResponse(authResult)) return authResult

  const config = await prisma.appConfig.findFirst()
  if (!config?.leaderboardEnabled) {
    return NextResponse.json({ error: 'Leaderboard is disabled' }, { status: 403 })
  }

  const entries = await prisma.diveEntry.findMany({
    where: { user: { showInLeaderboard: true } },
    include: {
      user: { select: { id: true, fullName: true, username: true, email: true } },
    },
  })

  const parsed = entries.map(e => ({
    ...e,
    catches: (() => {
      try {
        return typeof e.catches === 'string' ? JSON.parse(e.catches || '[]') : (e.catches || [])
      } catch {
        return []
      }
    })(),
  }))

  // Most dives this month
  const thisMonth = new Date().toISOString().slice(0, 7)
  const diveCountsByUser: Record<string, { name: string; count: number }> = {}
  parsed
    .filter(e => {
      const d = typeof e.date === 'string' ? e.date : new Date(e.date).toISOString()
      return d.startsWith(thisMonth)
    })
    .forEach(e => {
      const name = e.user.fullName || e.user.username || e.user.email.split('@')[0]
      if (!diveCountsByUser[e.userId]) diveCountsByUser[e.userId] = { name, count: 0 }
      diveCountsByUser[e.userId].count++
    })
  const mostDives = Object.values(diveCountsByUser)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Heaviest single catch
  const catches: Array<{ name: string; species: string; weight: number }> = []
  parsed.forEach(e => {
    const name = e.user.fullName || e.user.username || e.user.email.split('@')[0]
    e.catches.forEach((c: any) => {
      if (c.weight) {
        catches.push({ name, species: c.species, weight: parseFloat(c.weight) })
      }
    })
  })
  const heaviestCatch = catches.sort((a, b) => b.weight - a.weight).slice(0, 5)

  // Most species diversity
  const speciesByUser: Record<string, { name: string; species: Set<string> }> = {}
  parsed.forEach(e => {
    const name = e.user.fullName || e.user.username || e.user.email.split('@')[0]
    if (!speciesByUser[e.userId]) speciesByUser[e.userId] = { name, species: new Set() }
    e.catches.forEach((c: any) => {
      if (c.species) speciesByUser[e.userId].species.add(c.species)
    })
  })
  const mostSpecies = Object.values(speciesByUser)
    .map(u => ({ name: u.name, count: u.species.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Deepest dive
  const deepest = parsed
    .filter(e => e.depth)
    .sort((a, b) => (b.depth || 0) - (a.depth || 0))
    .slice(0, 5)
    .map(e => ({
      name: e.user.fullName || e.user.username || e.user.email.split('@')[0],
      depth: e.depth,
      date: new Date(e.date).toISOString().slice(0, 10),
    }))

  return NextResponse.json({ mostDives, heaviestCatch, mostSpecies, deepest })
}
