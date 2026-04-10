# OrcaLog

A complete spearfishing and diving logbook built for Wix with Velo. Features bilingual Hebrew (RTL) / English (LTR) support, multi-user profiles, role-based admin access, rich dive entry management, statistics dashboard, WhatsApp sharing, and JSON import/export.

## Features

- **Dive Entries** — Log date, location, depth, visibility, weather, equipment, catches, photos, notes, and rating
- **Bilingual UI** — Hebrew (RTL default) and English (LTR) with instant language toggle
- **Search & Filters** — Free-text search plus filter by date range, location, fishing type, depth range, rating
- **Statistics Dashboard** — 10+ computed metrics including top species, method breakdown, and recent activity
- **Admin Panel** — Cross-user entry access, config management, WhatsApp group link
- **WhatsApp Share** — One-click formatted share to WhatsApp or clipboard
- **JSON Import/Export** — Full data round-trip for backup and migration
- **Mobile Responsive** — Works on mobile and desktop Wix viewers

## Tech Stack

- **Platform**: Wix with Velo enabled
- **Frontend**: Wix $w + Velo JS (ES modules)
- **Backend**: Wix `.jsw` web modules + Wix Data Collections
- **Auth**: Wix Members API
- **Media**: Wix Media Manager
- **No external dependencies** — no Firebase, no third-party databases

## Architecture

OrcaLog uses a scalable 3-layer backend pattern and modular frontend view controllers:

```
Frontend:
  pages/OrcaLog.js            (page entry — 250 lines)
  public/views/*.js           (modular view controllers)
  public/core/*.js            (event bus, state manager, auth, error handling)
  public/utils/*.js           (formatters, validators, share, stats)
  public/config/*.js          (constants, element IDs)
  public/i18n/*.js            (he/en dictionaries + helper)

Backend:
  backend/api/*.jsw           (thin API facades with auth checks)
  backend/services/*.js       (business logic, validation)
  backend/repositories/*.js   (wix-data access layer)
  backend/utils/*.js          (auth, result builders, validation)
  backend/data.js             (Wix data hooks)
```

### Key Principles

1. **Thin .jsw / fat .js** — Web modules only do auth + delegate. Business logic lives in regular `.js` modules.
2. **Repository pattern** — All `wix-data` calls centralized in `repositories/`.
3. **Modular views** — Each view is its own controller with `init/destroy/refresh` interface.
4. **Event bus** — Decoupled pub/sub for view communication.
5. **Config-driven lists** — Species, locations, equipment all in `constants.js` as extensible registries.
6. **Centralized element IDs** — Single source of truth in `element-ids.js`.

## Installation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for step-by-step Wix setup instructions including:

1. Creating the 3 data collections with correct field definitions
2. Setting collection permissions
3. Adding code files to the Velo editor
4. Creating the Wix page with required UI elements
5. Seeding the `AppConfig` collection
6. Configuring admin users

## File Structure

```
OrcaLog/
├── README.md
├── SETUP_GUIDE.md
├── wix-configs/
│   └── collections-schema.json
└── src/
    ├── backend/
    │   ├── data.js
    │   ├── api/
    │   │   ├── entries-api.jsw
    │   │   ├── profiles-api.jsw
    │   │   ├── admin-api.jsw
    │   │   └── config-api.jsw
    │   ├── repositories/
    │   │   ├── entries-repository.js
    │   │   ├── profiles-repository.js
    │   │   └── config-repository.js
    │   ├── services/
    │   │   ├── entries-service.js
    │   │   ├── profiles-service.js
    │   │   ├── admin-service.js
    │   │   ├── media-service.js
    │   │   └── import-export-service.js
    │   └── utils/
    │       ├── auth.js
    │       ├── result.js
    │       └── validators-backend.js
    ├── public/
    │   ├── types.js
    │   ├── config/
    │   │   ├── constants.js
    │   │   └── element-ids.js
    │   ├── i18n/
    │   │   ├── he.js
    │   │   ├── en.js
    │   │   └── index.js
    │   ├── core/
    │   │   ├── event-bus.js
    │   │   ├── state-manager.js
    │   │   ├── auth-client.js
    │   │   └── error-handler.js
    │   ├── views/
    │   │   ├── list-view.js
    │   │   ├── form-view.js
    │   │   ├── detail-view.js
    │   │   ├── stats-view.js
    │   │   └── admin-view.js
    │   └── utils/
    │       ├── validators.js
    │       ├── formatters.js
    │       ├── share.js
    │       └── stats-calculator.js
    └── pages/
        └── OrcaLog.js
```

## Data Collections

### DiveEntries (Member Author)
Dive log entries owned by individual members. Contains nested objects for weather, equipment, and an array of catches.

### UserProfiles (Member Author)
Per-user profile with preferences (language, theme, units, notifications) and role (user/admin/moderator).

### AppConfig (Admin only)
Single document holding `adminEmails` array and `whatsappGroupLink`.

## Roles

- **user** — Default role. Can create, view, edit, delete their own dive entries.
- **admin** — Inherits user permissions plus: view all users' entries, edit `AppConfig`, access admin panel, cross-user filtering in stats.
- **moderator** — Reserved for future use.

## Adding Admin Users

Edit the `AppConfig` document and append an email to the `adminEmails` array. On the user's next login, their role will automatically upgrade to `admin`.

## Extending

### Add a new fish species
Append one entry to `COMMON_FISH_SPECIES` in `src/public/config/constants.js`:

```js
{ id: 'new_species', he: 'שם עברי', en: 'English Name' }
```

### Add a new diving location
Append one entry to `DIVING_LOCATIONS` in the same file.

### Add a new language
1. Create `src/public/i18n/fr.js` (or other)
2. Add `'fr'` to `SUPPORTED_LANGUAGES` in `src/public/i18n/index.js`
3. Translate all keys from `en.js`

### Add a new view
1. Create `src/public/views/my-view.js` with `init/destroy/refresh` functions
2. Add the view name to `VIEWS` in `constants.js`
3. Add the container element ID to `element-ids.js`
4. Register it in `pages/OrcaLog.js` via `stateManager.registerView()`

## Data Model Types

All data shapes are documented as JSDoc `@typedef` in `src/public/types.js` for IDE autocompletion.

## Predefined Lists

The following bilingual lists ship with OrcaLog, all defined in `src/public/config/constants.js`:

- **WEATHER_CONDITIONS** (5): sunny, cloudy, rainy, stormy, foggy
- **FISHING_METHODS** (5): speargun, pole spear, hook, net, other
- **LOCATION_REGIONS** (3): North, Center, South
- **COMPASS_DIRECTIONS** (8): N, NE, E, SE, S, SW, W, NW
- **COMMON_FISH_SPECIES** (20): Sea Bass, Sea Bream, Mullet, Tuna, etc.
- **DIVING_LOCATIONS** (14): Eilat, Haifa, Tel Aviv, Kinneret, Dead Sea spots
- **DEPTH_RANGES** (6): 0-5, 5-10, 10-15, 15-20, 20-30, 30+ m
- **VISIBILITY_RANGES** (5): Poor, Medium, Good, Excellent, Fantastic
- **EQUIPMENT_TYPES**: Masks (4), Fins (4), Suits (5)

## License

Proprietary — All rights reserved.

## Support

For setup issues, see [SETUP_GUIDE.md](./SETUP_GUIDE.md) § 7 (Troubleshooting).
