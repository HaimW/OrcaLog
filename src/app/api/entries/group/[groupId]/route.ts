import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, isErrorResponse } from '@/lib/auth-guard'
import { parseEntry } from '@/lib/entries'

export async function GET(req: NextRequest, { params }: { params: { groupId: string } }) {
  const authResult = await requireAuth()
  if (isErrorResponse(authResult)) return authResult

  const entries = await prisma.diveEntry.findMany({
    where: { groupId: params.groupId },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(entries.map(parseEntry))
}
