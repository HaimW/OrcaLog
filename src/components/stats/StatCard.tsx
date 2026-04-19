"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
}

export function StatCard({ label, value, unit, icon }: StatCardProps) {
  return (
    <div className="card text-center">
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <p className="text-3xl font-bold text-ocean-teal">{value}</p>
      {unit && <p className="text-xs text-gray-500">{unit}</p>}
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );
}
