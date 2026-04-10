/**
 * OrcaLog — Shared Type Definitions (JSDoc)
 *
 * These typedefs provide IDE autocompletion and documentation
 * for all data shapes used across the application.
 */

// ─── Coordinates ──────────────────────────────────────────────

/**
 * @typedef {Object} Coordinates
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 */

// ─── Weather ──────────────────────────────────────────────────

/**
 * @typedef {Object} Weather
 * @property {Array<'sunny'|'cloudy'|'rainy'|'stormy'|'foggy'>} conditions
 * @property {number} [temperature]       - Air temperature in °C
 * @property {number} [waterTemperature]   - Water temperature in °C
 * @property {string} [windDirection]      - Compass direction (N, NE, E, etc.)
 * @property {number} [windIntensity]      - 0–10 scale
 * @property {string} [currentDirection]   - Compass direction
 * @property {number} [currentIntensity]   - 0–10 scale
 */

// ─── Equipment ────────────────────────────────────────────────

/**
 * @typedef {Object} Equipment
 * @property {string} [mask]    - Mask type from EQUIPMENT_TYPES.masks
 * @property {string} [fins]    - Fins type from EQUIPMENT_TYPES.fins
 * @property {string} [suit]    - Suit type from EQUIPMENT_TYPES.suits
 * @property {number} [weight]  - Weight in kg
 * @property {string[]} [gear]  - Additional gear tags
 */

// ─── Catch ────────────────────────────────────────────────────

/**
 * @typedef {Object} Catch
 * @property {string} id             - Unique ID (generated client-side)
 * @property {string} species        - Fish species key
 * @property {number} [weight]       - Weight in grams
 * @property {number} [length]       - Length in cm
 * @property {number} quantity       - Count (default 1)
 * @property {string} method         - Fishing method key
 * @property {boolean} released      - Was the fish released?
 * @property {string} [photo]        - Wix Media URL
 * @property {string} [notes]        - Catch-specific notes
 */

// ─── DiveEntry ────────────────────────────────────────────────

/**
 * @typedef {Object} DiveEntry
 * @property {string} _id
 * @property {string} userId
 * @property {Date} date
 * @property {string} [time]               - "HH:mm"
 * @property {string} [startTime]          - "HH:mm"
 * @property {string} [endTime]            - "HH:mm"
 * @property {string} location             - Location key or free text
 * @property {string} [detailedLocation]   - Private detailed location
 * @property {Coordinates} [coordinates]
 * @property {number} depth                - Meters (0–100)
 * @property {number} [duration]           - Minutes
 * @property {number} [visibility]         - Meters (0–50)
 * @property {Weather} [weather]
 * @property {Equipment} [equipment]
 * @property {string[]} [fishingTypes]     - Array of fishing method keys
 * @property {Catch[]} [catches]
 * @property {string[]} [photos]           - Wix Media URLs
 * @property {string} [notes]              - Max 500 chars
 * @property {number} rating               - 1–5
 * @property {Date} [_createdDate]
 * @property {Date} [_updatedDate]
 */

// ─── Notification Preferences ─────────────────────────────────

/**
 * @typedef {Object} NotificationPreferences
 * @property {boolean} [diveReminders]
 * @property {boolean} [weatherAlerts]
 * @property {boolean} [safetyTips]
 */

// ─── User Preferences ────────────────────────────────────────

/**
 * @typedef {Object} UserPreferences
 * @property {'he'|'en'} language
 * @property {'metric'|'imperial'} units
 * @property {'light'|'dark'} theme
 * @property {string} [defaultLocation]
 * @property {NotificationPreferences} [notifications]
 */

// ─── UserProfile ──────────────────────────────────────────────

/**
 * @typedef {Object} UserProfile
 * @property {string} _id
 * @property {string} userId
 * @property {string} [username]
 * @property {string} [email]
 * @property {string} [fullName]
 * @property {string} [avatar]           - Wix Media URL
 * @property {'user'|'admin'|'moderator'} role
 * @property {UserPreferences} preferences
 */

// ─── AppConfig ────────────────────────────────────────────────

/**
 * @typedef {Object} AppConfig
 * @property {string} _id
 * @property {string[]} adminEmails
 * @property {string} [whatsappGroupLink]
 */

// ─── API Result ───────────────────────────────────────────────

/**
 * @typedef {Object} ApiResult
 * @property {boolean} success
 * @property {*} data
 * @property {string|null} error - Error code or message
 */

// ─── Pagination ───────────────────────────────────────────────

/**
 * @typedef {Object} PaginationParams
 * @property {number} [skip=0]
 * @property {number} [limit=20]
 */

/**
 * @typedef {Object} PaginatedResult
 * @property {Array} items
 * @property {number} totalCount
 * @property {boolean} hasNext
 * @property {number} skip
 * @property {number} limit
 */

// ─── Filter Params ────────────────────────────────────────────

/**
 * @typedef {Object} EntryFilters
 * @property {string} [searchText]      - Free-text search
 * @property {Date} [dateFrom]
 * @property {Date} [dateTo]
 * @property {string} [location]        - Location key
 * @property {string} [fishingType]     - Fishing method key
 * @property {number} [minDepth]
 * @property {number} [maxDepth]
 * @property {number} [minRating]       - 1–5
 * @property {string} [userId]          - Admin filter by user
 */

// ─── Stats ────────────────────────────────────────────────────

/**
 * @typedef {Object} DiveStats
 * @property {number} totalDives
 * @property {number} totalFishCaught
 * @property {number} totalHoursInWater
 * @property {number} averageRating
 * @property {number} averageDepth
 * @property {number} maxDepth
 * @property {number} averageVisibility
 * @property {number} averageWaterTemperature
 * @property {number} recentActivity         - Count in last 30 days
 * @property {Array<{species: string, count: number}>} topSpecies     - Top 5
 * @property {Array<{method: string, count: number}>} methodBreakdown
 */

// ─── Bilingual Item ───────────────────────────────────────────

/**
 * @typedef {Object} BilingualItem
 * @property {string} id    - Internal key
 * @property {string} he    - Hebrew label
 * @property {string} en    - English label
 */

export {};
