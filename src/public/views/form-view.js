/**
 * OrcaLog — Form View Controller
 *
 * Multi-section add/edit form with client-side validation.
 * Sections: Basic Info, Weather, Equipment, Catches, Photos, Notes & Rating.
 */

import { createEntry, updateEntry, deleteEntry, getEntry } from 'backend/api/entries-api';
import { EL } from '../config/element-ids';
import {
  VIEWS,
  MAX_NOTES_LENGTH,
  WEATHER_CONDITIONS,
  COMPASS_DIRECTIONS,
  FISHING_METHODS,
  DIVING_LOCATIONS,
  COMMON_FISH_SPECIES,
  EQUIPMENT_TYPES,
  RATING_OPTIONS,
  getLocalizedList,
} from '../config/constants';
import { t, getLang } from '../i18n/index';
import { validateEntryForm } from '../utils/validators';
import { formatDateForInput } from '../utils/formatters';
import * as stateManager from '../core/state-manager';
import * as eventBus from '../core/event-bus';
import * as errorHandler from '../core/error-handler';

let $w = null;
let state = {
  mode: 'add',       // 'add' or 'edit'
  entryId: null,     // For edit mode
  entry: null,       // Current entry data being edited
  catches: [],       // Local catches array
  photos: [],        // Local photos array
};

// ─── Public API ──────────────────────────────────────────────

/**
 * Initialize the form view.
 * @param {Function} $wRef
 * @param {Object} params - { entryId } for edit mode
 */
export async function init($wRef, params = {}) {
  $w = $wRef;
  state.entryId = params.entryId || null;
  state.mode = state.entryId ? 'edit' : 'add';

  applyStaticText();
  populateDropdowns();
  bindHandlers();

  if (state.mode === 'edit') {
    await loadEntry(state.entryId);
  } else {
    resetForm();
  }
}

/**
 * Destroy the form view.
 */
export function destroy() {
  state.entry = null;
  state.catches = [];
  state.photos = [];
}

export async function refresh() {
  if (state.mode === 'edit' && state.entryId) {
    await loadEntry(state.entryId);
  }
}

// ─── Setup ───────────────────────────────────────────────────

function applyStaticText() {
  safeSet(EL.form.title, 'text',
    state.mode === 'edit' ? t('form.editTitle') : t('form.addTitle')
  );

  safeSet(EL.form.saveBtn, 'label', t('form.save'));
  safeSet(EL.form.cancelBtn, 'label', t('form.cancel'));
  safeSet(EL.form.deleteBtn, 'label', t('form.delete'));
  safeSet(EL.form.addCatchBtn, 'label', t('form.catch.add'));
  safeSet(EL.form.photoUploadBtn, 'label', t('form.photos.upload'));

  // Placeholders
  safeSet(EL.form.date, 'placeholder', t('form.date.placeholder'));
  safeSet(EL.form.time, 'placeholder', t('form.time.placeholder'));
  safeSet(EL.form.location, 'placeholder', t('form.location.placeholder'));
  safeSet(EL.form.locationFree, 'placeholder', t('form.locationFree.placeholder'));
  safeSet(EL.form.detailedLoc, 'placeholder', t('form.detailedLocation.placeholder'));
  safeSet(EL.form.depth, 'placeholder', t('form.depth.placeholder'));
  safeSet(EL.form.duration, 'placeholder', t('form.duration.placeholder'));
  safeSet(EL.form.visibility, 'placeholder', t('form.visibility.placeholder'));
  safeSet(EL.form.airTemp, 'placeholder', t('form.weather.airTemp.placeholder'));
  safeSet(EL.form.waterTemp, 'placeholder', t('form.weather.waterTemp.placeholder'));
  safeSet(EL.form.weight, 'placeholder', t('form.equipment.weight.placeholder'));
  safeSet(EL.form.gear, 'placeholder', t('form.equipment.gear.placeholder'));
  safeSet(EL.form.notes, 'placeholder', t('form.notes.placeholder'));

  // Show/hide delete based on mode
  if (state.mode === 'edit') {
    safeShow(EL.form.deleteBtn);
  } else {
    safeHide(EL.form.deleteBtn);
  }
}

