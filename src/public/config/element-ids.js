/**
 * OrcaLog — Element ID Constants
 *
 * Single source of truth for all Wix $w element selectors.
 * If an element ID changes in the Wix Editor, update it here only.
 */

export const EL = {
  // ─── View Containers ─────────────────────────────────────
  views: {
    list:   '#listView',
    detail: '#detailView',
    form:   '#formView',
    stats:  '#statsView',
    admin:  '#adminView',
  },

  // ─── Navigation ──────────────────────────────────────────
  nav: {
    entries: '#navEntries',
    add:     '#navAdd',
    stats:   '#navStats',
    admin:   '#navAdmin',
    langToggle: '#langToggle',
  },

  // ─── Login Gate ──────────────────────────────────────────
  auth: {
    loginGate:  '#loginGate',
    loginBtn:   '#loginBtn',
    appContent: '#appContent',
  },

  // ─── Offline Indicator ───────────────────────────────────
  offline: {
    banner: '#offlineBanner',
  },

  // ─── List View ───────────────────────────────────────────
  list: {
    searchInput:     '#searchInput',
    filterBar:       '#filterBar',
    filterDateFrom:  '#filterDateFrom',
    filterDateTo:    '#filterDateTo',
    filterLocation:  '#filterLocation',
    filterFishing:   '#filterFishingType',
    filterMinDepth:  '#filterMinDepth',
    filterMaxDepth:  '#filterMaxDepth',
    filterMinRating: '#filterMinRating',
    filterUserAdmin: '#filterUserAdmin',
    applyFilters:    '#applyFiltersBtn',
    clearFilters:    '#clearFiltersBtn',
    repeater:        '#entriesRepeater',
    noResults:       '#noResultsText',
    loadMore:        '#loadMoreBtn',
    totalCount:      '#totalCountText',
    fab:             '#fabAddBtn',
    // Repeater item elements (used inside $item context)
    card: {
      container:    '#entryCard',
      date:         '#cardDate',
      location:     '#cardLocation',
      depth:        '#cardDepth',
      visibility:   '#cardVisibility',
      fishCount:    '#cardFishCount',
      waterTemp:    '#cardWaterTemp',
      methods:      '#cardMethods',
      photo:        '#cardPhoto',
      rating:       '#cardRating',
    },
  },

  // ─── Form View ───────────────────────────────────────────
  form: {
    title:        '#formTitle',
    // Section 1: Basic Info
    date:         '#inputDate',
    time:         '#inputTime',
    startTime:    '#inputStartTime',
    endTime:      '#inputEndTime',
    location:     '#inputLocation',
    locationFree: '#inputLocationFree',
    detailedLoc:  '#inputDetailedLocation',
    depth:        '#inputDepth',
    duration:     '#inputDuration',
    visibility:   '#inputVisibility',
    // Section 2: Weather
    weatherConditions:   '#inputWeatherConditions',
    airTemp:             '#inputAirTemp',
    waterTemp:           '#inputWaterTemp',
    windDirection:       '#inputWindDirection',
    windIntensity:       '#inputWindIntensity',
    currentDirection:    '#inputCurrentDirection',
    currentIntensity:    '#inputCurrentIntensity',
    // Section 3: Equipment
    mask:         '#inputMask',
    fins:         '#inputFins',
    suit:         '#inputSuit',
    weight:       '#inputWeight',
    gear:         '#inputGear',
    // Section 4: Catches
    catchesRepeater: '#catchesRepeater',
    addCatchBtn:     '#addCatchBtn',
    catch: {
      species:   '#catchSpecies',
      weight:    '#catchWeight',
      length:    '#catchLength',
      quantity:  '#catchQuantity',
      method:    '#catchMethod',
      released:  '#catchReleased',
      photo:     '#catchPhoto',
      notes:     '#catchNotes',
      removeBtn: '#removeCatchBtn',
    },
    // Section 5: Photos
    photoUploadBtn: '#photoUploadBtn',
    photosGallery:  '#formPhotosGallery',
    // Section 6: Notes & Rating
    notes:          '#inputNotes',
    notesCounter:   '#notesCharCounter',
    rating:         '#inputRating',
    // Action Buttons
    saveBtn:    '#saveEntryBtn',
    cancelBtn:  '#cancelEntryBtn',
    deleteBtn:  '#deleteEntryBtn',
    // Validation
    errorSummary: '#formErrorSummary',
  },

  // ─── Detail View ─────────────────────────────────────────
  detail: {
    title:            '#detailTitle',
    date:             '#detailDate',
    time:             '#detailTime',
    timeRange:        '#detailTimeRange',
    location:         '#detailLocation',
    detailedLoc:      '#detailDetailedLocation',
    depth:            '#detailDepth',
    duration:         '#detailDuration',
    visibility:       '#detailVisibility',
    // Weather
    weatherConditions:   '#detailWeatherConditions',
    airTemp:             '#detailAirTemp',
    waterTemp:           '#detailWaterTemp',
    windInfo:            '#detailWindInfo',
    currentInfo:         '#detailCurrentInfo',
    // Equipment
    mask:             '#detailMask',
    fins:             '#detailFins',
    suit:             '#detailSuit',
    weight:           '#detailWeight',
    gear:             '#detailGear',
    // Catches
    catchesRepeater:  '#detailCatchesRepeater',
    catchesEmpty:     '#detailCatchesEmpty',
    // Photos
    photoGallery:     '#detailPhotoGallery',
    // Notes & Rating
    notes:            '#detailNotes',
    rating:           '#detailRating',
    // Actions
    editBtn:          '#detailEditBtn',
    shareBtn:         '#detailShareBtn',
    deleteBtn:        '#detailDeleteBtn',
    backBtn:          '#detailBackBtn',
  },

  // ─── Stats View ──────────────────────────────────────────
  stats: {
    totalDives:        '#statTotalDives',
    totalFish:         '#statTotalFish',
    totalHours:        '#statTotalHours',
    avgRating:         '#statAvgRating',
    avgDepth:          '#statAvgDepth',
    maxDepth:          '#statMaxDepth',
    avgVisibility:     '#statAvgVisibility',
    avgWaterTemp:      '#statAvgWaterTemp',
    recentActivity:    '#statRecentActivity',
    topSpeciesBar:     '#statTopSpeciesBar',
    methodBreakdownBar: '#statMethodBreakdownBar',
    // Admin user filter
    userFilter:        '#statsUserFilter',
  },

  // ─── Admin View ──────────────────────────────────────────
  admin: {
    panel:              '#adminPanel',
    shortcutEntries:    '#adminShortcutEntries',
    shortcutStats:      '#adminShortcutStats',
    shortcutConfig:     '#adminShortcutConfig',
    whatsappInput:      '#adminWhatsappInput',
    saveConfigBtn:      '#adminSaveConfigBtn',
    userDropdown:       '#adminUserDropdown',
    configSection:      '#adminConfigSection',
  },

  // ─── Import / Export ─────────────────────────────────────
  importExport: {
    exportBtn:   '#exportBtn',
    importBtn:   '#importBtn',
    importFile:  '#importFileInput',
    importStatus: '#importStatusText',
  },

  // ─── Confirm Modal ───────────────────────────────────────
  modal: {
    container:  '#confirmModal',
    message:    '#confirmMessage',
    confirmBtn: '#confirmYesBtn',
    cancelBtn:  '#confirmNoBtn',
  },

  // ─── Toast / Error Banner ────────────────────────────────
  toast: {
    container: '#toastContainer',
    message:   '#toastMessage',
  },
};

/**
 * Returns all view container IDs as an array.
 * Useful for hide-all-then-show-one patterns.
 */
export function getAllViewIds() {
  return Object.values(EL.views);
}
