/**
 * OrcaLog — DiveEntries Repository
 *
 * Data access layer for the DiveEntries collection.
 * All wix-data calls for entries are centralized here.
 */

import wixData from 'wix-data';

const COLLECTION = 'DiveEntries';

/**
 * Query dive entries with filters and pagination.
 * @param {Object} filters
 * @param {string} [filters.userId] - Filter by owner
 * @param {string} [filters.searchText] - Free-text search
 * @param {Date} [filters.dateFrom]
 * @param {Date} [filters.dateTo]
 * @param {string} [filters.location]
 * @param {string} [filters.fishingType]
 * @param {number} [filters.minDepth]
 * @param {number} [filters.maxDepth]
 * @param {number} [filters.minRating]
 * @param {Object} pagination
 * @param {number} [pagination.skip=0]
 * @param {number} [pagination.limit=20]
 * @param {Object} [options]
 * @param {boolean} [options.suppressAuth=false]
 * @returns {Promise<{ items: Array, totalCount: number, hasNext: boolean }>}
 */
export async function queryEntries(filters = {}, pagination = {}, options = {}) {
  const { skip = 0, limit = 20 } = pagination;
  let query = wixData.query(COLLECTION);

  // Owner filter (always applied for non-admin)
  if (filters.userId) {
    query = query.eq('userId', filters.userId);
  }

  // Date range
  if (filters.dateFrom) {
    query = query.ge('date', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.le('date', filters.dateTo);
  }

  // Location
  if (filters.location) {
    query = query.eq('location', filters.location);
  }

  // Fishing type
  if (filters.fishingType) {
    query = query.hasSome('fishingTypes', [filters.fishingType]);
  }

  // Depth range
  if (filters.minDepth !== undefined && filters.minDepth !== null) {
    query = query.ge('depth', filters.minDepth);
  }
  if (filters.maxDepth !== undefined && filters.maxDepth !== null) {
    query = query.le('depth', filters.maxDepth);
  }

  // Rating
  if (filters.minRating !== undefined && filters.minRating !== null) {
    query = query.ge('rating', filters.minRating);
  }

  // Sort by date descending (newest first)
  query = query.descending('date');

  const result = await query
    .skip(skip)
    .limit(limit)
    .find(options.suppressAuth ? { suppressAuth: true } : undefined);

  return {
    items: result.items,
    totalCount: result.totalCount,
    hasNext: result.hasNext(),
  };
}

/**
 * Search entries by free text across location, notes, and catch species.
 * wix-data doesn't have full-text search, so we use contains on key fields.
 * @param {string} userId
 * @param {string} searchText
 * @param {Object} pagination
 * @param {Object} [options]
 * @returns {Promise<{ items: Array, totalCount: number, hasNext: boolean }>}
 */
export async function searchEntries(userId, searchText, pagination = {}, options = {}) {
  const { skip = 0, limit = 20 } = pagination;
  const findOptions = options.suppressAuth ? { suppressAuth: true } : undefined;

  // wix-data .contains() is case-insensitive
  let baseQuery = wixData.query(COLLECTION);
  if (userId) {
    baseQuery = baseQuery.eq('userId', userId);
  }

  // Search across location and notes using .contains()
  const locationQuery = baseQuery.contains('location', searchText);
  const notesQuery = baseQuery.contains('notes', searchText);
  const detailedLocQuery = baseQuery.contains('detailedLocation', searchText);

  const combinedQuery = locationQuery.or(notesQuery).or(detailedLocQuery);

  const result = await combinedQuery
    .descending('date')
    .skip(skip)
    .limit(limit)
    .find(findOptions);

  return {
    items: result.items,
    totalCount: result.totalCount,
    hasNext: result.hasNext(),
  };
}

/**
 * Get a single entry by ID.
 * @param {string} entryId
 * @param {Object} [options]
 * @returns {Promise<Object|null>}
 */
export async function getById(entryId, options = {}) {
  try {
    return await wixData.get(COLLECTION, entryId,
      options.suppressAuth ? { suppressAuth: true } : undefined
    );
  } catch (_) {
    return null;
  }
}

/**
 * Insert a new entry.
 * @param {Object} entry
 * @returns {Promise<Object>} The inserted entry with _id
 */
export async function insert(entry) {
  return wixData.insert(COLLECTION, entry);
}

/**
 * Update an existing entry.
 * @param {Object} entry - Must include _id
 * @returns {Promise<Object>} The updated entry
 */
export async function update(entry) {
  return wixData.update(COLLECTION, entry);
}

/**
 * Remove an entry by ID.
 * @param {string} entryId
 * @returns {Promise<void>}
 */
export async function remove(entryId) {
  return wixData.remove(COLLECTION, entryId);
}

/**
 * Get all entries for a user (for export/stats).
 * Fetches all pages.
 * @param {string} [userId]
 * @param {Object} [options]
 * @returns {Promise<Array>}
 */
export async function getAllEntries(userId, options = {}) {
  const allItems = [];
  let skip = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    let query = wixData.query(COLLECTION);
    if (userId) {
      query = query.eq('userId', userId);
    }
    const result = await query
      .descending('date')
      .skip(skip)
      .limit(limit)
      .find(options.suppressAuth ? { suppressAuth: true } : undefined);

    allItems.push(...result.items);
    hasMore = result.hasNext();
    skip += limit;
  }

  return allItems;
}

/**
 * Bulk insert entries (for import).
 * @param {Array} entries
 * @returns {Promise<Object>} Bulk insert result
 */
export async function bulkInsert(entries) {
  return wixData.bulkInsert(COLLECTION, entries);
}
