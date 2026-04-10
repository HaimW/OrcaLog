/**
 * OrcaLog — Admin View Controller
 *
 * Admin panel: shortcuts, config editor, cross-user filter.
 */

import { getAppConfig, updateAppConfig, getAllUsers, exportEntries as adminExportEntries } from 'backend/api/admin-api';
import { importEntries } from 'backend/api/entries-api';
import { EL } from '../config/element-ids';
import { VIEWS } from '../config/constants';
import { t } from '../i18n/index';
import * as stateManager from '../core/state-manager';
import * as errorHandler from '../core/error-handler';
import * as eventBus from '../core/event-bus';

let $w = null;
let state = {
  config: null,
};

// ─── Public API ──────────────────────────────────────────────

export async function init($wRef) {
  $w = $wRef;
  applyStaticText();
  bindHandlers();
  await loadConfig();
  await setupUserFilter();
}

export function destroy() {
  state.config = null;
}

export async function refresh() {
  await loadConfig();
}

// ─── Setup ───────────────────────────────────────────────────

function applyStaticText() {
  safeSet(EL.admin.shortcutEntries, 'label', t('admin.viewEntries'));
  safeSet(EL.admin.shortcutStats, 'label', t('admin.viewStats'));
  safeSet(EL.admin.shortcutConfig, 'label', t('admin.editConfig'));
  safeSet(EL.admin.whatsappInput, 'placeholder', t('admin.whatsapp.placeholder'));
  safeSet(EL.admin.saveConfigBtn, 'label', t('admin.saveConfig'));
  safeSet(EL.importExport.exportBtn, 'label', t('io.export'));
  safeSet(EL.importExport.importBtn, 'label', t('io.import'));
}

function bindHandlers() {
  // Shortcuts
  try {
    $w(EL.admin.shortcutEntries).onClick(() => stateManager.navigate(VIEWS.LIST));
  } catch (_) {}

  try {
    $w(EL.admin.shortcutStats).onClick(() => stateManager.navigate(VIEWS.STATS));
  } catch (_) {}

  try {
    $w(EL.admin.shortcutConfig).onClick(() => {
      safeShow(EL.admin.configSection);
    });
  } catch (_) {}

  // Save config
  try {
    $w(EL.admin.saveConfigBtn).onClick(handleSaveConfig);
  } catch (_) {}

  // User filter propagation
  try {
    $w(EL.admin.userDropdown).onChange((event) => {
      eventBus.emit('filters:changed', { userId: event.target.value || null });
    });
  } catch (_) {}

  // Export
  try {
    $w(EL.importExport.exportBtn).onClick(handleExport);
  } catch (_) {}

  // Import
  try {
    $w(EL.importExport.importBtn).onClick(() => {
      try { $w(EL.importExport.importFile).click(); } catch (_) {}
    });
  } catch (_) {}

  try {
    $w(EL.importExport.importFile).onChange(handleImport);
  } catch (_) {}
}

// ─── Data Loading ────────────────────────────────────────────

async function loadConfig() {
  try {
    const result = await getAppConfig();
    if (result.success) {
      state.config = result.data;
      safeSet(EL.admin.whatsappInput, 'value', result.data.whatsappGroupLink || '');
    } else {
      errorHandler.showError(result.error);
    }
  } catch (err) {
    errorHandler.showError(err.message || 'UNKNOWN_ERROR');
  }
}

async function setupUserFilter() {
  try {
    const result = await getAllUsers();
    if (result.success && Array.isArray(result.data)) {
      const options = [
        { label: t('admin.allUsers'), value: '' },
        ...result.data.map(u => ({
          label: u.fullName || u.username || u.email || u.userId,
          value: u.userId,
        })),
      ];
      $w(EL.admin.userDropdown).options = options;
    }
  } catch (_) {}
}

// ─── Handlers ────────────────────────────────────────────────

async function handleSaveConfig() {
  const whatsappLink = safeGet(EL.admin.whatsappInput, '');

  try {
    const result = await updateAppConfig({
      whatsappGroupLink: whatsappLink,
    });

    if (result.success) {
      state.config = result.data;
      errorHandler.showSuccess('admin.configSaved');
    } else {
      errorHandler.showError(result.error);
    }
  } catch (err) {
    errorHandler.showError(err.message || 'UNKNOWN_ERROR');
  }
}

async function handleExport() {
  try {
    safeSet(EL.importExport.importStatus, 'text', t('io.exporting'));

    const result = await adminExportEntries();
    if (!result.success) {
      errorHandler.showError(result.error);
      return;
    }

    const json = JSON.stringify(result.data, null, 2);
    downloadJson(json, `orcalog-export-${Date.now()}.json`);

    errorHandler.showSuccess('io.exportSuccess');
    safeSet(EL.importExport.importStatus, 'text', '');
  } catch (err) {
    errorHandler.showError(err.message || 'UNKNOWN_ERROR');
  }
}

async function handleImport(event) {
  try {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    safeSet(EL.importExport.importStatus, 'text', t('io.importing'));

    const text = await readFileAsText(file);
    let data;
    try {
      data = JSON.parse(text);
    } catch (_) {
      errorHandler.showError('io.invalidFormat');
      return;
    }

    if (!Array.isArray(data)) {
      errorHandler.showError('io.invalidFormat');
      return;
    }

    const result = await importEntries(data);
    if (!result.success) {
      errorHandler.showError(result.error);
      return;
    }

    const { imported, errors } = result.data;
    if (errors && errors.length > 0) {
      errorHandler.showError('io.importError');
      safeSet(EL.importExport.importStatus, 'text', `Errors: ${errors.join(', ')}`);
    } else {
      errorHandler.showSuccess('io.importSuccess', { count: imported });
      safeSet(EL.importExport.importStatus, 'text', '');
    }
  } catch (err) {
    errorHandler.showError(err.message || 'UNKNOWN_ERROR');
  }
}

// ─── File Helpers ────────────────────────────────────────────

function downloadJson(jsonString, filename) {
  try {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (_) {
    // Fallback: open in new tab
    try {
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonString);
      window.open(dataUri, '_blank');
    } catch (__) {}
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
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
