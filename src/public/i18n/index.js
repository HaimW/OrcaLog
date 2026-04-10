/**
 * OrcaLog — i18n Module
 *
 * Provides translation lookup, language switching, and RTL direction management.
 * Language is persisted in localStorage and synced to UserProfiles.
 */

import { he } from './he';
import { en } from './en';
import { DEFAULT_LANGUAGE } from '../config/constants';

const dictionaries = { he, en };
const STORAGE_KEY = 'orcalog_lang';
const SUPPORTED_LANGUAGES = ['he', 'en'];

let currentLang = DEFAULT_LANGUAGE;
let changeListeners = [];

// ─── Core API ─────────────────────────────────────────────────

/**
 * Translate a key with optional replacements.
 * @param {string} key - Dot-notation key (e.g. 'form.date')
 * @param {Object<string, string|number>} [replacements] - Interpolation values
 * @returns {string} Translated string or the key itself if not found
 *
 * @example
 * t('card.depth', { value: 15 })  // "15 מ׳ עומק" or "15m depth"
 */
export function t(key, replacements) {
  const dict = dictionaries[currentLang] || dictionaries[DEFAULT_LANGUAGE];
  let text = dict[key];

  if (text === undefined) {
    // Fallback to English, then to the key itself
    text = dictionaries.en[key] || key;
  }

  if (replacements) {
    Object.keys(replacements).forEach(token => {
      text = text.replace(new RegExp(`\\{${token}\\}`, 'g'), String(replacements[token]));
    });
  }

  return text;
}

/**
 * Get the current language code.
 * @returns {'he'|'en'}
 */
export function getLang() {
  return currentLang;
}

/**
 * Set the active language.
 * Updates localStorage, applies direction, and notifies listeners.
 * @param {'he'|'en'} lang
 */
export function setLang(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) return;
  currentLang = lang;

  try {
    // localStorage may not be available in all Wix contexts
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  } catch (_) {
    // Silently ignore storage errors
  }

  applyDirection();
  notifyListeners();
}

/**
 * Initialize language from stored preference.
 * Call once on page load.
 * @param {string} [userPreferenceLang] - Language from UserProfiles, takes priority
 */
export function initLang(userPreferenceLang) {
  let lang = userPreferenceLang;

  if (!lang) {
    try {
      if (typeof localStorage !== 'undefined') {
        lang = localStorage.getItem(STORAGE_KEY);
      }
    } catch (_) {
      // Ignore
    }
  }

  if (lang && SUPPORTED_LANGUAGES.includes(lang)) {
    currentLang = lang;
  } else {
    currentLang = DEFAULT_LANGUAGE;
  }

  applyDirection();
}

/**
 * Toggle between Hebrew and English.
 * @returns {'he'|'en'} The new language
 */
export function toggleLang() {
  const newLang = currentLang === 'he' ? 'en' : 'he';
  setLang(newLang);
  return newLang;
}

// ─── Direction ────────────────────────────────────────────────

/**
 * Apply RTL/LTR direction to the document.
 */
export function applyDirection() {
  try {
    if (typeof document !== 'undefined') {
      const dir = currentLang === 'he' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', currentLang);
    }
  } catch (_) {
    // Not in a browser context
  }
}

/**
 * Check if current language is RTL.
 * @returns {boolean}
 */
export function isRTL() {
  return currentLang === 'he';
}

// ─── Locale Helpers ───────────────────────────────────────────

/**
 * Get the locale string for Intl APIs.
 * @returns {string}
 */
export function getLocale() {
  return currentLang === 'he' ? 'he-IL' : 'en-US';
}

/**
 * Get supported languages list.
 * @returns {string[]}
 */
export function getSupportedLanguages() {
  return [...SUPPORTED_LANGUAGES];
}

// ─── Change Listeners ─────────────────────────────────────────

/**
 * Register a callback for language changes.
 * @param {Function} callback - Called with the new language code
 * @returns {Function} Unsubscribe function
 */
export function onLangChange(callback) {
  changeListeners.push(callback);
  return () => {
    changeListeners = changeListeners.filter(cb => cb !== callback);
  };
}

function notifyListeners() {
  changeListeners.forEach(cb => {
    try {
      cb(currentLang);
    } catch (_) {
      // Don't let a bad listener break others
    }
  });
}
