import {
  getLabel,
  DIVING_LOCATIONS,
  COMMON_FISH_SPECIES,
  FISHING_METHODS,
  WEATHER_CONDITIONS,
  COMPASS_DIRECTIONS,
  EQUIPMENT_TYPES,
} from "./constants";
import { getLocale } from "@/i18n";

export function formatDate(date: Date | string | null, lang: string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return d.toLocaleDateString(getLocale(lang), { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return d.toLocaleDateString();
  }
}

export function formatDateForInput(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

export function formatNumber(value: number | null | undefined, lang: string, decimals = 1): string {
  if (value === undefined || value === null) return "-";
  try {
    return Number(value).toLocaleString(getLocale(lang), {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  } catch {
    return String(value);
  }
}

export function formatLocation(locationId: string | null, lang: string): string {
  if (!locationId) return "";
  return getLabel(DIVING_LOCATIONS, locationId, lang) || locationId;
}

export function formatSpecies(speciesId: string, lang: string): string {
  if (!speciesId) return "";
  return getLabel(COMMON_FISH_SPECIES, speciesId, lang) || speciesId;
}

export function formatMethod(methodId: string, lang: string): string {
  if (!methodId) return "";
  return getLabel(FISHING_METHODS, methodId, lang) || methodId;
}

export function formatWeatherConditions(conditions: string[] | null, lang: string): string {
  if (!conditions || !Array.isArray(conditions)) return "";
  return conditions.map((c) => getLabel(WEATHER_CONDITIONS, c, lang)).join(", ");
}

export function formatCompassDirection(directionId: string, lang: string): string {
  if (!directionId) return "";
  return getLabel(COMPASS_DIRECTIONS, directionId, lang) || directionId;
}

export function formatEquipment(type: "masks" | "fins" | "suits", id: string, lang: string): string {
  if (!id || !EQUIPMENT_TYPES[type]) return "";
  return getLabel(EQUIPMENT_TYPES[type], id, lang) || id;
}

export function formatFishingTypes(types: string[] | null, lang: string): string {
  if (!types || !Array.isArray(types)) return "";
  return types.map((t) => formatMethod(t, lang)).join(", ");
}

export function formatRating(r: number | null): string {
  if (!r) return "";
  return "\u2605".repeat(r) + "\u2606".repeat(5 - r);
}

export function formatCatchesSummary(catches: any[] | null, lang: string): string {
  if (!catches || catches.length === 0) return "";
  return catches
    .filter((c: any) => !c.released)
    .map((c: any) => {
      const name = formatSpecies(c.species, lang);
      return c.quantity > 1 ? `${name} \u00d7${c.quantity}` : name;
    })
    .join(", ");
}

export function countFish(catches: any[] | null): number {
  if (!catches || catches.length === 0) return 0;
  return catches
    .filter((c: any) => !c.released)
    .reduce((sum: number, c: any) => sum + (c.quantity || 1), 0);
}
