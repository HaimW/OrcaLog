import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    diveEntry: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Mock next-auth
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))

import { GET, POST } from '@/app/api/entries/route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const mockSession = {
  user: {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test User',
    role: 'user',
    language: 'he',
  },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/entries', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const req = new Request('http://localhost/api/entries', { method: 'GET' })
    const res = await GET(req as any)

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBeTruthy()
  })

  it('returns items array when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession as any)
    vi.mocked(prisma.diveEntry.findMany).mockResolvedValue([])
    vi.mocked(prisma.diveEntry.count).mockResolvedValue(0)

    const req = new Request('http://localhost/api/entries', { method: 'GET' })
    const res = await GET(req as any)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('items')
    expect(Array.isArray(json.items)).toBe(true)
  })
})

describe('POST /api/entries', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2024-01-01', rating: 3 }),
    })
    const res = await POST(req as any)

    expect(res.status).toBe(401)
  })

  it('returns 400 when date is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession as any)

    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 3 }),
    })
    const res = await POST(req as any)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBeTruthy()
  })

  it('calls prisma.diveEntry.create with valid data', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession as any)
    const mockEntry = {
      id: 'entry-1',
      userId: 'user-1',
      date: new Date('2024-01-01'),
      rating: 3,
      catches: '[]',
      photos: '[]',
      fishingTypes: '[]',
      weather: null,
      equipment: null,
      location: null,
      detailedLocation: null,
      depth: null,
      duration: null,
      visibility: null,
      time: null,
      startTime: null,
      endTime: null,
      notes: null,
      shareToken: null,
      groupId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.mocked(prisma.diveEntry.create).mockResolvedValue(mockEntry as any)

    const req = new Request('http://localhost/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2024-01-01', rating: 3 }),
    })
    const res = await POST(req as any)

    expect(prisma.diveEntry.create).toHaveBeenCalled()
    expect(res.status).toBe(201)
  })
})
