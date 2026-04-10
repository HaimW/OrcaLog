/**
 * OrcaLog — Detail View Controller
 *
 * Read-only display of a dive entry with photo gallery and actions.
 */

import { getEntry, deleteEntry } from 'backend/api/entries-api';
import { getWhatsappLink } from 'backend/api/config-api';
import { EL } from '../config/element-ids';
import { VIEWS } from '../config/constants';
import { t } from '../i18n/index';
import {
  formatDate,
  formatLocation,
  formatRating,
  formatEquipment,
  formatWeatherConditions,
  formatCompassDirection,
  formatSpecies,
  formatMethod,
  formatFishingTypes,
} from '../utils/formatters';
import { shareViaWhatsApp, copyShareMessage } from '../utils/share';
import * as stateManager from '../core/state-manager';
import * as eventBus from '../core/event-bus';
import * as errorHandler from '../core/error-handler';

let $w = null;
let currentEntry = null;

// ─── Public API ──────────────────────────────────────────────

export async function init($wRef, params = {}) {
  $w = $wRef;
  const entryId = params.entryId;

  if (!entryId) {
    stateManager.navigate(VIEWS.LIST);
    return;
  }

  applyStaticText();
  bindHandlers();
  await loadEntry(entryId);
}

export function destroy() {
  currentEntry = null;
}

export async function refresh() {
  if (currentEntry) {
    await loadEntry(currentEntry._id);
  }
}

// ─── Setup ───────────────────────────────────────────────────

function applyStaticText() {
  safeSet(EL.detail.title, 'text', t('detail.title'));
  safeSet(EL.detail.editBtn, 'label', t('detail.edit'));
  safeSet(EL.detail.shareBtn, 'label', t('detail.share'));
  safeSet(EL.detail.deleteBtn, 'label', t('detail.delete'));
  safeSet(EL.detail.backBtn, 'label', t('detail.back'));
}

function bindHandlers() {
  try {
    $w(EL.detail.editBtn).onClick(() => {
      if (currentEntry) {
        stateManager.navigate(VIEWS.FORM_EDIT, { entryId: currentEntry._id });
      }
    });
  } catch (_) {}

  try {
    $w(EL.detail.shareBtn).onClick(handleShare);
  } catch (_) {}

  try {
    $w(EL.detail.deleteBtn).onClick(handleDelete);
  } catch (_) {}

  try {
    $w(EL.detail.backBtn).onClick(() => {
      stateManager.goBack();
    });
  } catch (_) {}

  // Detail catches repeater
  try {
    $w(EL.detail.catchesRepeater).onItemReady(($item, itemData) => {
      renderCatchItem($item, itemData);
    });
  } catch (_) {}
}

// ─── Data Loading ────────────────────────────────────────────

async function loadEntry(entryId) {
  const result = await getEntry(entryId);
  if (!result.success) {
    errorHandler.showError(result.error);
    stateManager.navigate(VIEWS.LIST);
    return;
  }
  currentEntry = result.data;
  renderDetail(currentEntry);
}

// ─── Rendering ───────────────────────────────────────────────

function renderDetail(entry) {
  // Date & Time
  safeSet(EL.detail.date, 'text', formatDate(entry.date));
  safeSet(EL.detail.time, 'text', entry.time || '');

  if (entry.startTime && entry.endTime) {
    safeSet(EL.detail.timeRange, 'text',
      t('detail.timeRange', { start: entry.startTime, end: entry.endTime })
    );
    safeShow(EL.detail.timeRange);
  } else {
    safeHide(EL.detail.timeRange);
  }

  // Location
  safeSet(EL.detail.location, 'text', formatLocation(entry.location) || entry.location || '');
  if (entry.detailedLocation) {
    safeSet(EL.detail.detailedLoc, 'text', entry.detailedLocation);
    safeShow(EL.detail.detailedLoc);
  } else {
    safeHide(EL.detail.detailedLoc);
  }

  // Core stats
  safeSet(EL.detail.depth, 'text', `${entry.depth || 0} ${t('detail.meters')}`);
  safeSet(EL.detail.duration, 'text',
    entry.duration ? `${entry.duration} ${t('detail.minutes')}` : '-'
  );
  safeSet(EL.detail.visibility, 'text',
    entry.visibility ? `${entry.visibility} ${t('detail.meters')}` : '-'
  );

  // Weather
  if (entry.weather) {
    safeSet(EL.detail.weatherConditions, 'text', formatWeatherConditions(entry.weather.conditions));
    safeSet(EL.detail.airTemp, 'text',
      entry.weather.temperature !== undefined ? `${entry.weather.temperature}${t('detail.celsius')}` : '-'
    );
    safeSet(EL.detail.waterTemp, 'text',
      entry.weather.waterTemperature !== undefined ? `${entry.weather.waterTemperature}${t('detail.celsius')}` : '-'
    );

    if (entry.weather.windDirection) {
      safeSet(EL.detail.windInfo, 'text',
        t('detail.direction', {
          direction: formatCompassDirection(entry.weather.windDirection),
          intensity: entry.weather.windIntensity || 0,
        })
      );
    }

    if (entry.weather.currentDirection) {
      safeSet(EL.detail.currentInfo, 'text',
        t('detail.direction', {
          direction: formatCompassDirection(entry.weather.currentDirection),
          intensity: entry.weather.currentIntensity || 0,
        })
      );
    }
  }

  // Equipment
  if (entry.equipment) {
    safeSet(EL.detail.mask, 'text', formatEquipment('masks', entry.equipment.mask) || '-');
    safeSet(EL.detail.fins, 'text', formatEquipment('fins', entry.equipment.fins) || '-');
    safeSet(EL.detail.suit, 'text', formatEquipment('suits', entry.equipment.suit) || '-');
    safeSet(EL.detail.weight, 'text',
      entry.equipment.weight ? `${entry.equipment.weight} ${t('detail.kg')}` : '-'
    );
    safeSet(EL.detail.gear, 'text',
      Array.isArray(entry.equipment.gear) ? entry.equipment.gear.join(', ') : '-'
    );
  }

  // Catches
  if (entry.catches && entry.catches.length > 0) {
    try {
      $w(EL.detail.catchesRepeater).data = entry.catches.map((c, i) => ({
        ...c,
        _id: c.id || `catch_${i}`,
      }));
      safeShow(EL.detail.catchesRepeater);
      safeHide(EL.detail.catchesEmpty);
    } catch (_) {}
  } else {
    safeSet(EL.detail.catchesEmpty, 'text', t('detail.noCatches'));
    safeShow(EL.detail.catchesEmpty);
    safeHide(EL.detail.catchesRepeater);
  }

  // Photos gallery
  if (entry.photos && entry.photos.length > 0) {
    try {
      $w(EL.detail.photoGallery).items = entry.photos.map((url, i) => ({
        src: url,
        title: `Photo ${i + 1}`,
        description: '',
        type: 'image',
      }));
      safeShow(EL.detail.photoGallery);
    } catch (_) {}
  } else {
    safeHide(EL.detail.photoGallery);
  }

  // Notes
  safeSet(EL.detail.notes, 'text', entry.notes || t('detail.noNotes'));

  // Rating
  safeSet(EL.detail.rating, 'text', formatRating(entry.rating));
}

