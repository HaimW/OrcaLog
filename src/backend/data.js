/**
 * OrcaLog — Wix Data Hooks
 *
 * Server-side hooks for data collections.
 * File must be named data.js in the backend root for Wix to recognize it.
 *
 * @see https://dev.wix.com/docs/velo/api-reference/wix-data/hooks
 */

import { currentMember } from 'wix-members-backend';

// ─── DiveEntries Hooks ────────────────────────────────────────

/**
 * Before inserting a DiveEntry: auto-set userId and sanitize.
 */
export function DiveEntries_beforeInsert(item, context) {
  // Auto-set userId from the current member if not already set
  if (!item.userId && context.currentUser && context.currentUser.id) {
    item.userId = context.currentUser.id;
  }

  // Ensure required defaults
  if (!item.catches) item.catches = [];
  if (!item.photos) item.photos = [];
  if (!item.fishingTypes) item.fishingTypes = [];

  // Sanitize notes
  if (item.notes && typeof item.notes === 'string') {
    item.notes = item.notes.trim().slice(0, 500);
  }

  // Ensure catches have IDs
  if (Array.isArray(item.catches)) {
    item.catches = item.catches.map((c, i) => ({
      ...c,
      id: c.id || `catch_${Date.now()}_${i}`,
      quantity: c.quantity || 1,
      released: !!c.released,
    }));
  }

  return item;
}

/**
 * Before updating a DiveEntry: re-sanitize.
 */
export function DiveEntries_beforeUpdate(item, context) {
  // Don't allow userId to change
  if (context.currentItem && context.currentItem.userId) {
    item.userId = context.currentItem.userId;
  }

  // Sanitize notes
  if (item.notes && typeof item.notes === 'string') {
    item.notes = item.notes.trim().slice(0, 500);
  }

  // Ensure catches have IDs
  if (Array.isArray(item.catches)) {
    item.catches = item.catches.map((c, i) => ({
      ...c,
      id: c.id || `catch_${Date.now()}_${i}`,
      quantity: c.quantity || 1,
      released: !!c.released,
    }));
  }

  return item;
}

// ─── UserProfiles Hooks ───────────────────────────────────────

/**
 * Before inserting a UserProfile: set defaults.
 */
export function UserProfiles_beforeInsert(item) {
  if (!item.role) {
    item.role = 'user';
  }

  if (!item.preferences) {
    item.preferences = {
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
  }

  return item;
}

/**
 * Before updating a UserProfile: prevent role self-escalation.
 * Only system (suppressAuth) can change role.
 */
export function UserProfiles_beforeUpdate(item, context) {
  // If this is NOT a suppressed-auth call, prevent role changes
  if (!context.suppressAuth && context.currentItem) {
    item.role = context.currentItem.role;
  }

  return item;
}
