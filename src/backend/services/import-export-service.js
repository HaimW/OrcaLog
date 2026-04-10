/**
 * OrcaLog — Import/Export Service
 *
 * JSON import validation and bulk operations.
 * Export returns all user entries as clean JSON.
 */

import * as entriesRepo from '../repositories/entries-repository';
import { validateImportData, sanitizeDiveEntry } from '../utils/validators-backend';

/**
 * Export all entries for a user as a clean JSON-serializable array.
 * Strips internal Wix fields (_owner, _createdDate, etc.) for portability.
 *
 * @param {string} userId
 * @returns {Promise<Array>} Clean entry objects
 */
export async function exportEntries(userId) {
  const entries = await entriesRepo.getAllEntries(userId);

  return entries.map(entry => ({
    date: entry.date,
    time: entry.time || null,
    startTime: entry.startTime || null,
    endTime: entry.endTime || null,
    location: entry.location,
    detailedLocation: entry.detailedLocation || null,
    coordinates: entry.coordinates || null,
    depth: entry.depth,
    duration: entry.duration || null,
    visibility: entry.visibility || null,
    weather: entry.weather || null,
    equipment: entry.equipment || null,
    fishingTypes: entry.fishingTypes || [],
    catches: entry.catches || [],
    photos: entry.photos || [],
    notes: entry.notes || '',
    rating: entry.rating,
  }));
}

/**
 * Import entries from JSON data.
 * Validates shape, sanitizes, and bulk inserts.
 *
 * @param {string} userId
 * @param {Array} data - Array of entry objects
 * @returns {Promise<{ imported: number, errors: string[] }>}
 */
export async function importEntries(userId, data) {
  const validation = validateImportData(data);
  if (!validation.valid) {
    return { imported: 0, errors: validation.errors };
  }

  const entries = data.map(entry => {
    const sanitized = sanitizeDiveEntry({
      ...entry,
      userId,
    });

    // Ensure date is a Date object
    if (typeof sanitized.date === 'string') {
      sanitized.date = new Date(sanitized.date);
    }

    // Remove _id to let Wix generate new ones (upsert behavior)
    delete sanitized._id;

    return sanitized;
  });

  try {
    const result = await entriesRepo.bulkInsert(entries);
    return {
      imported: result.insertedItemIds ? result.insertedItemIds.length : entries.length,
      errors: [],
    };
  } catch (err) {
    return {
      imported: 0,
      errors: [err.message || 'BULK_INSERT_FAILED'],
    };
  }
}
