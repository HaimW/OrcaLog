/**
 * OrcaLog — Formatters
 *
 * Locale-aware date, number, and unit formatting.
 */

import { getLang, getLocale } from '../i18n/index';
import { getLabel, DIVING_LOCATIONS, COMMON_FISH_SPECIES, FISHING_METHODS, WEATHER_CONDITIONS, COMPASS_DIRECTIONS, EQUIPMENT_TYPES } from '../config/constants';

/**
 * Format a date for display.
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return d.toLocaleDateString(getLocale(), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (_) {
    return d.toLocaleDateString();
  }
}

/**
 * Format a date for input value (YYYY-MM-DD).
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDateForInput(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Format time (HH:mm).
 * @param {string} time
 * @returns {string}
 */
export function formatTime(time) {
  return time || '';
}

/**
 * Format a number with locale.
 * @param {number} value
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatNumber(value, decimals = 1) {
  if (value === undefined || value === null) return '-';
  try {
    return Number(value).toLocaleString(getLocale(), {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  } catch (_) {
    return String(value);
  }
}

/**
 * Format a location name (localized).
 * @param {string} locationId
 * @returns {string}
 */
export function formatLocation(locationId) {
  if (!locationId) return '';
  const lang = getLang();
  return getLabel(DIVING_LOCATIONS, locationId, lang) || locationId;
}

/**
 * Format a fish species name (localized).
 * @param {string} speciesId
 * @returns {string}
 */
export function formatSpecies(speciesId) {
  if (!speciesId) return '';
  const lang = getLang();
  return getLabel(COMMON_FISH_SPECIES, speciesId, lang) || speciesId;
}

/**
 * Format a fishing method (localized).
 * @param {string} methodId
 * @returns {string}
 */
export function formatMethod(methodId) {
  if (!methodId) return '';
  const lang = getLang();
  return getLabel(FISHING_METHODS, methodId, lang) || methodId;
}

/**
 * Format weather conditions (localized, joined).
 * @param {string[]} conditions
 * @returns {string}
 */
export function formatWeatherConditions(conditions) {
  if (!conditions || !Array.isArray(conditions)) return '';
  const lang = getLang();
  return conditions.map(c => getLabel(WEATHER_CONDITIONS, c, lang)).join(', ');
}

/**
 * Format compass direction (localized).
 * @param {string} directionId
 * @returns {string}
 */
export function formatCompassDirection(directionId) {
  if (!directionId) return '';
  const lang = getLang();
  return getLabel(COMPASS_DIRECTIONS, directionId, lang) || directionId;
}

/**
 * Format equipment mask/fins/suit (localized).
 * @param {string} type - 'masks', 'fins', or 'suits'
 * @param {string} id
 * @returns {string}
 */
export function formatEquipment(type, id) {
  if (!id || !EQUIPMENT_TYPES[type]) return '';
  const lang = getLang();
  return getLabel(EQUIPMENT_TYPES[type], id, lang) || id;
}

/**
 * Format fishing types array as a comma-separated string.
 * @param {string[]} types
 * @returns {string}
 */
export function formatFishingTypes(types) {
  if (!types || !Array.isArray(types)) return '';
  return types.map(formatMethod).join(', ');
}

/**
 * Format a rating as stars.
 * @param {number} rating - 1-5
 * @returns {string}
 */
export function formatRating(rating) {
  if (!rating) return '';
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

/**
 * Format a list of catches for display (species x quantity).
 * @param {Array} catches
 * @returns {string}
 */
export function formatCatchesSummary(catches) {
  if (!catches || catches.length === 0) return '';
  return catches
    .filter(c => !c.released)
    .map(c => {
      const name = formatSpecies(c.species);
      return c.quantity > 1 ? `${name} ×${c.quantity}` : name;
    })
    .join(', ');
}

/**
 * Count total non-released fish.
 * @param {Array} catches
 * @returns {number}
 */
export function countFish(catches) {
  if (!catches || catches.length === 0) return 0;
  return catches
    .filter(c => !c.released)
    .reduce((sum, c) => sum + (c.quantity || 1), 0);
}
