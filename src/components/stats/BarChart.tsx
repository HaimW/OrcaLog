"use client";

interface BarChartProps {
  title: string;
  items: { label: string; count: number }[];
}

export function BarChart({ title, items }: BarChartProps) {
  if (!items.length) return null;
  const max = Math.max(...items.map((i) => i.count));

  return (
    <div className="card">
      <h3 className="section-title">{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm w-32 truncate flex-shrink-0">{item.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-ocean-teal rounded-full transition-all"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium w-6 text-end">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
