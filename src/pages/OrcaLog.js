/**
 * OrcaLog — Page Entry Point
 *
 * This file goes in the Velo page code editor. It orchestrates:
 *   - Auth gate (login required)
 *   - Profile loading
 *   - i18n initialization
 *   - View controller registration
 *   - Language toggle
 *   - Bottom navigation
 *   - Offline detection
 *
 * View-specific logic lives in src/public/views/*.js modules.
 */

import { EL } from 'public/config/element-ids';
import { VIEWS } from 'public/config/constants';
import { t, initLang, toggleLang, onLangChange, getLang } from 'public/i18n/index';
import { updateMyPreferences } from 'backend/api/profiles-api';

import * as authClient from 'public/core/auth-client';
import * as stateManager from 'public/core/state-manager';
import * as errorHandler from 'public/core/error-handler';
import * as eventBus from 'public/core/event-bus';

import * as listView from 'public/views/list-view';
import * as formView from 'public/views/form-view';
import * as detailView from 'public/views/detail-view';
import * as statsView from 'public/views/stats-view';
import * as adminView from 'public/views/admin-view';

// ─── Page Lifecycle ──────────────────────────────────────────

$w.onReady(async function () {
  try {
    // 1. Check authentication
    const loggedIn = await authClient.isLoggedIn();
    if (!loggedIn) {
      showLoginGate();
      return;
    }

    hideLoginGate();

    // 2. Load user profile (creates on first login)
    const profile = await authClient.loadProfile();
    if (!profile) {
      errorHandler.showError('PROFILE_LOAD_FAILED');
      return;
    }

    // 3. Initialize i18n from profile preference
    const userLang = profile.preferences?.language;
    initLang(userLang);
    applyStaticPageText();

    // 4. Initialize core modules
    stateManager.init($w);
    errorHandler.init($w);

    // 5. Register view controllers
    stateManager.registerView(VIEWS.LIST, listView);
    stateManager.registerView(VIEWS.DETAIL, detailView);
    stateManager.registerView(VIEWS.FORM_ADD, formView);
    stateManager.registerView(VIEWS.FORM_EDIT, formView);
    stateManager.registerView(VIEWS.STATS, statsView);
    stateManager.registerView(VIEWS.ADMIN, adminView);

    // 6. Bind global handlers
    bindNavigationHandlers();
    bindLanguageToggle();
    bindEventBus();
    setupOfflineDetection();

    // 7. Show/hide admin nav based on role
    const isAdmin = await authClient.isAdmin();
    if (isAdmin) {
      safeShow(EL.nav.admin);
    } else {
      safeHide(EL.nav.admin);
    }

    // 8. Navigate to default view
    await stateManager.navigate(VIEWS.LIST);
  } catch (err) {
    console.error('[OrcaLog] Initialization error:', err);
    errorHandler.showError(err.message || 'INIT_FAILED');
  }
});

// ─── Auth Gate ───────────────────────────────────────────────

function showLoginGate() {
  safeShow(EL.auth.loginGate);
  safeHide(EL.auth.appContent);

  try {
    $w(EL.auth.loginBtn).label = t('auth.loginBtn');
    $w(EL.auth.loginBtn).onClick(async () => {
      const success = await authClient.promptLogin();
      if (success) {
        // Reload the page to re-run onReady
        try {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        } catch (_) {}
      }
    });
  } catch (_) {}
}

function hideLoginGate() {
  safeHide(EL.auth.loginGate);
  safeShow(EL.auth.appContent);
}

// ─── Static Text ─────────────────────────────────────────────

function applyStaticPageText() {
  // Navigation labels
  safeSet(EL.nav.entries, 'label', t('nav.entries'));
  safeSet(EL.nav.add, 'label', t('nav.add'));
  safeSet(EL.nav.stats, 'label', t('nav.stats'));
  safeSet(EL.nav.admin, 'label', t('nav.admin'));
  safeSet(EL.nav.langToggle, 'label', t('nav.langToggle'));

  // Offline banner
  safeSet(EL.offline.banner, 'text', t('app.offline'));
}

// ─── Navigation ──────────────────────────────────────────────

function bindNavigationHandlers() {
  try {
    $w(EL.nav.entries).onClick(() => stateManager.navigate(VIEWS.LIST));
  } catch (_) {}

  try {
    $w(EL.nav.add).onClick(() => stateManager.navigate(VIEWS.FORM_ADD));
  } catch (_) {}

  try {
    $w(EL.nav.stats).onClick(() => stateManager.navigate(VIEWS.STATS));
  } catch (_) {}

  try {
    $w(EL.nav.admin).onClick(() => stateManager.navigate(VIEWS.ADMIN));
  } catch (_) {}
}

// ─── Language Toggle ─────────────────────────────────────────

function bindLanguageToggle() {
  try {
    $w(EL.nav.langToggle).onClick(async () => {
      const newLang = toggleLang();

      // Persist to profile
      try {
        await updateMyPreferences({ language: newLang });
      } catch (_) {}

      // Emit event so views can refresh labels
      eventBus.emit('language:changed', newLang);
    });
  } catch (_) {}

  // Listen to language changes and re-apply labels
  onLangChange(() => {
    applyStaticPageText();
    // Refresh current view to re-apply its labels
    stateManager.refreshCurrent();
  });
}

// ─── Event Bus Wiring ────────────────────────────────────────

function bindEventBus() {
  // When an entry is saved or deleted, refresh the list on next navigation
  eventBus.on('entry:saved', () => {
    // The view controller already navigates to LIST after save
  });

  eventBus.on('entry:deleted', () => {
    // Same
  });

  // Global error listener for debugging
  eventBus.on('error', (err) => {
    console.error('[OrcaLog Event]', err);
  });
}

// ─── Offline Detection ───────────────────────────────────────

function setupOfflineDetection() {
  const updateStatus = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        safeShow(EL.offline.banner);
      } else {
        safeHide(EL.offline.banner);
      }
    } catch (_) {}
  };

  try {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', updateStatus);
      window.addEventListener('offline', updateStatus);
    }
  } catch (_) {}

  updateStatus();
}

// ─── Safe Element Helpers ────────────────────────────────────

function safeSet(id, prop, value) {
  try { $w(id)[prop] = value; } catch (_) {}
}

function safeShow(id) {
  try { $w(id).show(); } catch (_) {}
}

function safeHide(id) {
  try { $w(id).hide(); } catch (_) {}
}