function populateDropdowns() {
  const lang = getLang();

  // Location
  try {
    $w(EL.form.location).options = [
      { label: t('form.location.placeholder'), value: '' },
      ...getLocalizedList(DIVING_LOCATIONS, lang).map(l => ({ label: l.label, value: l.id })),
    ];
  } catch (_) {}

  // Weather conditions (multi-select)
  try {
    $w(EL.form.weatherConditions).options =
      getLocalizedList(WEATHER_CONDITIONS, lang).map(w => ({ label: w.label, value: w.id }));
  } catch (_) {}

  // Compass directions
  try {
    const compassOptions = [
      { label: t('form.weather.windDirection.placeholder'), value: '' },
      ...getLocalizedList(COMPASS_DIRECTIONS, lang).map(c => ({ label: c.label, value: c.id })),
    ];
    $w(EL.form.windDirection).options = compassOptions;
    $w(EL.form.currentDirection).options = compassOptions;
  } catch (_) {}

  // Equipment
  try {
    $w(EL.form.mask).options = [
      { label: t('form.equipment.mask.placeholder'), value: '' },
      ...getLocalizedList(EQUIPMENT_TYPES.masks, lang).map(m => ({ label: m.label, value: m.id })),
    ];
  } catch (_) {}

  try {
    $w(EL.form.fins).options = [
      { label: t('form.equipment.fins.placeholder'), value: '' },
      ...getLocalizedList(EQUIPMENT_TYPES.fins, lang).map(f => ({ label: f.label, value: f.id })),
    ];
  } catch (_) {}

  try {
    $w(EL.form.suit).options = [
      { label: t('form.equipment.suit.placeholder'), value: '' },
      ...getLocalizedList(EQUIPMENT_TYPES.suits, lang).map(s => ({ label: s.label, value: s.id })),
    ];
  } catch (_) {}

  // Rating dropdown
  try {
    $w(EL.form.rating).options = [
      { label: t('form.rating.placeholder'), value: '' },
      ...RATING_OPTIONS.map(r => ({ label: `${'★'.repeat(r)}`, value: String(r) })),
    ];
  } catch (_) {}
}

function bindHandlers() {
  // Save
  try { $w(EL.form.saveBtn).onClick(handleSave); } catch (_) {}

  // Cancel
  try { $w(EL.form.cancelBtn).onClick(handleCancel); } catch (_) {}

  // Delete
  try { $w(EL.form.deleteBtn).onClick(handleDelete); } catch (_) {}

  // Add catch
  try { $w(EL.form.addCatchBtn).onClick(handleAddCatch); } catch (_) {}

  // Notes character counter
  try {
    $w(EL.form.notes).onInput((event) => {
      const value = event.target.value || '';
      updateNotesCounter(value.length);
    });
  } catch (_) {}

  // Catches repeater
  try {
    $w(EL.form.catchesRepeater).onItemReady(($item, itemData, index) => {
      renderCatchItem($item, itemData, index);
    });
  } catch (_) {}

  // Photo upload
  try {
    $w(EL.form.photoUploadBtn).onChange((event) => {
      handlePhotoUpload(event);
    });
  } catch (_) {}
}

// ─── Load / Populate ─────────────────────────────────────────

async function loadEntry(entryId) {
  const result = await getEntry(entryId);
  if (!result.success) {
    errorHandler.showError(result.error);
    stateManager.navigate(VIEWS.LIST);
    return;
  }

  state.entry = result.data;
  populateForm(state.entry);
}

