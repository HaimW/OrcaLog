'use client'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Entry {
  date: string
  depth?: number | null
}

interface Props {
  entries: Entry[]
  lang: string
}

export default function TimeSeriesCharts({ entries }: Props) {
  // Dives per month
  const divesPerMonth: Record<string, number> = {}
  entries.forEach(e => {
    const key = e.date?.slice(0, 7) // YYYY-MM
    if (key) divesPerMonth[key] = (divesPerMonth[key] || 0) + 1
  })
  const monthData = Object.entries(divesPerMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }))

  // Depth over time
  const depthData = entries
    .filter(e => e.depth != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({ date: e.date?.slice(0, 10), depth: e.depth }))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2 opacity-70">Dives per Month</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#0B4F6C" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {depthData.length >= 2 && (
        <div>
          <h3 className="text-sm font-medium mb-2 opacity-70">Depth Over Time</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={depthData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis reversed tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="depth"
                stroke="#0B4F6C"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
