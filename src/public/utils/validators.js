/**
 * OrcaLog — Client-side Form Validators
 *
 * Returns bilingual error messages via i18n keys.
 * All validators return null (valid) or an i18n error key string.
 */

import { MAX_NOTES_LENGTH, MAX_DEPTH, MAX_VISIBILITY } from '../config/constants';

/**
 * Validate that a value is not empty.
 * @param {*} value
 * @returns {string|null} Error key or null
 */
export function required(value) {
  if (value === undefined || value === null || value === '') return 'error.required';
  return null;
}

/**
 * Validate date is provided.
 * @param {*} value
 * @returns {string|null}
 */
export function dateRequired(value) {
  if (!value) return 'error.dateRequired';
  return null;
}

/**
 * Validate rating (1-5).
 * @param {*} value
 * @returns {string|null}
 */
export function rating(value) {
  if (value === undefined || value === null) return 'error.ratingRequired';
  if (typeof value !== 'number' || value < 1 || value > 5) return 'error.ratingRange';
  return null;
}

/**
 * Validate depth (0-100).
 * @param {*} value
 * @returns {string|null}
 */
export function depth(value) {
  if (value === undefined || value === null || value === '') return null; // Optional
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > MAX_DEPTH) return 'error.depthRange';
  return null;
}

/**
 * Validate visibility (0-50).
 * @param {*} value
 * @returns {string|null}
 */
export function visibility(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > MAX_VISIBILITY) return 'error.visibilityRange';
  return null;
}

/**
 * Validate air temperature (-5 to 50).
 * @param {*} value
 * @returns {string|null}
 */
export function airTemp(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (isNaN(num) || num < -5 || num > 50) return 'error.airTempRange';
  return null;
}

/**
 * Validate water temperature (0-40).
 * @param {*} value
 * @returns {string|null}
 */
export function waterTemp(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > 40) return 'error.waterTempRange';
  return null;
}

/**
 * Validate intensity (0-10).
 * @param {*} value
 * @returns {string|null}
 */
export function intensity(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > 10) return 'error.intensityRange';
  return null;
}

/**
 * Validate notes length.
 * @param {string} value
 * @returns {string|null}
 */
export function notesLength(value) {
  if (!value) return null;
  if (value.length > MAX_NOTES_LENGTH) return 'error.notesLength';
  return null;
}

/**
 * Validate positive number (optional field).
 * @param {*} value
 * @param {string} errorKey
 * @returns {string|null}
 */
export function positiveNumber(value, errorKey) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (isNaN(num) || num < 0) return errorKey;
  return null;
}

/**
 * Validate a minimum quantity of 1.
 * @param {*} value
 * @returns {string|null}
 */
export function quantity(value) {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  if (isNaN(num) || num < 1) return 'error.quantityMin';
  return null;
}

/**
 * Run all validators on a form data object.
 * @param {Object} data - Form data
 * @returns {{ valid: boolean, errors: Object<string, string> }} Field-level errors
 */
export function validateEntryForm(data) {
  const errors = {};

  const check = (field, error) => {
    if (error) errors[field] = error;
  };

  check('date', dateRequired(data.date));
  check('rating', rating(data.rating));
  check('depth', depth(data.depth));
  check('visibility', visibility(data.visibility));
  check('notes', notesLength(data.notes));

  // Weather
  if (data.weather) {
    check('airTemp', airTemp(data.weather.temperature));
    check('waterTemp', waterTemp(data.weather.waterTemperature));
    check('windIntensity', intensity(data.weather.windIntensity));
    check('currentIntensity', intensity(data.weather.currentIntensity));
  }

  // Catches
  if (data.catches && Array.isArray(data.catches)) {
    data.catches.forEach((c, i) => {
      if (!c.species) {
        errors[`catch_${i}_species`] = 'error.required';
      }
      check(`catch_${i}_quantity`, quantity(c.quantity));
      check(`catch_${i}_weight`, positiveNumber(c.weight, 'error.weightPositive'));
      check(`catch_${i}_length`, positiveNumber(c.length, 'error.lengthPositive'));
    });
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
