/**
 * OrcaLog — WhatsApp Share Builder
 *
 * Builds a formatted message and opens wa.me or copies to clipboard.
 */

import { t, getLang } from '../i18n/index';
import { formatDate, formatLocation, formatCatchesSummary } from './formatters';

/**
 * Build a WhatsApp share message from a dive entry.
 * @param {Object} entry - DiveEntry object
 * @returns {string} Formatted message text
 */
export function buildShareMessage(entry) {
  const lines = [];

  // Title
  lines.push(t('share.title', {
    date: formatDate(entry.date),
    time: entry.time || '',
  }));

  // Location
  if (entry.location) {
    lines.push(t('share.location', {
      location: formatLocation(entry.location),
    }));
  }

  // Details
  const waterTemp = entry.weather?.waterTemperature;
  lines.push(t('share.details', {
    depth: entry.depth || 0,
    visibility: entry.visibility || 0,
    waterTemp: waterTemp !== undefined ? waterTemp : '-',
  }));

  // Catches
  if (entry.catches && entry.catches.length > 0) {
    const catchList = formatCatchesSummary(entry.catches);
    if (catchList) {
      lines.push(t('share.catches', { list: catchList }));
    }
  }

  // Rating
  if (entry.rating) {
    lines.push(t('share.rating', { rating: entry.rating }));
  }

  // Notes
  if (entry.notes) {
    lines.push(t('share.notes', { notes: entry.notes }));
  }

  return lines.join('\n');
}

/**
 * Open WhatsApp with the share message.
 * @param {Object} entry - DiveEntry object
 * @param {string} [whatsappGroupLink] - Optional group link to include
 * @returns {boolean} Whether the share was initiated
 */
export function shareViaWhatsApp(entry, whatsappGroupLink) {
  const message = buildShareMessage(entry);
  let url;

  if (whatsappGroupLink) {
    // Include group link in the message
    const fullMessage = message + '\n\n' + whatsappGroupLink;
    url = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
  } else {
    url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  try {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
      return true;
    }
  } catch (_) {
    // Fallback to clipboard
  }

  return false;
}

/**
 * Copy the share message to clipboard.
 * @param {Object} entry - DiveEntry object
 * @returns {Promise<boolean>} Whether copy succeeded
 */
export async function copyShareMessage(entry) {
  const message = buildShareMessage(entry);

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      return true;
    }
  } catch (_) {
    // Fallback: textarea trick
    try {
      const textarea = document.createElement('textarea');
      textarea.value = message;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (__) {
      return false;
    }
  }

  return false;
}
