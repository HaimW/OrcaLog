/**
 * OrcaLog — AppConfig Repository
 *
 * Data access layer for the AppConfig collection (single document).
 */

import wixData from 'wix-data';

const COLLECTION = 'AppConfig';

/**
 * Get the AppConfig document.
 * Always uses suppressAuth since all users need to read config.
 * @returns {Promise<Object|null>}
 */
export async function getConfig() {
  const result = await wixData.query(COLLECTION)
    .find({ suppressAuth: true });

  return result.items.length > 0 ? result.items[0] : null;
}

/**
 * Update the AppConfig document.
 * @param {Object} config - Must include _id
 * @returns {Promise<Object>}
 */
export async function updateConfig(config) {
  return wixData.update(COLLECTION, config, { suppressAuth: true });
}

/**
 * Insert the initial AppConfig document (seed).
 * @param {Object} config
 * @returns {Promise<Object>}
 */
export async function insertConfig(config) {
  return wixData.insert(COLLECTION, config, { suppressAuth: true });
}

/**
 * Get the list of admin emails.
 * @returns {Promise<string[]>}
 */
export async function getAdminEmails() {
  const config = await getConfig();
  return config ? (config.adminEmails || []) : [];
}

/**
 * Get the WhatsApp group link.
 * @returns {Promise<string>}
 */
export async function getWhatsappLink() {
  const config = await getConfig();
  return config ? (config.whatsappGroupLink || '') : '';
}
