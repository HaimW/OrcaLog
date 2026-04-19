"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatDate, formatLocation, countFish } from "@/shared/formatters";

export function EntryCard({ entry }: { entry: any }) {
  const { t, lang } = useLanguage();
  const fishCount = countFish(entry.catches);
  const firstPhoto = entry.photos?.[0];

  return (
    <Link href={`/entries/${entry.id}`} className="block">
      <div className="card hover:shadow-md transition-shadow">
        <div className="flex gap-3">
          {firstPhoto && (
            <img
              src={firstPhoto}
              alt=""
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-gray-500">{formatDate(entry.date, lang)}</p>
                <p className="font-semibold truncate">{formatLocation(entry.location, lang) || entry.location}</p>
              </div>
              <div className="text-yellow-400 flex-shrink-0">
                {"★".repeat(entry.rating || 0)}
                <span className="text-gray-300">{"★".repeat(5 - (entry.rating || 0))}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-gray-700">
              {entry.depth !== null && <span>🤿 {t("card.depth", { value: entry.depth })}</span>}
              {entry.visibility !== null && <span>👁 {t("card.visibility", { value: entry.visibility })}</span>}
              {entry.weather?.waterTemperature !== undefined && entry.weather?.waterTemperature !== null && (
                <span>🌡 {t("card.waterTemp", { value: entry.weather.waterTemperature })}</span>
              )}
              <span>🐟 {fishCount > 0 ? t("card.fishCount", { count: fishCount }) : t("card.noFish")}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
