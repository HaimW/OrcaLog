/**
 * OrcaLog — Result Builders
 *
 * Consistent response shapes for all backend API functions.
 * Frontend code checks result.success to determine flow.
 */

/**
 * Create a success result.
 * @param {*} data
 * @returns {{ success: true, data: *, error: null }}
 */
export function ok(data) {
  return { success: true, data, error: null };
}

/**
 * Create a failure result.
 * @param {string} error - Error code or message
 * @param {*} [details] - Optional extra info for debugging
 * @returns {{ success: false, data: null, error: string, details?: * }}
 */
export function fail(error, details) {
  const result = { success: false, data: null, error };
  if (details !== undefined) {
    result.details = details;
  }
  return result;
}

/**
 * Create a paginated success result.
 * @param {Array} items
 * @param {number} totalCount
 * @param {boolean} hasNext
 * @param {number} skip
 * @param {number} limit
 * @returns {{ success: true, data: { items, totalCount, hasNext, skip, limit }, error: null }}
 */
export function okPaginated(items, totalCount, hasNext, skip, limit) {
  return ok({ items, totalCount, hasNext, skip, limit });
}

/**
 * Wrap an async operation in try/catch and return a result.
 * @param {Function} fn - Async function to execute
 * @returns {Promise<{ success: boolean, data: *, error: string|null }>}
 */
export async function tryCatch(fn) {
  try {
    const data = await fn();
    return ok(data);
  } catch (err) {
    console.error('[OrcaLog]', err);
    return fail(err.message || 'UNKNOWN_ERROR');
  }
}
