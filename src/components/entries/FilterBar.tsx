"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { DIVING_LOCATIONS, FISHING_METHODS, getLocalizedList } from "@/shared/constants";

export interface Filters {
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  fishingType?: string;
  minDepth?: string;
  maxDepth?: string;
  minRating?: string;
  userId?: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  users?: { id: string; email: string; fullName?: string | null }[];
  showUserFilter?: boolean;
}

export function FilterBar({ filters, onChange, users, showUserFilter }: FilterBarProps) {
  const { t, lang } = useLanguage();
  const locations = getLocalizedList(DIVING_LOCATIONS, lang);
  const methods = getLocalizedList(FISHING_METHODS, lang);

  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value || undefined });
  }

  function clear() {
    onChange({});
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("filter.title")}</h3>
        <button onClick={clear} className="text-sm text-ocean-teal hover:underline">
          {t("filter.clear")}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">{t("filter.dateFrom")}</label>
          <input type="date" value={filters.dateFrom || ""} onChange={(e) => update("dateFrom", e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">{t("filter.dateTo")}</label>
          <input type="date" value={filters.dateTo || ""} onChange={(e) => update("dateTo", e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">{t("filter.location")}</label>
          <select value={filters.location || ""} onChange={(e) => update("location", e.target.value)} className="input">
            <option value="">{t("filter.allLocations")}</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t("filter.fishingType")}</label>
          <select value={filters.fishingType || ""} onChange={(e) => update("fishingType", e.target.value)} className="input">
            <option value="">{t("filter.allMethods")}</option>
            {methods.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t("filter.minDepth")}</label>
          <input type="number" value={filters.minDepth || ""} onChange={(e) => update("minDepth", e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">{t("filter.maxDepth")}</label>
          <input type="number" value={filters.maxDepth || ""} onChange={(e) => update("maxDepth", e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">{t("filter.minRating")}</label>
          <select value={filters.minRating || ""} onChange={(e) => update("minRating", e.target.value)} className="input">
            <option value="">-</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>{"★".repeat(r)}</option>
            ))}
          </select>
        </div>
        {showUserFilter && users && (
          <div>
            <label className="label">{t("filter.user")}</label>
            <select value={filters.userId || ""} onChange={(e) => update("userId", e.target.value)} className="input">
              <option value="">{t("filter.allUsers")}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
