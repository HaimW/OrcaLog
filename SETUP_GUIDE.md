# OrcaLog — Wix Setup Guide

Step-by-step instructions for installing OrcaLog into a Wix site with Velo enabled.

## Prerequisites

- A Wix site (Wix Studio or Editor X recommended)
- Velo enabled on the site (`Dev Mode` → `Turn on Dev Mode`)
- Wix Members app installed (Members Area enabled)
- At least one Wix member account for testing

---

## 1. Create Wix Data Collections

In the Wix Dashboard → **Databases** (Content Manager), create the following 3 collections. Use `wix-configs/collections-schema.json` as a reference.

### 1a. Create `DiveEntries`

- Click **+ Add Collection**
- Name: **DiveEntries**
- Set permissions: **Member Author** (Who can view: Site member author · Who can add: Site member · Who can update: Site member author · Who can delete: Site member author)
- Add these fields (field key → type):

| Field Key | Type |
|-----------|------|
| `userId` | Text |
| `date` | Date & Time |
| `time` | Text |
| `startTime` | Text |
| `endTime` | Text |
| `location` | Text |
| `detailedLocation` | Text |
| `coordinates` | Object |
| `depth` | Number |
| `duration` | Number |
| `visibility` | Number |
| `weather` | Object |
| `equipment` | Object |
| `fishingTypes` | Tags (or Array of Text) |
| `catches` | Object (or Array) |
| `photos` | Tags (or Array of Text/URL) |
| `notes` | Text |
| `rating` | Number |

### 1b. Create `UserProfiles`

- Name: **UserProfiles**
- Permissions: **Member Author**
- Fields:

| Field Key | Type |
|-----------|------|
| `userId` | Text |
| `username` | Text |
| `email` | Text |
| `fullName` | Text |
| `avatar` | Text |
| `role` | Text |
| `preferences` | Object |

### 1c. Create `AppConfig`

- Name: **AppConfig**
- Permissions: **Admin** (for all operations — the backend will read with `suppressAuth`)
- Fields:

| Field Key | Type |
|-----------|------|
| `adminEmails` | Tags (or Array of Text) |
| `whatsappGroupLink` | Text |

Only **one document** should exist in this collection.

---

## 2. Add Code Files to Velo

Open the **Velo Sidebar** (code panel). Enable GitHub integration or copy the files manually.

### Backend files (`Public & Backend` section)

Copy these files into the **Backend** folder, preserving the subfolder structure:

```
backend/
├── data.js                           ← Wix data hooks (file MUST be named data.js)
├── api/
│   ├── entries-api.jsw
│   ├── profiles-api.jsw
│   ├── admin-api.jsw
│   └── config-api.jsw
├── repositories/
│   ├── entries-repository.js
│   ├── profiles-repository.js
│   └── config-repository.js
├── services/
│   ├── entries-service.js
│   ├── profiles-service.js
│   ├── admin-service.js
│   ├── media-service.js
│   └── import-export-service.js
└── utils/
    ├── auth.js
    ├── result.js
    └── validators-backend.js
```

### Public files (shared modules)

Copy these into the **Public** folder:

```
public/
├── types.js
├── config/
│   ├── constants.js
│   └── element-ids.js
├── i18n/
│   ├── he.js
│   ├── en.js
│   └── index.js
├── core/
│   ├── event-bus.js
│   ├── state-manager.js
│   ├── auth-client.js
│   └── error-handler.js
├── views/
│   ├── list-view.js
│   ├── form-view.js
│   ├── detail-view.js
│   ├── stats-view.js
│   └── admin-view.js
└── utils/
    ├── validators.js
    ├── formatters.js
    ├── share.js
    └── stats-calculator.js
```

---

## 3. Create the Wix Page

1. Add a new blank page → name it **OrcaLog**
2. In the Velo sidebar, find `Pages → OrcaLog` and paste the contents of `src/pages/OrcaLog.js` into its code panel.

### Add UI Elements

Add the following elements to the page. **Element IDs must match exactly** — they're defined in `public/config/element-ids.js`.

#### Login Gate (shown when not logged in)
- Box: `#loginGate`
- Button: `#loginBtn`

#### Main App Container
- Box: `#appContent`

#### Top Navigation (inside `#appContent`)
- Text/Button: `#langToggle`
- Box: `#offlineBanner` (hidden by default)

#### Bottom Navigation
- Button: `#navEntries`
- Button: `#navAdd`
- Button: `#navStats`
- Button: `#navAdmin` (hidden by default — only shown for admins)

#### View Containers (all hidden initially except #listView)
- Box: `#listView`
- Box: `#detailView`
- Box: `#formView`
- Box: `#statsView`
- Box: `#adminView`

#### List View elements (inside `#listView`)