function renderCatchItem($item, itemData) {
  try {
    $item('#catchSpeciesText').text = formatSpecies(itemData.species);
  } catch (_) {}
  try {
    const parts = [];
    if (itemData.quantity > 1) parts.push(`×${itemData.quantity}`);
    if (itemData.weight) parts.push(`${itemData.weight}${t('detail.grams')}`);
    if (itemData.length) parts.push(`${itemData.length}${t('detail.cm')}`);
    $item('#catchStatsText').text = parts.join(' • ');
  } catch (_) {}
  try {
    $item('#catchMethodText').text = formatMethod(itemData.method);
  } catch (_) {}
  try {
    $item('#catchReleasedText').text = itemData.released
      ? t('detail.released')
      : t('detail.kept');
  } catch (_) {}
  try {
    if (itemData.photo) {
      $item('#catchPhotoImg').src = itemData.photo;
      $item('#catchPhotoImg').show();
    } else {
      $item('#catchPhotoImg').hide();
    }
  } catch (_) {}
  try {
    if (itemData.notes) {
      $item('#catchNotesText').text = itemData.notes;
      $item('#catchNotesText').show();
    } else {
      $item('#catchNotesText').hide();
    }
  } catch (_) {}
}

// ─── Handlers ────────────────────────────────────────────────

async function handleShare() {
  if (!currentEntry) return;

  try {
    // Try to get WhatsApp group link
    let groupLink = '';
    try {
      const configResult = await getWhatsappLink();
      if (configResult.success) {
        groupLink = configResult.data.whatsappGroupLink || '';
      }
    } catch (_) {}

    const opened = shareViaWhatsApp(currentEntry, groupLink);
    if (!opened) {
      const copied = await copyShareMessage(currentEntry);
      if (copied) {
        errorHandler.showSuccess('share.copied');
      } else {
        errorHandler.showError('SHARE_FAILED');
      }
    }
  } catch (err) {
    errorHandler.showError('SHARE_FAILED');
  }
}

async function handleDelete() {
  if (!currentEntry) return;

  const confirmed = await showConfirmModal(
    t('confirm.deleteEntry'),
    t('confirm.deleteEntryDesc')
  );

  if (!confirmed) return;

  try {
    const result = await deleteEntry(currentEntry._id);
    if (result.success) {
      eventBus.emit('entry:deleted', currentEntry._id);
      stateManager.navigate(VIEWS.LIST);
    } else {
      errorHandler.showError(result.error);
    }
  } catch (err) {
    errorHandler.showError(err.message || 'UNKNOWN_ERROR');
  }
}

function showConfirmModal(title, desc) {
  return new Promise((resolve) => {
    try {
      safeSet(EL.modal.message, 'text', `${title}\n\n${desc}`);
      safeSet(EL.modal.confirmBtn, 'label', t('confirm.yes'));
      safeSet(EL.modal.cancelBtn, 'label', t('confirm.no'));
      safeShow(EL.modal.container);

      const yesBtn = $w(EL.modal.confirmBtn);
      const noBtn = $w(EL.modal.cancelBtn);

      yesBtn.onClick(() => {
        safeHide(EL.modal.container);
        resolve(true);
      });
      noBtn.onClick(() => {
        safeHide(EL.modal.container);
        resolve(false);
      });
    } catch (_) {
      resolve(true);
    }
  });
}

// ─── Safe Helpers ────────────────────────────────────────────

function safeSet(id, prop, value) {
  try { $w(id)[prop] = value; } catch (_) {}
}

function safeShow(id) {
  try { $w(id).show(); } catch (_) {}
}

function safeHide(id) {
  try { $w(id).hide(); } catch (_) {}
}
