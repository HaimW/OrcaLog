/**
 * OrcaLog — Backend Auth Utilities
 *
 * Wraps wix-members-backend to provide auth helpers.
 * All privileged backend operations should call these before proceeding.
 */

import { currentMember } from 'wix-members-backend';
import wixData from 'wix-data';

const COLLECTIONS = {
  USER_PROFILES: 'UserProfiles',
  APP_CONFIG: 'AppConfig',
};

/**
 * Get the currently logged-in user's member ID.
 * @returns {Promise<string>} Member ID
 * @throws {Error} If no user is logged in
 */
export async function getCurrentUserId() {
  const member = await currentMember.getMember({ fieldsets: ['FULL'] });
  if (!member || !member._id) {
    throw new Error('NOT_AUTHENTICATED');
  }
  return member._id;
}

/**
 * Get the current member's full info.
 * @returns {Promise<{ id: string, email: string, name: string }>}
 * @throws {Error} If no user is logged in
 */
export async function getCurrentUser() {
  const member = await currentMember.getMember({ fieldsets: ['FULL'] });
  if (!member || !member._id) {
    throw new Error('NOT_AUTHENTICATED');
  }
  return {
    id: member._id,
    email: member.loginEmail || '',
    name: member.contactDetails?.firstName || member.profile?.nickname || '',
    fullName: `${member.contactDetails?.firstName || ''} ${member.contactDetails?.lastName || ''}`.trim(),
  };
}

/**
 * Require that a user is authenticated. Throws if not.
 * @returns {Promise<string>} The user's member ID
 */
export async function requireAuth() {
  return getCurrentUserId();
}

/**
 * Check if the current user has admin role.
 * First checks UserProfiles.role, then falls back to AppConfig.adminEmails.
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  try {
    const user = await getCurrentUser();

    // Check UserProfiles role
    const profileResult = await wixData.query(COLLECTIONS.USER_PROFILES)
      .eq('userId', user.id)
      .find({ suppressAuth: true });

    if (profileResult.items.length > 0 && profileResult.items[0].role === 'admin') {
      return true;
    }

    // Check AppConfig.adminEmails
    const configResult = await wixData.query(COLLECTIONS.APP_CONFIG)
      .find({ suppressAuth: true });

    if (configResult.items.length > 0) {
      const adminEmails = configResult.items[0].adminEmails || [];
      return adminEmails.includes(user.email);
    }

    return false;
  } catch (_) {
    return false;
  }
}

/**
 * Require admin access. Throws if user is not admin.
 * @returns {Promise<string>} The admin user's member ID
 */
export async function requireAdmin() {
  const userId = await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('NOT_AUTHORIZED');
  }
  return userId;
}
