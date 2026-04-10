/**
 * OrcaLog — UserProfiles Repository
 *
 * Data access layer for the UserProfiles collection.
 */

import wixData from 'wix-data';

const COLLECTION = 'UserProfiles';

/**
 * Get a user profile by userId (wix-members ID).
 * @param {string} userId
 * @param {Object} [options]
 * @returns {Promise<Object|null>}
 */
export async function getByUserId(userId, options = {}) {
  const findOptions = options.suppressAuth ? { suppressAuth: true } : undefined;
  const result = await wixData.query(COLLECTION)
    .eq('userId', userId)
    .find(findOptions);

  return result.items.length > 0 ? result.items[0] : null;
}

/**
 * Get a user profile by _id.
 * @param {string} id
 * @param {Object} [options]
 * @returns {Promise<Object|null>}
 */
export async function getById(id, options = {}) {
  try {
    return await wixData.get(COLLECTION, id,
      options.suppressAuth ? { suppressAuth: true } : undefined
    );
  } catch (_) {
    return null;
  }
}

/**
 * Insert a new user profile.
 * @param {Object} profile
 * @returns {Promise<Object>}
 */
export async function insert(profile) {
  return wixData.insert(COLLECTION, profile, { suppressAuth: true });
}

/**
 * Update an existing user profile.
 * @param {Object} profile - Must include _id
 * @returns {Promise<Object>}
 */
export async function update(profile) {
  return wixData.update(COLLECTION, profile, { suppressAuth: true });
}

/**
 * Get all user profiles (admin only).
 * @returns {Promise<Array>}
 */
export async function getAll() {
  const allItems = [];
  let skip = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    const result = await wixData.query(COLLECTION)
      .skip(skip)
      .limit(limit)
      .find({ suppressAuth: true });

    allItems.push(...result.items);
    hasMore = result.hasNext();
    skip += limit;
  }

  return allItems;
}

/**
 * Check if a profile exists for a userId.
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function exists(userId) {
  const result = await wixData.query(COLLECTION)
    .eq('userId', userId)
    .count({ suppressAuth: true });

  return result > 0;
}
