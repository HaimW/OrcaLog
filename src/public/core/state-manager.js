/**
 * OrcaLog — State Manager
 *
 * Manages view state: which view is active, navigation history, and
 * show/hide of view containers.
 */

import { VIEWS } from '../config/constants';
import { getAllViewIds, EL } from '../config/element-ids';
import * as eventBus from './event-bus';

let currentState = { view: VIEWS.LIST, params: {} };
let history = [];
let $wRef = null;

// Registry of view controllers
const viewControllers = {};

/**
 * Initialize the state manager with the $w reference.
 * @param {Function} $w - Wix $w selector function
 */
export function init($w) {
  $wRef = $w;
}

/**
 * Register a view controller.
 * @param {string} viewName - One of VIEWS constants
 * @param {{ init: Function, destroy: Function, refresh: Function }} controller
 */
export function registerView(viewName, controller) {
  viewControllers[viewName] = controller;
}

/**
 * Navigate to a view.
 * Hides all view containers, shows the target, and calls the view controller's init.
 *
 * @param {string} viewName - One of VIEWS constants
 * @param {Object} [params={}] - Parameters to pass to the view
 */
export async function navigate(viewName, params = {}) {
  if (!$wRef) {
    console.error('[StateManager] Not initialized. Call init($w) first.');
    return;
  }

  // Destroy current view
  const currentController = viewControllers[currentState.view];
  if (currentController && currentController.destroy) {
    try {
      currentController.destroy();
    } catch (err) {
      console.error('[StateManager] Error destroying view:', err);
    }
  }

  // Push to history (for back navigation)
  history.push({ ...currentState });

  // Update state
  currentState = { view: viewName, params };

  // Hide all views
  const allViewIds = getAllViewIds();
  allViewIds.forEach(id => {
    try {
      $wRef(id).hide();
    } catch (_) {
      // Element might not exist
    }
  });

  // Show target view
  const targetId = EL.views[viewName] || EL.views[VIEWS.LIST];
  try {
    $wRef(targetId).show();
  } catch (err) {
    console.error(`[StateManager] Cannot show view "${viewName}":`, err);
  }

  // Initialize the new view's controller
  const nextController = viewControllers[viewName];
  if (nextController && nextController.init) {
    try {
      await nextController.init($wRef, params);
    } catch (err) {
      console.error(`[StateManager] Error initializing view "${viewName}":`, err);
    }
  }

  // Emit navigation event
  eventBus.emit('view:navigate', currentState);
}

/**
 * Go back to the previous view.
 * Falls back to list view if history is empty.
 */
export function goBack() {
  if (history.length > 0) {
    const prev = history.pop();
    // Navigate without pushing to history again
    currentState = { view: null, params: {} }; // Reset to allow re-navigation
    navigate(prev.view, prev.params);
    // Remove the duplicate history entry that navigate() added
    history.pop();
  } else {
    navigate(VIEWS.LIST);
  }
}

/**
 * Get the current view state.
 * @returns {{ view: string, params: Object }}
 */
export function getCurrent() {
  return { ...currentState };
}

/**
 * Refresh the current view (calls controller.refresh if available).
 */
export async function refreshCurrent() {
  const controller = viewControllers[currentState.view];
  if (controller && controller.refresh) {
    try {
      await controller.refresh($wRef, currentState.params);
    } catch (err) {
      console.error('[StateManager] Error refreshing view:', err);
    }
  }
}

/**
 * Clear navigation history.
 */
export function clearHistory() {
  history = [];
}

/**
 * Check if there's history to go back to.
 * @returns {boolean}
 */
export function canGoBack() {
  return history.length > 0;
}
