import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { parseEntry } from '@/lib/entries'
import type { Metadata } from 'next'

interface Props {
  params: { token: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = await prisma.diveEntry.findUnique({ where: { shareToken: params.token } })
  if (!entry) return { title: 'Dive Entry — OrcaLog' }
  const parsed = parseEntry(entry)
  const dateStr = parsed.date ? new Date(parsed.date).toLocaleDateString('he-IL') : ''
  return {
    title: `Dive — ${parsed.location || dateStr} — OrcaLog`,
    description: parsed.notes || 'View this dive entry on OrcaLog',
  }
}

export default async function SharePage({ params }: Props) {
  const entry = await prisma.diveEntry.findUnique({ where: { shareToken: params.token } })
  if (!entry) notFound()

  const parsed = parseEntry(entry)
  const dateStr = parsed.date ? new Date(parsed.date).toLocaleDateString('he-IL', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }) : ''

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-ocean-deep text-white rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-75">OrcaLog</p>
            <h1 className="text-xl font-bold mt-1">{parsed.location || 'Dive Entry'}</h1>
            <p className="text-sm opacity-75 mt-1">{dateStr}{parsed.time ? ` · ${parsed.time}` : ''}</p>
          </div>
          {parsed.rating > 0 && (
            <div className="text-yellow-400 text-lg">{'★'.repeat(parsed.rating)}{'☆'.repeat(5 - parsed.rating)}</div>
          )}
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-3">
        {parsed.depth != null && (
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-ocean-teal">{parsed.depth}</p>
            <p className="text-xs text-gray-500">Depth (m)</p>
          </div>
        )}
        {parsed.duration != null && (
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-ocean-teal">{parsed.duration}</p>
            <p className="text-xs text-gray-500">Duration (min)</p>
          </div>
        )}
        {parsed.visibility != null && (
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-ocean-teal">{parsed.visibility}</p>
            <p className="text-xs text-gray-500">Visibility (m)</p>
          </div>
        )}
      </div>

      {/* Catches */}
      {parsed.catches && parsed.catches.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-2">Catches</h2>
          <div className="space-y-2">
            {parsed.catches.map((c: any) => (
              <div key={c.id} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                <span className="font-medium">{c.species}</span>
                <div className="flex gap-2 text-sm text-gray-600">
                  <span>×{c.quantity}</span>
                  {c.weight && <span>{c.weight}g</span>}
                  {c.length && <span>{c.length}cm</span>}
                  {c.released && <span className="text-green-600">Released</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      {parsed.photos && parsed.photos.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-2">Photos</h2>
          <div className="flex flex-wrap gap-2">
            {parsed.photos.map((url: string, i: number) => (
              <img key={i} src={url} alt="" className="w-24 h-24 rounded-lg object-cover" />
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {parsed.notes && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-2">Notes</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{parsed.notes}</p>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 pt-4">Shared via OrcaLog</p>
    </div>
  )
}
