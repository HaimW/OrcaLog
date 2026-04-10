/**
 * OrcaLog — List View Controller
 *
 * Displays paginated, filterable, searchable list of dive entries.
 * Admin users get a cross-user filter.
 */

import { getEntries, searchEntries } from 'backend/api/entries-api';
import { getAllEntries, getAllUsers, searchAllEntries } from 'backend/api/admin-api';
import { EL } from '../config/element-ids';
import { VIEWS, DEFAULT_PAGE_SIZE, DIVING_LOCATIONS, FISHING_METHODS } from '../config/constants';
import { t, getLang } from '../i18n/index';
import { formatDate, formatLocation, formatRating, formatFishingTypes, countFish } from '../utils/formatters';
import { getLocalizedList } from '../config/constants';
import * as stateManager from '../core/state-manager';
import * as authClient from '../core/auth-client';
import * as eventBus from '../core/event-bus';
import * as errorHandler from '../core/error-handler';

let $w = null;
let state = {
  filters: {},
  searchText: '',
  skip: 0,
  limit: DEFAULT_PAGE_SIZE,
  items: [],
  totalCount: 0,
  hasNext: false,
  isAdmin: false,
  debounceTimer: null,
};

// ─── Public API ──────────────────────────────────────────────

/**
 * Initialize the list view.
 * @param {Function} $wRef
 */
export async function init($wRef) {
  $w = $wRef;
  state.isAdmin = await authClient.isAdmin();

  applyStaticText();
  populateFilterDropdowns();
  bindHandlers();
  await loadEntries(true);
}

/**
 * Destroy the list view (cleanup).
 */
export function destroy() {
  if (state.debounceTimer) {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = null;
  }
}

/**
 * Refresh the current list data.
 */
export async function refresh() {
  state.skip = 0;
  await loadEntries(true);
}

// ─── Setup ───────────────────────────────────────────────────

function applyStaticText() {
  safeSet(EL.list.searchInput, 'placeholder', t('list.search'));
  safeSet(EL.list.applyFilters, 'label', t('filter.apply'));
  safeSet(EL.list.clearFilters, 'label', t('filter.clear'));
  safeSet(EL.list.loadMore, 'label', t('list.loadMore'));
  safeSet(EL.list.noResults, 'text', t('list.noResults'));
  safeSet(EL.nav.entries, 'label', t('nav.entries'));
  safeSet(EL.nav.add, 'label', t('nav.add'));

  // Show/hide admin-only filter
  if (state.isAdmin) {
    safeShow(EL.list.filterUserAdmin);
  } else {
    safeHide(EL.list.filterUserAdmin);
  }
}

function populateFilterDropdowns() {
  const lang = getLang();

  // Location dropdown
  try {
    const locationOptions = [
      { label: t('filter.allLocations'), value: '' },
      ...getLocalizedList(DIVING_LOCATIONS, lang).map(l => ({ label: l.label, value: l.id })),
    ];
    $w(EL.list.filterLocation).options = locationOptions;
  } catch (_) {}

  // Fishing type dropdown
  try {
    const methodOptions = [
      { label: t('filter.allMethods'), value: '' },
      ...getLocalizedList(FISHING_METHODS, lang).map(m => ({ label: m.label, value: m.id })),
    ];
    $w(EL.list.filterFishing).options = methodOptions;
  } catch (_) {}

  // Admin user filter
  if (state.isAdmin) {
    loadUserOptionsForAdmin();
  }
}

async function loadUserOptionsForAdmin() {
  try {
    const result = await getAllUsers();
    if (result.success && Array.isArray(result.data)) {
      const userOptions = [
        { label: t('filter.allUsers'), value: '' },
        ...result.data.map(u => ({
          label: u.fullName || u.username || u.email || u.userId,
          value: u.userId,
        })),
      ];
      $w(EL.list.filterUserAdmin).options = userOptions;
    }
  } catch (_) {}
}

function bindHandlers() {
  // Search with debounce
  try {
    $w(EL.list.searchInput).onInput((event) => {
      state.searchText = event.target.value || '';
      if (state.debounceTimer) clearTimeout(state.debounceTimer);
      state.debounceTimer = setTimeout(() => {
        state.skip = 0;
        loadEntries(true);
      }, 300);
    });
  } catch (_) {}

  // Apply filters
  try {
    $w(EL.list.applyFilters).onClick(() => {
      collectFilters();
      state.skip = 0;
      loadEntries(true);
    });
  } catch (_) {}

  // Clear filters
  try {
    $w(EL.list.clearFilters).onClick(() => {
      clearFilterInputs();
      state.filters = {};
      state.searchText = '';
      state.skip = 0;
      loadEntries(true);
    });
  } catch (_) {}

  // Load more
  try {
    $w(EL.list.loadMore).onClick(() => {
      state.skip += state.limit;
      loadEntries(false);
    });
  } catch (_) {}

  // FAB → new entry
  try {
    $w(EL.list.fab).onClick(() => {
      stateManager.navigate(VIEWS.FORM_ADD);
    });
  } catch (_) {}

  // Repeater item handler
  try {
    $w(EL.list.repeater).onItemReady(($item, itemData) => {
      renderCard($item, itemData);
    });
  } catch (_) {}
}

