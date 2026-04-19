import { MAX_NOTES_LENGTH, MAX_DEPTH, MAX_VISIBILITY } from "./constants";

export function required(value: any): string | null {
  if (value === undefined || value === null || value === "") return "error.required";
  return null;
}

export function dateRequired(value: any): string | null {
  if (!value) return "error.dateRequired";
  return null;
}

export function rating(value: any): string | null {
  if (value === undefined || value === null) return "error.ratingRequired";
  if (typeof value !== "number" || value < 1 || value > 5) return "error.ratingRange";
  return null;
}

export function depth(value: any): string | null {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > MAX_DEPTH) return "error.depthRange";
  return null;
}

export function visibility(value: any): string | null {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > MAX_VISIBILITY) return "error.visibilityRange";
  return null;
}

export function airTemp(value: any): string | null {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (isNaN(num) || num < -5 || num > 50) return "error.airTempRange";
  return null;
}

export function waterTemp(value: any): string | null {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > 40) return "error.waterTempRange";
  return null;
}

export function intensity(value: any): string | null {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > 10) return "error.intensityRange";
  return null;
}

export function notesLength(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length > MAX_NOTES_LENGTH) return "error.notesLength";
  return null;
}

export function positiveNumber(value: any, errorKey: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (isNaN(num) || num < 0) return errorKey;
  return null;
}

export function quantity(value: any): string | null {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  if (isNaN(num) || num < 1) return "error.quantityMin";
  return null;
}

export function validateEntryForm(data: any): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const check = (field: string, error: string | null) => {
    if (error) errors[field] = error;
  };

  check("date", dateRequired(data.date));
  check("rating", rating(data.rating));
  check("depth", depth(data.depth));
  check("visibility", visibility(data.visibility));
  check("notes", notesLength(data.notes));

  if (data.weather) {
    check("airTemp", airTemp(data.weather.temperature));
    check("waterTemp", waterTemp(data.weather.waterTemperature));
    check("windIntensity", intensity(data.weather.windIntensity));
    check("currentIntensity", intensity(data.weather.currentIntensity));
  }

  if (data.catches && Array.isArray(data.catches)) {
    data.catches.forEach((c: any, i: number) => {
      if (!c.species) {
        errors[`catch_${i}_species`] = "error.required";
      }
      check(`catch_${i}_quantity`, quantity(c.quantity));
      check(`catch_${i}_weight`, positiveNumber(c.weight, "error.weightPositive"));
      check(`catch_${i}_length`, positiveNumber(c.length, "error.lengthPositive"));
    });
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
