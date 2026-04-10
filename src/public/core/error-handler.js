/**
 * OrcaLog — Error Handler
 *
 * Shows localized error/success toasts and handles API result errors.
 */

import { t } from '../i18n/index';
import { EL } from '../config/element-ids';
import * as eventBus from './event-bus';

let $wRef = null;
let toastTimeout = null;

/**
 * Initialize with $w reference.
 * @param {Function} $w
 */
export function init($w) {
  $wRef = $w;
}

/**
 * Show an error message to the user.
 * Maps error codes to i18n keys.
 * @param {string} errorCode - Error code from API result
 */
export function showError(errorCode) {
  const message = mapErrorToMessage(errorCode);
  showToast(message, 'error');
  eventBus.emit('error', { code: errorCode, message });
}

/**
 * Show a success message.
 * @param {string} messageKey - i18n key
 * @param {Object} [replacements]
 */
export function showSuccess(messageKey, replacements) {
  const message = t(messageKey, replacements);
  showToast(message, 'success');
}

/**
 * Show an info message.
 * @param {string} messageKey - i18n key
 * @param {Object} [replacements]
 */
export function showInfo(messageKey, replacements) {
  const message = t(messageKey, replacements);
  showToast(message, 'info');
}

/**
 * Handle an API result — if failed, show error and return false.
 * @param {Object} result - { success, data, error }
 * @param {string} [successKey] - i18n key for success message (optional)
 * @param {Object} [replacements] - Replacements for success message
 * @returns {boolean} Whether the result was successful
 */
export function handleResult(result, successKey, replacements) {
  if (!result.success) {
    showError(result.error);
    return false;
  }
  if (successKey) {
    showSuccess(successKey, replacements);
  }
  return true;
}

// ─── Toast Display ────────────────────────────────────────────

/**
 * Show a toast message.
 * @param {string} message - Display text
 * @param {'error'|'success'|'info'} type
 */
function showToast(message, type = 'info') {
  if (!$wRef) {
    console.warn('[ErrorHandler] Not initialized, logging:', type, message);
    return;
  }

  try {
    const toastContainer = $wRef(EL.toast.container);
    const toastMessage = $wRef(EL.toast.message);

    toastMessage.text = message;

    // Apply styling based on type via CSS classes or inline
    // (In Wix, we'd adjust element style properties)
    toastContainer.show('fade');

    // Auto-hide after 4 seconds
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastTimeout = setTimeout(() => {
      try {
        toastContainer.hide('fade');
      } catch (_) {}
    }, 4000);
  } catch (err) {
    // Toast elements may not exist — fall back to console
    console.warn(`[OrcaLog ${type}]`, message);
  }
}

// ─── Error Code Mapping ───────────────────────────────────────

const ERROR_MAP = {
  'NOT_AUTHENTICATED': 'error.unauthorized',
  'NOT_AUTHORIZED': 'error.unauthorized',
  'NOT_FOUND': 'error.notFound',
  'VALIDATION_FAILED': 'error.generic',
  'NETWORK_ERROR': 'error.networkError',
  'CONFIG_NOT_FOUND': 'error.generic',
  'BULK_INSERT_FAILED': 'io.importError',
  'IMPORT_NOT_ARRAY': 'io.invalidFormat',
};

/**
 * Map an error code to a localized message.
 * @param {string} errorCode
 * @returns {string}
 */
function mapErrorToMessage(errorCode) {
  const key = ERROR_MAP[errorCode];
  if (key) {
    return t(key, { error: errorCode });
  }
  // Try direct i18n key
  const direct = t(`error.${errorCode}`);
  if (direct !== `error.${errorCode}`) {
    return direct;
  }
  return t('error.generic');
}
