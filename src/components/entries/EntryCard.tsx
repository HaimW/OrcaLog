"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatDate, formatLocation, countFish } from "@/shared/formatters";
import { Eye, ArrowDown, Thermometer, Fish } from "lucide-react";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={n <= rating ? "#fbbf24" : "none"}
          stroke={n <= rating ? "#fbbf24" : "#d1d5db"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function DepthGradient({ depth }: { depth: number | null }) {
  const d = depth ?? 0;
  if (d < 5)   return "from-teal-400 to-cyan-500";
  if (d < 15)  return "from-cyan-500 to-blue-500";
  if (d < 25)  return "from-blue-500 to-blue-700";
  return "from-blue-700 to-indigo-900";
}

export function EntryCard({ entry }: { entry: any }) {
  const { t, lang } = useLanguage();
  const fishCount = countFish(entry.catches);
  const firstPhoto = entry.photos?.[0];

  if (firstPhoto) {
    return (
      <Link href={`/entries/${entry.id}`} className="block group animate-slide-up">
        <div
          className="card overflow-hidden p-0 transition-all duration-200 group-hover:shadow-lg"
          style={{ boxShadow: "var(--shadow-card)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-hover)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)"; (e.currentTarget as HTMLDivElement).style.transform = ""; }}
        >
          {/* Photo banner */}
          <div className="relative h-36 overflow-hidden">
            <img src={firstPhoto} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 start-0 end-0 p-3 flex items-end justify-between gap-2">
              <div>
                <p className="text-white text-xs opacity-80">{formatDate(entry.date, lang)}</p>
                <p className="text-white font-semibold text-sm leading-tight">{formatLocation(entry.location, lang) || entry.location}</p>
              </div>
              <StarRow rating={entry.rating || 0} />
            </div>
          </div>

          {/* Stats row */}
          <div className="px-3 py-2.5 flex items-center gap-3 flex-wrap text-xs" style={{ color: "var(--text-muted)" }}>
            {entry.depth != null && (
              <span className="flex items-center gap-1">
                <ArrowDown size={11} />
                {entry.depth}m
              </span>
            )}
            {entry.visibility != null && (
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {entry.visibility}m
              </span>
            )}
            {entry.weather?.waterTemperature != null && (
              <span className="flex items-center gap-1">
                <Thermometer size={11} />
                {entry.weather.waterTemperature}°
              </span>
            )}
            <span
              className="ms-auto flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: fishCount > 0 ? "var(--color-ocean-teal)" : "var(--text-muted)" }}
            >
              <Fish size={10} />
              {fishCount > 0 ? fishCount : t("card.noFish")}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  /* No-photo variant */
  return (
    <Link href={`/entries/${entry.id}`} className="block group animate-slide-up">
      <div
        className="card overflow-hidden p-0 transition-all duration-200"
        style={{ boxShadow: "var(--shadow-card)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-hover)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)"; (e.currentTarget as HTMLDivElement).style.transform = ""; }}
      >
        {/* Depth-tinted accent bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${DepthGradient({ depth: entry.depth })}`} />

        <div className="p-3.5 flex items-center gap-3">
          {/* Depth circle */}
          <div
            className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 text-white"
            style={{ background: `linear-gradient(135deg, var(--color-ocean-deep), var(--color-ocean-teal))` }}
          >
            {entry.depth != null ? (
              <>
                <span className="text-lg font-bold leading-none">{entry.depth}</span>
                <span className="text-[9px] opacity-80 font-medium">m</span>
              </>
            ) : (
              <ArrowDown size={20} className="opacity-70" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{formatDate(entry.date, lang)}</p>
                <p className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>
                  {formatLocation(entry.location, lang) || entry.location}
                </p>
              </div>
              <StarRow rating={entry.rating || 0} />
            </div>

            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              {entry.visibility != null && (
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  <Eye size={11} />
                  {entry.visibility}m
                </span>
              )}
              {entry.weather?.waterTemperature != null && (
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  <Thermometer size={11} />
                  {entry.weather.waterTemperature}°
                </span>
              )}
              <span
                className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white ms-auto"
                style={{ backgroundColor: fishCount > 0 ? "var(--color-ocean-teal)" : "var(--text-muted)" }}
              >
                <Fish size={10} />
                {fishCount > 0 ? fishCount : t("card.noFish")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