function populateForm(entry) {
  state.catches = Array.isArray(entry.catches) ? [...entry.catches] : [];
  state.photos = Array.isArray(entry.photos) ? [...entry.photos] : [];

  safeSet(EL.form.date, 'value', entry.date ? new Date(entry.date) : null);
  safeSet(EL.form.time, 'value', entry.time || '');
  safeSet(EL.form.startTime, 'value', entry.startTime || '');
  safeSet(EL.form.endTime, 'value', entry.endTime || '');
  safeSet(EL.form.location, 'value', entry.location || '');
  safeSet(EL.form.detailedLoc, 'value', entry.detailedLocation || '');
  safeSet(EL.form.depth, 'value', entry.depth);
  safeSet(EL.form.duration, 'value', entry.duration);
  safeSet(EL.form.visibility, 'value', entry.visibility);

  if (entry.weather) {
    safeSet(EL.form.weatherConditions, 'value', entry.weather.conditions || []);
    safeSet(EL.form.airTemp, 'value', entry.weather.temperature);
    safeSet(EL.form.waterTemp, 'value', entry.weather.waterTemperature);
    safeSet(EL.form.windDirection, 'value', entry.weather.windDirection || '');
    safeSet(EL.form.windIntensity, 'value', entry.weather.windIntensity || 0);
    safeSet(EL.form.currentDirection, 'value', entry.weather.currentDirection || '');
    safeSet(EL.form.currentIntensity, 'value', entry.weather.currentIntensity || 0);
  }

  if (entry.equipment) {
    safeSet(EL.form.mask, 'value', entry.equipment.mask || '');
    safeSet(EL.form.fins, 'value', entry.equipment.fins || '');
    safeSet(EL.form.suit, 'value', entry.equipment.suit || '');
    safeSet(EL.form.weight, 'value', entry.equipment.weight);
    safeSet(EL.form.gear, 'value',
      Array.isArray(entry.equipment.gear) ? entry.equipment.gear.join(', ') : ''
    );
  }

  safeSet(EL.form.notes, 'value', entry.notes || '');
  updateNotesCounter((entry.notes || '').length);

  safeSet(EL.form.rating, 'value', entry.rating ? String(entry.rating) : '');

  renderCatches();
  renderPhotos();
}

function resetForm() {
  state.catches = [];
  state.photos = [];

  safeSet(EL.form.date, 'value', new Date());
  safeSet(EL.form.time, 'value', '');
  safeSet(EL.form.startTime, 'value', '');
  safeSet(EL.form.endTime, 'value', '');
  safeSet(EL.form.location, 'value', '');
  safeSet(EL.form.detailedLoc, 'value', '');
  safeSet(EL.form.depth, 'value', null);
  safeSet(EL.form.duration, 'value', null);
  safeSet(EL.form.visibility, 'value', null);
  safeSet(EL.form.weatherConditions, 'value', []);
  safeSet(EL.form.airTemp, 'value', null);
  safeSet(EL.form.waterTemp, 'value', null);
  safeSet(EL.form.windDirection, 'value', '');
  safeSet(EL.form.windIntensity, 'value', 0);
  safeSet(EL.form.currentDirection, 'value', '');
  safeSet(EL.form.currentIntensity, 'value', 0);
  safeSet(EL.form.mask, 'value', '');
  safeSet(EL.form.fins, 'value', '');
  safeSet(EL.form.suit, 'value', '');
  safeSet(EL.form.weight, 'value', null);
  safeSet(EL.form.gear, 'value', '');
  safeSet(EL.form.notes, 'value', '');
  safeSet(EL.form.rating, 'value', '');
  updateNotesCounter(0);
  renderCatches();
  renderPhotos();
}

// ─── Collect form data ───────────────────────────────────────

