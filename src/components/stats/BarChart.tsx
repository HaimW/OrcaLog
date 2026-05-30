"use client";

interface BarChartProps {
  title: string;
  items: { label: string; count: number }[];
}

export function BarChart({ title, items }: BarChartProps) {
  if (!items.length) return null;
  const max = Math.max(...items.map((i) => i.count));

  return (
    <div className="card animate-fade-in">
      <h3 className="section-title">{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => {
          const pct = Math.max((item.count / max) * 100, 4);
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs font-medium w-28 shrink-0 truncate" style={{ color: "var(--text)" }}>
                {item.label}
              </span>
              <div
                className="flex-1 rounded-full overflow-hidden"
                style={{ height: "8px", backgroundColor: "var(--surface-alt)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(to right, var(--color-ocean-deep), var(--color-ocean-teal))",
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              <span
                className="text-xs font-bold w-6 text-end tabular-nums shrink-0"
                style={{ color: "var(--color-ocean-teal)" }}
              >
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
