/**
 * OrcaLog — Entries Service
 *
 * Business logic for dive entry CRUD operations.
 * Validates, transforms, and delegates to the repository.
 */

import * as entriesRepo from '../repositories/entries-repository';
import { validateDiveEntry, sanitizeDiveEntry } from '../utils/validators-backend';

/**
 * Get paginated dive entries for a user with optional filters.
 * @param {string} userId
 * @param {Object} filters
 * @param {Object} pagination - { skip, limit }
 * @returns {Promise<{ items: Array, totalCount: number, hasNext: boolean }>}
 */
export async function getEntries(userId, filters = {}, pagination = {}) {
  const mergedFilters = { ...filters, userId };
  return entriesRepo.queryEntries(mergedFilters, pagination);
}

/**
 * Search entries by free text.
 * @param {string} userId
 * @param {string} searchText
 * @param {Object} pagination
 * @returns {Promise<{ items: Array, totalCount: number, hasNext: boolean }>}
 */
export async function searchEntries(userId, searchText, pagination = {}) {
  return entriesRepo.searchEntries(userId, searchText, pagination);
}

/**
 * Get a single entry by ID with ownership check.
 * @param {string} entryId
 * @param {string} userId
 * @returns {Promise<Object>}
 * @throws {Error} NOT_FOUND or NOT_AUTHORIZED
 */
export async function getEntry(entryId, userId) {
  const entry = await entriesRepo.getById(entryId);
  if (!entry) {
    throw new Error('NOT_FOUND');
  }
  if (entry.userId !== userId) {
    throw new Error('NOT_AUTHORIZED');
  }
  return entry;
}

/**
 * Create a new dive entry.
 * @param {string} userId
 * @param {Object} data - Entry data (without userId or _id)
 * @returns {Promise<Object>} The created entry
 * @throws {Error} VALIDATION_FAILED with details
 */
export async function createEntry(userId, data) {
  const entry = sanitizeDiveEntry({ ...data, userId });

  const validation = validateDiveEntry(entry);
  if (!validation.valid) {
    const err = new Error('VALIDATION_FAILED');
    err.details = validation.errors;
    throw err;
  }

  // Ensure date is a Date object
  if (typeof entry.date === 'string') {
    entry.date = new Date(entry.date);
  }

  return entriesRepo.insert(entry);
}

/**
 * Update an existing dive entry.
 * @param {string} entryId
 * @param {string} userId
 * @param {Object} data - Updated fields
 * @returns {Promise<Object>} The updated entry
 * @throws {Error} NOT_FOUND, NOT_AUTHORIZED, or VALIDATION_FAILED
 */
export async function updateEntry(entryId, userId, data) {
  const existing = await entriesRepo.getById(entryId);
  if (!existing) {
    throw new Error('NOT_FOUND');
  }
  if (existing.userId !== userId) {
    throw new Error('NOT_AUTHORIZED');
  }

  const merged = sanitizeDiveEntry({ ...existing, ...data, userId, _id: entryId });

  const validation = validateDiveEntry(merged);
  if (!validation.valid) {
    const err = new Error('VALIDATION_FAILED');
    err.details = validation.errors;
    throw err;
  }

  if (typeof merged.date === 'string') {
    merged.date = new Date(merged.date);
  }

  return entriesRepo.update(merged);
}

/**
 * Delete a dive entry.
 * @param {string} entryId
 * @param {string} userId
 * @throws {Error} NOT_FOUND or NOT_AUTHORIZED
 */
export async function deleteEntry(entryId, userId) {
  const existing = await entriesRepo.getById(entryId);
  if (!existing) {
    throw new Error('NOT_FOUND');
  }
  if (existing.userId !== userId) {
    throw new Error('NOT_AUTHORIZED');
  }
  return entriesRepo.remove(entryId);
}

/**
 * Get all entries for a user (for export or stats).
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getAllForUser(userId) {
  return entriesRepo.getAllEntries(userId);
}
