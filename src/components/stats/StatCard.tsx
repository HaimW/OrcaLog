"use client";

import { useState, useEffect, useRef } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
}

function useCountUp(target: string | number, duration = 900) {
  const [display, setDisplay] = useState<string | number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const raw = typeof target === "number" ? target : parseFloat(String(target).replace(",", "."));
    if (isNaN(raw) || raw === 0) {
      setDisplay(target);
      return;
    }

    const decimals = String(target).includes(".")
      ? String(target).split(".")[1]?.length ?? 0
      : 0;

    let startTime: number | null = null;

    function step(ts: number) {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = raw * eased;

      setDisplay(decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString());

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(target);
      }
    }

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return display;
}

export function StatCard({ label, value, unit, icon }: StatCardProps) {
  const animated = useCountUp(value);

  return (
    <div className="card animate-slide-up flex flex-col items-center text-center relative overflow-hidden pt-5 pb-4">
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

      {/* Animated value */}
      <div className="flex items-baseline gap-1 justify-center">
        <p
          className="text-3xl font-bold tabular-nums leading-none"
          style={{ color: "var(--color-ocean-teal)" }}
        >
          {animated}
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
