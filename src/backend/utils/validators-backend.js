/**
 * OrcaLog — Backend Validators
 *
 * Server-side validation for data integrity.
 * These run in data hooks and service layer.
 */

const MAX_NOTES_LENGTH = 500;
const MAX_DEPTH = 100;
const MAX_VISIBILITY = 50;
const VALID_FISHING_TYPES = ['speargun', 'pole_spear', 'hook', 'net', 'other'];
const VALID_WEATHER = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy'];
const VALID_COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

/**
 * Validate a DiveEntry before insert/update.
 * @param {Object} entry
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateDiveEntry(entry) {
  const errors = [];

  // Required fields
  if (!entry.date) {
    errors.push('DATE_REQUIRED');
  }
  if (entry.rating === undefined || entry.rating === null) {
    errors.push('RATING_REQUIRED');
  }

  // Numeric ranges
  if (entry.depth !== undefined && entry.depth !== null) {
    if (typeof entry.depth !== 'number' || entry.depth < 0 || entry.depth > MAX_DEPTH) {
      errors.push('DEPTH_OUT_OF_RANGE');
    }
  }

  if (entry.visibility !== undefined && entry.visibility !== null) {
    if (typeof entry.visibility !== 'number' || entry.visibility < 0 || entry.visibility > MAX_VISIBILITY) {
      errors.push('VISIBILITY_OUT_OF_RANGE');
    }
  }

  if (entry.rating !== undefined && entry.rating !== null) {
    if (typeof entry.rating !== 'number' || entry.rating < 1 || entry.rating > 5) {
      errors.push('RATING_OUT_OF_RANGE');
    }
  }

  if (entry.duration !== undefined && entry.duration !== null) {
    if (typeof entry.duration !== 'number' || entry.duration < 0) {
      errors.push('DURATION_NEGATIVE');
    }
  }

  // Notes length
  if (entry.notes && typeof entry.notes === 'string' && entry.notes.length > MAX_NOTES_LENGTH) {
    errors.push('NOTES_TOO_LONG');
  }

  // Fishing types validation
  if (entry.fishingTypes && Array.isArray(entry.fishingTypes)) {
    const invalid = entry.fishingTypes.filter(ft => !VALID_FISHING_TYPES.includes(ft));
    if (invalid.length > 0) {
      errors.push('INVALID_FISHING_TYPE');
    }
  }

  // Weather validation
  if (entry.weather) {
    const w = entry.weather;
    if (w.conditions && Array.isArray(w.conditions)) {
      const invalid = w.conditions.filter(c => !VALID_WEATHER.includes(c));
      if (invalid.length > 0) {
        errors.push('INVALID_WEATHER_CONDITION');
      }
    }
    if (w.temperature !== undefined && w.temperature !== null) {
      if (typeof w.temperature !== 'number' || w.temperature < -5 || w.temperature > 50) {
        errors.push('AIR_TEMP_OUT_OF_RANGE');
      }
    }
    if (w.waterTemperature !== undefined && w.waterTemperature !== null) {
      if (typeof w.waterTemperature !== 'number' || w.waterTemperature < 0 || w.waterTemperature > 40) {
        errors.push('WATER_TEMP_OUT_OF_RANGE');
      }
    }
    if (w.windDirection && !VALID_COMPASS.includes(w.windDirection)) {
      errors.push('INVALID_WIND_DIRECTION');
    }
    if (w.currentDirection && !VALID_COMPASS.includes(w.currentDirection)) {
      errors.push('INVALID_CURRENT_DIRECTION');
    }
    if (w.windIntensity !== undefined && (w.windIntensity < 0 || w.windIntensity > 10)) {
      errors.push('WIND_INTENSITY_OUT_OF_RANGE');
    }
    if (w.currentIntensity !== undefined && (w.currentIntensity < 0 || w.currentIntensity > 10)) {
      errors.push('CURRENT_INTENSITY_OUT_OF_RANGE');
    }
  }

  // Catches validation
  if (entry.catches && Array.isArray(entry.catches)) {
    entry.catches.forEach((c, i) => {
      if (!c.species) {
        errors.push(`CATCH_${i}_SPECIES_REQUIRED`);
      }
      if (c.quantity !== undefined && (typeof c.quantity !== 'number' || c.quantity < 1)) {
        errors.push(`CATCH_${i}_QUANTITY_INVALID`);
      }
      if (c.weight !== undefined && c.weight !== null && (typeof c.weight !== 'number' || c.weight < 0)) {
        errors.push(`CATCH_${i}_WEIGHT_INVALID`);
      }
      if (c.length !== undefined && c.length !== null && (typeof c.length !== 'number' || c.length < 0)) {
        errors.push(`CATCH_${i}_LENGTH_INVALID`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize a DiveEntry — trim strings, clamp numbers.
 * @param {Object} entry
 * @returns {Object} Sanitized entry
 */
export function sanitizeDiveEntry(entry) {
  const sanitized = { ...entry };

  if (typeof sanitized.notes === 'string') {
    sanitized.notes = sanitized.notes.trim().slice(0, MAX_NOTES_LENGTH);
  }

  if (typeof sanitized.detailedLocation === 'string') {
    sanitized.detailedLocation = sanitized.detailedLocation.trim();
  }

  if (typeof sanitized.location === 'string') {
    sanitized.location = sanitized.location.trim();
  }

  // Ensure catches have IDs
  if (sanitized.catches && Array.isArray(sanitized.catches)) {
    sanitized.catches = sanitized.catches.map((c, i) => ({
      ...c,
      id: c.id || `catch_${Date.now()}_${i}`,
      quantity: c.quantity || 1,
      released: !!c.released,
    }));
  }

  // Ensure arrays exist
  if (!Array.isArray(sanitized.photos)) {
    sanitized.photos = [];
  }
  if (!Array.isArray(sanitized.fishingTypes)) {
    sanitized.fishingTypes = [];
  }
  if (!Array.isArray(sanitized.catches)) {
    sanitized.catches = [];
  }

  return sanitized;
}

/**
 * Validate import data shape.
 * @param {Array} entries
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateImportData(entries) {
  const errors = [];

  if (!Array.isArray(entries)) {
    return { valid: false, errors: ['IMPORT_NOT_ARRAY'] };
  }

  entries.forEach((entry, i) => {
    if (!entry.date) {
      errors.push(`ENTRY_${i}_DATE_REQUIRED`);
    }
    if (entry.rating === undefined || entry.rating === null) {
      errors.push(`ENTRY_${i}_RATING_REQUIRED`);
    }
  });

  return { valid: errors.length === 0, errors };
}
