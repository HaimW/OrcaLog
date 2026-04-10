/**
 * OrcaLog — Event Bus
 *
 * Lightweight pub/sub for decoupled view communication.
 *
 * Events used in OrcaLog:
 *   'view:navigate'      — { view, params }
 *   'entry:selected'     — entryId
 *   'entry:saved'        — entry
 *   'entry:deleted'      — entryId
 *   'language:changed'   — lang
 *   'filters:changed'    — filters
 *   'user:loggedIn'      — profile
 *   'error'              — { code, message }
 */

const listeners = {};

/**
 * Subscribe to an event.
 * @param {string} event - Event name
 * @param {Function} callback - Handler function
 * @returns {Function} Unsubscribe function
 */
export function on(event, callback) {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(callback);

  return () => off(event, callback);
}

/**
 * Unsubscribe from an event.
 * @param {string} event
 * @param {Function} callback
 */
export function off(event, callback) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(cb => cb !== callback);
}

/**
 * Emit an event with data.
 * @param {string} event
 * @param {*} data
 */
export function emit(event, data) {
  if (!listeners[event]) return;
  listeners[event].forEach(cb => {
    try {
      cb(data);
    } catch (err) {
      console.error(`[EventBus] Error in handler for "${event}":`, err);
    }
  });
}

/**
 * Subscribe to an event once (auto-unsubscribes after first call).
 * @param {string} event
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function once(event, callback) {
  const wrapper = (data) => {
    off(event, wrapper);
    callback(data);
  };
  return on(event, wrapper);
}

/**
 * Remove all listeners for an event, or all events if no event specified.
 * @param {string} [event]
 */
export function removeAll(event) {
  if (event) {
    delete listeners[event];
  } else {
    Object.keys(listeners).forEach(key => delete listeners[key]);
  }
}