function collectFilters() {
  const filters = {};

  try {
    const dateFrom = $w(EL.list.filterDateFrom).value;
    if (dateFrom) filters.dateFrom = dateFrom;
  } catch (_) {}

  try {
    const dateTo = $w(EL.list.filterDateTo).value;
    if (dateTo) filters.dateTo = dateTo;
  } catch (_) {}

  try {
    const location = $w(EL.list.filterLocation).value;
    if (location) filters.location = location;
  } catch (_) {}

  try {
    const fishingType = $w(EL.list.filterFishing).value;
    if (fishingType) filters.fishingType = fishingType;
  } catch (_) {}

  try {
    const minDepth = Number($w(EL.list.filterMinDepth).value);
    if (!isNaN(minDepth) && minDepth >= 0) filters.minDepth = minDepth;
  } catch (_) {}

  try {
    const maxDepth = Number($w(EL.list.filterMaxDepth).value);
    if (!isNaN(maxDepth) && maxDepth > 0) filters.maxDepth = maxDepth;
  } catch (_) {}

  try {
    const minRating = Number($w(EL.list.filterMinRating).value);
    if (!isNaN(minRating) && minRating > 0) filters.minRating = minRating;
  } catch (_) {}

  if (state.isAdmin) {
    try {
      const adminUser = $w(EL.list.filterUserAdmin).value;
      if (adminUser) filters.userId = adminUser;
    } catch (_) {}
  }

  state.filters = filters;
}

function clearFilterInputs() {
  const ids = [
    EL.list.searchInput,
    EL.list.filterDateFrom,
    EL.list.filterDateTo,
    EL.list.filterLocation,
    EL.list.filterFishing,
    EL.list.filterMinDepth,
    EL.list.filterMaxDepth,
    EL.list.filterMinRating,
    EL.list.filterUserAdmin,
  ];

  ids.forEach(id => {
    try {
      const el = $w(id);
      if (el.value !== undefined) el.value = '';
      if ('undefined' !== typeof el.selectedIndex) el.selectedIndex = 0;
    } catch (_) {}
  });
}

// ─── Data Loading ────────────────────────────────────────────

async function loadEntries(reset) {
  try {
    showLoading();

    const pagination = { skip: state.skip, limit: state.limit };
    let result;

    if (state.searchText && state.searchText.trim().length > 0) {
      // Search mode
      if (state.isAdmin) {
        result = await searchAllEntries(state.searchText.trim(), pagination);
      } else {
        result = await searchEntries(state.searchText.trim(), pagination);
      }
    } else if (state.isAdmin) {
      // Admin sees all or filtered by user
      result = await getAllEntries(state.filters, pagination);
    } else {
      // Regular user — own entries
      result = await getEntries(state.filters, pagination);
    }

    if (!result.success) {
      errorHandler.showError(result.error);
      return;
    }

    const { items, totalCount, hasNext } = result.data;

    if (reset) {
      state.items = items;
    } else {
      state.items = [...state.items, ...items];
    }
    state.totalCount = totalCount;
    state.hasNext = hasNext;

    renderList();
  } catch (err) {
    errorHandler.showError(err.message || 'UNKNOWN_ERROR');
  }
}

// ─── Rendering ───────────────────────────────────────────────

function renderList() {
  try {
    // Map items to repeater format (needs _id)
    const repeaterData = state.items.map(item => ({
      ...item,
      _id: item._id,
    }));

    $w(EL.list.repeater).data = repeaterData;

    // Total count label
    safeSet(EL.list.totalCount, 'text', t('list.totalCount', { count: state.totalCount }));

    // No results
    if (state.items.length === 0) {
      safeShow(EL.list.noResults);
      safeHide(EL.list.repeater);
    } else {
      safeHide(EL.list.noResults);
      safeShow(EL.list.repeater);
    }

    // Load more button
    if (state.hasNext) {
      safeShow(EL.list.loadMore);
    } else {
      safeHide(EL.list.loadMore);
    }
  } catch (err) {
    console.error('[ListView] Render error:', err);
  }
}

function renderCard($item, data) {
  const lang = getLang();

  try { $item(EL.list.card.date).text = formatDate(data.date); } catch (_) {}
  try { $item(EL.list.card.location).text = formatLocation(data.location) || data.location || ''; } catch (_) {}
  try { $item(EL.list.card.depth).text = t('card.depth', { value: data.depth || 0 }); } catch (_) {}
  try { $item(EL.list.card.visibility).text = t('card.visibility', { value: data.visibility || 0 }); } catch (_) {}
  try {
    const count = countFish(data.catches);
    $item(EL.list.card.fishCount).text = count > 0
      ? t('card.fishCount', { count })
      : t('card.noFish');
  } catch (_) {}
  try {
    const waterTemp = data.weather?.waterTemperature;
    $item(EL.list.card.waterTemp).text = waterTemp !== undefined
      ? t('card.waterTemp', { value: waterTemp })
      : '';
  } catch (_) {}
  try { $item(EL.list.card.methods).text = formatFishingTypes(data.fishingTypes); } catch (_) {}
  try { $item(EL.list.card.rating).text = formatRating(data.rating); } catch (_) {}

  // Photo thumbnail (first photo if any)
  try {
    if (data.photos && data.photos.length > 0) {
      $item(EL.list.card.photo).src = data.photos[0];
      $item(EL.list.card.photo).show();
    } else {
      $item(EL.list.card.photo).hide();
    }
  } catch (_) {}

  // Click handler → detail view
  try {
    $item(EL.list.card.container).onClick(() => {
      stateManager.navigate(VIEWS.DETAIL, { entryId: data._id });
    });
  } catch (_) {}
}

function showLoading() {
  // In a real Wix page, you'd show a spinner here
  try {
    safeHide(EL.list.noResults);
  } catch (_) {}
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