| ID | Type | Notes |
|----|------|-------|
| `#searchInput` | TextInput | |
| `#filterDateFrom` | DatePicker | |
| `#filterDateTo` | DatePicker | |
| `#filterLocation` | Dropdown | |
| `#filterFishingType` | Dropdown | |
| `#filterMinDepth` | TextInput (number) | |
| `#filterMaxDepth` | TextInput (number) | |
| `#filterMinRating` | Dropdown or TextInput | |
| `#filterUserAdmin` | Dropdown | Admin-only |
| `#applyFiltersBtn` | Button | |
| `#clearFiltersBtn` | Button | |
| `#entriesRepeater` | Repeater | Dataset backing: none (data set by code) |
| `#noResultsText` | Text | |
| `#loadMoreBtn` | Button | |
| `#totalCountText` | Text | |
| `#fabAddBtn` | Button (floating) | |

Inside the `#entriesRepeater` item:
`#entryCard`, `#cardDate`, `#cardLocation`, `#cardDepth`, `#cardVisibility`, `#cardFishCount`, `#cardWaterTemp`, `#cardMethods`, `#cardPhoto` (Image), `#cardRating`

#### Form View elements (inside `#formView`)

See `public/config/element-ids.js` → `EL.form.*` for the full list. Key elements:

- `#formTitle` (Text)
- Inputs: `#inputDate`, `#inputTime`, `#inputStartTime`, `#inputEndTime`, `#inputLocation` (Dropdown), `#inputLocationFree`, `#inputDetailedLocation`, `#inputDepth`, `#inputDuration`, `#inputVisibility`
- Weather: `#inputWeatherConditions` (MultiCheckbox), `#inputAirTemp`, `#inputWaterTemp`, `#inputWindDirection`, `#inputWindIntensity` (Slider), `#inputCurrentDirection`, `#inputCurrentIntensity`
- Equipment: `#inputMask`, `#inputFins`, `#inputSuit`, `#inputWeight`, `#inputGear`
- Catches: `#catchesRepeater`, `#addCatchBtn`
  - Inside catch item: `#catchSpecies`, `#catchWeight`, `#catchLength`, `#catchQuantity`, `#catchMethod`, `#catchReleased` (Checkbox), `#catchPhoto`, `#catchNotes`, `#removeCatchBtn`
- Photos: `#photoUploadBtn` (UploadButton), `#formPhotosGallery` (Gallery)
- Notes & Rating: `#inputNotes` (TextArea), `#notesCharCounter`, `#inputRating`
- Actions: `#saveEntryBtn`, `#cancelEntryBtn`, `#deleteEntryBtn`
- `#formErrorSummary` (Text, hidden by default)

#### Detail View, Stats View, Admin View

See `public/config/element-ids.js` → `EL.detail.*`, `EL.stats.*`, `EL.admin.*` respectively for full element ID lists.

#### Toast & Modal
- Box: `#toastContainer`, Text: `#toastMessage`
- Box: `#confirmModal`, Text: `#confirmMessage`, Button: `#confirmYesBtn`, Button: `#confirmNoBtn`

---

## 4. Seed the AppConfig Collection

After uploading all code files, run the seed function **once**:

### Option A: Via a temporary test page

Create a temp page with a button that calls:

```js
import { seedConfig } from 'backend/api/config-api';

$w('#seedBtn').onClick(async () => {
  const result = await seedConfig({
    adminEmails: ['youradmin@example.com'],
    whatsappGroupLink: ''
  });
  console.log(result);
});
```

### Option B: Manually insert a document

In the Wix CMS, open `AppConfig` and add one row with:
- `adminEmails`: `["youradmin@example.com"]` (as array of strings)
- `whatsappGroupLink`: `""`

---

## 5. Configure Admin Users

Any user whose email appears in `AppConfig.adminEmails` will automatically receive the `admin` role on their next login. They will see:

- The **Admin** nav button
- Cross-user filter in list view
- User picker in stats view
- Access to `AdminPanel` (config editor, import/export, WhatsApp link)

To add a new admin: edit the `AppConfig` document and append their email to `adminEmails`.

---

## 6. Test the Installation

1. **Log in as a regular member** → Should see only your own entries
2. **Create a new dive entry** → Fill all sections, save → Should appear in list
3. **Click on an entry** → Detail view opens with full data
4. **Click Share** → Opens WhatsApp with formatted message
5. **Edit an entry** → Update and save
6. **Delete an entry** → Confirmation modal → deleted
7. **Click Stats** → See all 10 computed metrics
8. **Toggle Language** (HE ↔ EN) → All text and direction flips without reload
9. **Log in as admin** → Admin nav appears, can see all users' entries
10. **Export JSON** → File downloads with all entries
11. **Import JSON** → Restores all entries

---

## 7. Troubleshooting

### "Collection not found" error
→ Make sure collection names match **exactly**: `DiveEntries`, `UserProfiles`, `AppConfig`

### "Not authorized" error on admin operations
→ Check that the user's email is in `AppConfig.adminEmails` and log out/in to refresh role

### Language toggle doesn't flip direction
→ Wix pages don't always allow changing `document.dir` directly. Consider using Wix's built-in multilingual feature as an alternative, OR manually mirror the layout via Wix Editor X breakpoints

### Photo upload fails
→ Verify the UploadButton element's `uploadTypes` is set to `['image']` and file size limits are reasonable

### Entries not appearing for non-admin users
→ Collection permissions must be **Member Author** so each user only sees their own items. Double-check under **DiveEntries → Permissions**
