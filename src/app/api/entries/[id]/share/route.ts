import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, isErrorResponse } from '@/lib/auth-guard'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAuth()
  if (isErrorResponse(authResult)) return authResult
  const user = authResult

  const entry = await prisma.diveEntry.findUnique({ where: { id: params.id } })
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (entry.userId !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let token = entry.shareToken
  if (!token) {
    token = crypto.randomUUID()
    await prisma.diveEntry.update({ where: { id: params.id }, data: { shareToken: token } })
  }
  return NextResponse.json({ shareToken: token, url: `/share/${token}` })
}
