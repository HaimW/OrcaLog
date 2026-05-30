"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
}

export function StatCard({ label, value, unit, icon }: StatCardProps) {
  return (
    <div
      className="card animate-slide-up flex flex-col items-center text-center relative overflow-hidden pt-5 pb-4"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl"
        style={{ background: "linear-gradient(to right, var(--color-ocean-deep), var(--color-ocean-teal))" }}
      />

      {/* Icon */}
      {icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2.5"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-ocean-teal) 15%, transparent)" }}
        >
          {icon}
        </div>
      )}

      {/* Value */}
      <div className="flex items-baseline gap-1 justify-center">
        <p
          className="text-3xl font-bold tabular-nums leading-none"
          style={{ color: "var(--color-ocean-teal)" }}
        >
          {value}
        </p>
        {unit && (
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {unit}
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-xs font-medium mt-1.5 leading-tight" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}
