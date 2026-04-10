/**
 * OrcaLog — Profiles Service
 *
 * Business logic for user profile management.
 * Handles profile creation on first login and role resolution.
 */

import * as profilesRepo from '../repositories/profiles-repository';
import * as configRepo from '../repositories/config-repository';

const DEFAULT_PREFERENCES = {
  language: 'he',
  units: 'metric',
  theme: 'light',
  defaultLocation: '',
  notifications: {
    diveReminders: true,
    weatherAlerts: true,
    safetyTips: true,
  },
};

/**
 * Get or create a user profile.
 * On first login, creates a profile with default preferences.
 * Also resolves admin role from AppConfig.adminEmails.
 *
 * @param {Object} userInfo - { id, email, name, fullName }
 * @returns {Promise<Object>} UserProfile
 */
export async function getOrCreateProfile(userInfo) {
  let profile = await profilesRepo.getByUserId(userInfo.id, { suppressAuth: true });

  if (!profile) {
    // First login — create profile
    const role = await resolveRole(userInfo.email);
    profile = await profilesRepo.insert({
      userId: userInfo.id,
      username: userInfo.name || '',
      email: userInfo.email || '',
      fullName: userInfo.fullName || '',
      avatar: '',
      role,
      preferences: { ...DEFAULT_PREFERENCES },
    });
  } else {
    // Check if role needs updating (e.g., added to adminEmails since last login)
    const expectedRole = await resolveRole(userInfo.email);
    if (expectedRole === 'admin' && profile.role !== 'admin') {
      profile.role = 'admin';
      profile = await profilesRepo.update(profile);
    }
  }

  return profile;
}

/**
 * Get a user profile by userId.
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function getProfile(userId) {
  return profilesRepo.getByUserId(userId, { suppressAuth: true });
}

/**
 * Update user preferences.
 * @param {string} userId
 * @param {Object} preferences - Partial preferences to merge
 * @returns {Promise<Object>} Updated profile
 * @throws {Error} NOT_FOUND
 */
export async function updatePreferences(userId, preferences) {
  const profile = await profilesRepo.getByUserId(userId, { suppressAuth: true });
  if (!profile) {
    throw new Error('NOT_FOUND');
  }

  profile.preferences = {
    ...profile.preferences,
    ...preferences,
  };

  return profilesRepo.update(profile);
}

/**
 * Update profile fields (username, avatar, etc.).
 * @param {string} userId
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>}
 */
export async function updateProfile(userId, data) {
  const profile = await profilesRepo.getByUserId(userId, { suppressAuth: true });
  if (!profile) {
    throw new Error('NOT_FOUND');
  }

  // Only allow safe fields to be updated
  const allowedFields = ['username', 'fullName', 'avatar'];
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      profile[field] = data[field];
    }
  });

  if (data.preferences) {
    profile.preferences = { ...profile.preferences, ...data.preferences };
  }

  return profilesRepo.update(profile);
}

/**
 * Resolve the role for a user based on their email.
 * @param {string} email
 * @returns {Promise<string>} 'admin' or 'user'
 */
async function resolveRole(email) {
  if (!email) return 'user';

  try {
    const adminEmails = await configRepo.getAdminEmails();
    return adminEmails.includes(email) ? 'admin' : 'user';
  } catch (_) {
    return 'user';
  }
}
