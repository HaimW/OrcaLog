/**
 * OrcaLog — Admin Service
 *
 * Business logic for admin-only operations.
 * Cross-user queries, config management.
 */

import * as entriesRepo from '../repositories/entries-repository';
import * as profilesRepo from '../repositories/profiles-repository';
import * as configRepo from '../repositories/config-repository';

/**
 * Get all entries across all users (admin only).
 * @param {Object} [filters]
 * @param {Object} [pagination]
 * @returns {Promise<{ items: Array, totalCount: number, hasNext: boolean }>}
 */
export async function getAllEntries(filters = {}, pagination = {}) {
  return entriesRepo.queryEntries(filters, pagination, { suppressAuth: true });
}

/**
 * Get entries for a specific user (admin only).
 * @param {string} targetUserId
 * @param {Object} [filters]
 * @param {Object} [pagination]
 * @returns {Promise<{ items: Array, totalCount: number, hasNext: boolean }>}
 */
export async function getUserEntries(targetUserId, filters = {}, pagination = {}) {
  const mergedFilters = { ...filters, userId: targetUserId };
  return entriesRepo.queryEntries(mergedFilters, pagination, { suppressAuth: true });
}

/**
 * Search entries across all users (admin only).
 * @param {string} searchText
 * @param {Object} [pagination]
 * @returns {Promise<{ items: Array, totalCount: number, hasNext: boolean }>}
 */
export async function searchAllEntries(searchText, pagination = {}) {
  return entriesRepo.searchEntries(null, searchText, pagination, { suppressAuth: true });
}

/**
 * Get all user profiles (admin only).
 * @returns {Promise<Array>}
 */
export async function getAllUsers() {
  return profilesRepo.getAll();
}

/**
 * Get AppConfig.
 * @returns {Promise<Object>}
 */
export async function getConfig() {
  const config = await configRepo.getConfig();
  if (!config) {
    throw new Error('CONFIG_NOT_FOUND');
  }
  return config;
}

/**
 * Update AppConfig fields.
 * @param {Object} data - Fields to update (whatsappGroupLink, adminEmails, etc.)
 * @returns {Promise<Object>} Updated config
 */
export async function updateConfig(data) {
  const config = await configRepo.getConfig();
  if (!config) {
    throw new Error('CONFIG_NOT_FOUND');
  }

  if (data.whatsappGroupLink !== undefined) {
    config.whatsappGroupLink = data.whatsappGroupLink;
  }

  if (data.adminEmails !== undefined && Array.isArray(data.adminEmails)) {
    config.adminEmails = data.adminEmails;
  }

  return configRepo.updateConfig(config);
}

/**
 * Get all entries for a specific user for export (admin only).
 * @param {string} [userId] - If omitted, gets all entries
 * @returns {Promise<Array>}
 */
export async function getEntriesForExport(userId) {
  return entriesRepo.getAllEntries(userId, { suppressAuth: true });
}