function collectFormData() {
  const data = {};

  data.date = safeGet(EL.form.date, null);
  data.time = safeGet(EL.form.time, '');
  data.startTime = safeGet(EL.form.startTime, '');
  data.endTime = safeGet(EL.form.endTime, '');
  data.location = safeGet(EL.form.location, '');
  data.detailedLocation = safeGet(EL.form.detailedLoc, '');

  const depth = safeGet(EL.form.depth, null);
  data.depth = depth !== null && depth !== '' ? Number(depth) : 0;

  const duration = safeGet(EL.form.duration, null);
  data.duration = duration !== null && duration !== '' ? Number(duration) : 0;

  const visibility = safeGet(EL.form.visibility, null);
  data.visibility = visibility !== null && visibility !== '' ? Number(visibility) : 0;

  // Weather
  data.weather = {
    conditions: safeGet(EL.form.weatherConditions, []),
    temperature: toNumberOrNull(safeGet(EL.form.airTemp, null)),
    waterTemperature: toNumberOrNull(safeGet(EL.form.waterTemp, null)),
    windDirection: safeGet(EL.form.windDirection, ''),
    windIntensity: toNumberOrNull(safeGet(EL.form.windIntensity, 0)) || 0,
    currentDirection: safeGet(EL.form.currentDirection, ''),
    currentIntensity: toNumberOrNull(safeGet(EL.form.currentIntensity, 0)) || 0,
  };

  // Equipment
  const gearStr = safeGet(EL.form.gear, '');
  data.equipment = {
    mask: safeGet(EL.form.mask, ''),
    fins: safeGet(EL.form.fins, ''),
    suit: safeGet(EL.form.suit, ''),
    weight: toNumberOrNull(safeGet(EL.form.weight, null)) || 0,
    gear: gearStr ? gearStr.split(',').map(s => s.trim()).filter(Boolean) : [],
  };

  data.catches = state.catches;
  data.photos = state.photos;

  // Fishing types derived from catches
  const methodSet = new Set();
  state.catches.forEach(c => {
    if (c.method) methodSet.add(c.method);
  });
  data.fishingTypes = Array.from(methodSet);

  data.notes = safeGet(EL.form.notes, '');

  const ratingStr = safeGet(EL.form.rating, '');
  data.rating = ratingStr ? Number(ratingStr) : null;

  return data;
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

// ─── Handlers ────────────────────────────────────────────────

async function handleSave() {
  const data = collectFormData();
  const validation = validateEntryForm(data);

  if (!validation.valid) {
    showValidationErrors(validation.errors);
    return;
  }

  clearValidationErrors();
  safeSet(EL.form.saveBtn, 'label', t('form.saving'));
  safeSet(EL.form.saveBtn, 'disable', true);

  try {
    let result;
    if (state.mode === 'edit') {
      result = await updateEntry(state.entryId, data);
    } else {
      result = await createEntry(data);
    }

    if (result.success) {
      errorHandler.showSuccess('form.saved');
      eventBus.emit('entry:saved', result.data);
      stateManager.navigate(VIEWS.LIST);
    } else {
      errorHandler.showError(result.error);
    }
  } catch (err) {
    errorHandler.showError(err.message || 'UNKNOWN_ERROR');
  } finally {
    safeSet(EL.form.saveBtn, 'label', t('form.save'));
    safeSet(EL.form.saveBtn, 'enable', true);
  }
}

function handleCancel() {
  stateManager.goBack();
}

async function handleDelete() {
  if (!state.entryId) return;

  const confirmed = await showConfirmModal(
    t('confirm.deleteEntry'),
    t('confirm.deleteEntryDesc')
  );

  if (!confirmed) return;

  try {
    const result = await deleteEntry(state.entryId);
    if (result.success) {
      eventBus.emit('entry:deleted', state.entryId);
      stateManager.navigate(VIEWS.LIST);
    } else {
      errorHandler.showError(result.error);
    }
  } catch (err) {
    errorHandler.showError(err.message || 'UNKNOWN_ERROR');
  }
}

function handleAddCatch() {
  state.catches.push({
    id: `catch_${Date.now()}`,
    species: '',
    weight: null,
    length: null,
    quantity: 1,
    method: '',
    released: false,
    photo: '',
    notes: '',
  });
  renderCatches();
}

function handlePhotoUpload(event) {
  // In Wix UploadButton, event.target.value typically has uploaded file URLs
  // after upload completes via startUpload()
  try {
    const uploadBtn = $w(EL.form.photoUploadBtn);
    uploadBtn.startUpload()
      .then((uploadedFile) => {
        if (uploadedFile && uploadedFile.url) {
          state.photos.push(uploadedFile.url);
          renderPhotos();
        }
      })
      .catch((err) => {
        errorHandler.showError('UPLOAD_FAILED');
      });
  } catch (_) {}
}

// ─── Catches Rendering ───────────────────────────────────────

function renderCatches() {
  try {
    const data = state.catches.map((c, i) => ({
      ...c,
      _id: c.id || `catch_${i}`,
      _index: i,
    }));
    $w(EL.form.catchesRepeater).data = data;
  } catch (_) {}
}

function renderCatchItem($item, itemData, index) {
  const lang = getLang();

  // Species dropdown
  try {
    $item(EL.form.catch.species).options = [
      { label: t('form.catch.species.placeholder'), value: '' },
      ...getLocalizedList(COMMON_FISH_SPECIES, lang).map(s => ({ label: s.label, value: s.id })),
    ];
    $item(EL.form.catch.species).value = itemData.species || '';
    $item(EL.form.catch.species).onChange((event) => {
      state.catches[itemData._index].species = event.target.value;
    });
  } catch (_) {}

  // Method dropdown
  try {
    $item(EL.form.catch.method).options = [
      { label: t('form.catch.method.placeholder'), value: '' },
      ...getLocalizedList(FISHING_METHODS, lang).map(m => ({ label: m.label, value: m.id })),
    ];
    $item(EL.form.catch.method).value = itemData.method || '';
    $item(EL.form.catch.method).onChange((event) => {
      state.catches[itemData._index].method = event.target.value;
    });
  } catch (_) {}

  // Quantity
  try {
    $item(EL.form.catch.quantity).value = itemData.quantity || 1;
    $item(EL.form.catch.quantity).onInput((event) => {
      state.catches[itemData._index].quantity = Number(event.target.value) || 1;
    });
  } catch (_) {}

  // Weight
  try {
    $item(EL.form.catch.weight).value = itemData.weight || null;
    $item(EL.form.catch.weight).onInput((event) => {
      state.catches[itemData._index].weight = toNumberOrNull(event.target.value);
    });
  } catch (_) {}

  // Length
  try {
    $item(EL.form.catch.length).value = itemData.length || null;
    $item(EL.form.catch.length).onInput((event) => {
      state.catches[itemData._index].length = toNumberOrNull(event.target.value);
    });
  } catch (_) {}

  // Released
  try {
    $item(EL.form.catch.released).checked = !!itemData.released;
    $item(EL.form.catch.released).onChange((event) => {
      state.catches[itemData._index].released = !!event.target.checked;
    });
  } catch (_) {}

  // Notes
  try {
    $item(EL.form.catch.notes).value = itemData.notes || '';
    $item(EL.form.catch.notes).onInput((event) => {
      state.catches[itemData._index].notes = event.target.value;
    });
  } catch (_) {}

  // Remove button
  try {
    $item(EL.form.catch.removeBtn).label = t('form.catch.remove');
    $item(EL.form.catch.removeBtn).onClick(() => {
      state.catches.splice(itemData._index, 1);
      renderCatches();
    });
  } catch (_) {}
}

// ─── Photos Rendering ────────────────────────────────────────

function renderPhotos() {
  try {
    $w(EL.form.photosGallery).items = state.photos.map((url, i) => ({
      src: url,
      title: `Photo ${i + 1}`,
      description: '',
      type: 'image',
    }));
  } catch (_) {}
}

// ─── Notes Counter ───────────────────────────────────────────

function updateNotesCounter(length) {
  safeSet(EL.form.notesCounter, 'text',
    t('form.notes.counter', { count: length, max: MAX_NOTES_LENGTH })
  );
}

// ─── Validation Display ──────────────────────────────────────

function showValidationErrors(errors) {
  const messages = Object.entries(errors)
    .map(([field, key]) => `${field}: ${t(key)}`)
    .join('\n');
  safeSet(EL.form.errorSummary, 'text', messages);
  safeShow(EL.form.errorSummary);
}

function clearValidationErrors() {
  safeHide(EL.form.errorSummary);
  safeSet(EL.form.errorSummary, 'text', '');
}

// ─── Confirm Modal ───────────────────────────────────────────

function showConfirmModal(title, desc) {
  return new Promise((resolve) => {
    try {
      safeSet(EL.modal.message, 'text', `${title}\n\n${desc}`);
      safeSet(EL.modal.confirmBtn, 'label', t('confirm.yes'));
      safeSet(EL.modal.cancelBtn, 'label', t('confirm.no'));
      safeShow(EL.modal.container);

      const yesBtn = $w(EL.modal.confirmBtn);
      const noBtn = $w(EL.modal.cancelBtn);

      const onYes = () => {
        safeHide(EL.modal.container);
        resolve(true);
      };
      const onNo = () => {
        safeHide(EL.modal.container);
        resolve(false);
      };

      yesBtn.onClick(onYes);
      noBtn.onClick(onNo);
    } catch (_) {
      // Fallback to confirm()
      resolve(true);
    }
  });
}

// ─── Safe Helpers ────────────────────────────────────────────

function safeSet(id, prop, value) {
  try { $w(id)[prop] = value; } catch (_) {}
}

function safeGet(id, defaultValue) {
  try {
    const val = $w(id).value;
    return val !== undefined ? val : defaultValue;
  } catch (_) {
    return defaultValue;
  }
}

function safeShow(id) {
  try { $w(id).show(); } catch (_) {}
}

function safeHide(id) {
  try { $w(id).hide(); } catch (_) {}
}
