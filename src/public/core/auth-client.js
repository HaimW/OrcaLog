/**
 * OrcaLog — Frontend Auth Client
 *
 * Handles login gate, profile loading, and role caching on the frontend.
 */

import { authentication, currentMember } from 'wix-members-frontend';
import { getMyProfile } from 'backend/api/profiles-api';
import { checkAdminStatus } from 'backend/api/admin-api';
import { ROLES } from '../config/constants';
import * as eventBus from './event-bus';

let cachedProfile = null;
let cachedIsAdmin = null;

/**
 * Check if the user is logged in.
 * @returns {Promise<boolean>}
 */
export async function isLoggedIn() {
  try {
    const member = await currentMember.getMember();
    return !!member;
  } catch (_) {
    return false;
  }
}

/**
 * Prompt the user to log in.
 * Uses Wix Members authentication.
 * @returns {Promise<boolean>} Whether login succeeded
 */
export async function promptLogin() {
  try {
    await authentication.promptLogin();
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Load the current user's profile from backend.
 * Creates a profile on first login.
 * @returns {Promise<Object|null>} UserProfile or null if not logged in
 */
export async function loadProfile() {
  try {
    const result = await getMyProfile();
    if (result.success) {
      cachedProfile = result.data;
      eventBus.emit('user:loggedIn', cachedProfile);
      return cachedProfile;
    }
    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Get the cached profile (or load if not cached).
 * @returns {Promise<Object|null>}
 */
export async function getProfile() {
  if (cachedProfile) return cachedProfile;
  return loadProfile();
}

/**
 * Check if the current user is an admin.
 * Caches the result for the session.
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  if (cachedIsAdmin !== null) return cachedIsAdmin;

  // Check cached profile first
  if (cachedProfile && cachedProfile.role === ROLES.ADMIN) {
    cachedIsAdmin = true;
    return true;
  }

  try {
    const result = await checkAdminStatus();
    cachedIsAdmin = result.success && result.data && result.data.isAdmin;
    return cachedIsAdmin;
  } catch (_) {
    cachedIsAdmin = false;
    return false;
  }
}

/**
 * Get the user's preferred language from profile.
 * @returns {string|null} 'he' or 'en', or null if no profile
 */
export function getPreferredLanguage() {
  if (cachedProfile && cachedProfile.preferences) {
    return cachedProfile.preferences.language || null;
  }
  return null;
}

/**
 * Get the user's display name.
 * @returns {string}
 */
export function getDisplayName() {
  if (!cachedProfile) return '';
  return cachedProfile.fullName || cachedProfile.username || '';
}

/**
 * Clear all cached auth data (on logout).
 */
export function clearCache() {
  cachedProfile = null;
  cachedIsAdmin = null;
}

/**
 * Register a handler for when the user logs in/out.
 * @param {Function} callback
 * @returns {Function} Unsubscribe
 */
export function onAuthChange(callback) {
  authentication.onLogin(() => {
    clearCache();
    loadProfile().then(() => callback(true));
  });

  authentication.onLogout(() => {
    clearCache();
    callback(false);
  });
}
