export interface BilingualItem {
  id: string;
  he: string;
  en: string;
}

export interface LocationItem extends BilingualItem {
  region: string;
}

export interface RangeItem extends BilingualItem {
  min: number;
  max: number;
}

export const WEATHER_CONDITIONS: BilingualItem[] = [
  { id: "sunny", he: "שמש", en: "Sunny" },
  { id: "cloudy", he: "מעונן", en: "Cloudy" },
  { id: "rainy", he: "גשום", en: "Rainy" },
  { id: "stormy", he: "סוער", en: "Stormy" },
  { id: "foggy", he: "ערפילי", en: "Foggy" },
];

export const FISHING_METHODS: BilingualItem[] = [
  { id: "speargun", he: "רובה צלילה", en: "Speargun" },
  { id: "pole_spear", he: "פול ספייר", en: "Pole Spear" },
  { id: "hook", he: "חכה", en: "Rod & Hook" },
  { id: "net", he: "רשת", en: "Net" },
  { id: "other", he: "אחר", en: "Other" },
];

export const LOCATION_REGIONS: BilingualItem[] = [
  { id: "north", he: "צפון – ים תיכון", en: "North – Mediterranean" },
  { id: "center", he: "מרכז – ים תיכון", en: "Center – Mediterranean" },
  { id: "south_med", he: "דרום – ים תיכון", en: "South – Mediterranean" },
  { id: "kinneret", he: "כנרת", en: "Sea of Galilee" },
  { id: "dead_sea", he: "ים המלח", en: "Dead Sea" },
  { id: "red_sea", he: "ים סוף – אילת", en: "Red Sea – Eilat" },
];

export const COMPASS_DIRECTIONS: BilingualItem[] = [
  { id: "N", he: "צפון", en: "N" },
  { id: "NE", he: "צפון מזרח", en: "NE" },
  { id: "E", he: "מזרח", en: "E" },
  { id: "SE", he: "דרום מזרח", en: "SE" },
  { id: "S", he: "דרום", en: "S" },
  { id: "SW", he: "דרום מערב", en: "SW" },
  { id: "W", he: "מערב", en: "W" },
  { id: "NW", he: "צפון מערב", en: "NW" },
];

export const COMMON_FISH_SPECIES: BilingualItem[] = [
  { id: "sea_bass", he: "לברק", en: "Sea Bass" },
  { id: "sea_bream", he: "דניס", en: "Sea Bream" },
  { id: "mullet", he: "בורי", en: "Mullet" },
  { id: "white_seabream", he: "סרגוס", en: "White Seabream" },
  { id: "carp", he: "קרפיון", en: "Carp" },
  { id: "tuna", he: "טונה", en: "Tuna" },
  { id: "cod", he: "בקלה", en: "Cod" },
  { id: "catfish", he: "שפמנון", en: "Catfish" },
  { id: "dusky_grouper", he: "חרוב", en: "Dusky Grouper" },
  { id: "queenfish", he: "מלכה", en: "Queenfish" },
  { id: "amberjack", he: "קציר", en: "Amberjack" },
  { id: "bogue", he: "שמנון", en: "Bogue" },
  { id: "cardinalfish", he: "כוסבר", en: "Cardinalfish" },
  { id: "parrotfish", he: "פרידה", en: "Parrotfish" },
  { id: "scorpionfish", he: "ספר", en: "Scorpionfish" },
  { id: "sultan_bream", he: "סולטנית", en: "Sultan Bream" },
  { id: "red_mullet", he: "ברבוניה", en: "Red Mullet" },
  { id: "seabream", he: "ליטרינוס", en: "Seabream" },
  { id: "saddled_seabream", he: "אוכף", en: "Saddled Seabream" },
  { id: "butterfly", he: "פרפור", en: "Butterfly" },
];

export const DIVING_LOCATIONS: LocationItem[] = [
  // ─── North Mediterranean ───────────────────────────────────────────────────
  { id: "rosh_hanikra", he: "ראש הנקרה", en: "Rosh HaNikra", region: "north" },
  { id: "nahariya_galil", he: "נהריה – חוף הגליל", en: "Nahariya – Galil Beach", region: "north" },
  { id: "nahariya_gaaton", he: "נהריה – חוף געתון", en: "Nahariya – Gaaton Beach", region: "north" },
  { id: "achziv", he: "אכזיב", en: "Achziv", region: "north" },
  { id: "akko_argaman", he: "עכו – חוף ארגמן", en: "Akko – Argaman Beach", region: "north" },
  { id: "akko_golden", he: "עכו – חוף הזהב", en: "Akko – Golden Beach", region: "north" },
  { id: "haifa_bat_galim", he: "חיפה – בת גלים", en: "Haifa – Bat Galim", region: "north" },
  { id: "haifa_dado", he: "חיפה – חוף דדו", en: "Haifa – Dado Beach", region: "north" },
  { id: "haifa_carmel", he: "חיפה – חוף הכרמל", en: "Haifa – Carmel Beach", region: "north" },
  { id: "atlit", he: "עתלית", en: "Atlit", region: "north" },
  { id: "dor_beach", he: "חוף דור (תנטורה)", en: "Dor Beach (Tantura)", region: "north" },

  // ─── Center Mediterranean ──────────────────────────────────────────────────
  { id: "caesarea", he: "קיסריה", en: "Caesarea", region: "center" },
  { id: "netanya_sironit", he: "נתניה – חוף סירונית", en: "Netanya – Sironit Beach", region: "center" },
  { id: "netanya_blue", he: "נתניה – חוף הכחול", en: "Netanya – Blue Beach", region: "center" },
  { id: "netanya_gimbal", he: "נתניה – חוף גימבל", en: "Netanya – Gimbal Beach", region: "center" },
  { id: "netanya_north", he: "נתניה – חוף צפוני", en: "Netanya – North Beach", region: "center" },
  { id: "herzliya_sidna_ali", he: "הרצליה – סידנא עלי", en: "Herzliya – Sidna Ali", region: "center" },
  { id: "herzliya_arena", he: "הרצליה – חוף ארנה", en: "Herzliya – Arena Beach", region: "center" },
  { id: "tel_aviv_gordon", he: "תל אביב – חוף גורדון", en: "Tel Aviv – Gordon Beach", region: "center" },
  { id: "tel_aviv_hilton", he: "תל אביב – חוף הילטון", en: "Tel Aviv – Hilton Beach", region: "center" },
  { id: "tel_aviv_frishman", he: "תל אביב – חוף פרישמן", en: "Tel Aviv – Frishman Beach", region: "center" },
  { id: "tel_aviv_clore", he: "תל אביב – חוף קלור", en: "Tel Aviv – Charles Clore Beach", region: "center" },
  { id: "tel_aviv_tzuk", he: "תל אביב – חוף הצוק", en: "Tel Aviv – Tzuk Beach", region: "center" },
  { id: "bat_yam", he: "בת ים – חוף בת ים", en: "Bat Yam Beach", region: "center" },
  { id: "palmachim", he: "חוף פלמחים", en: "Palmachim Beach", region: "center" },

  // ─── South Mediterranean ───────────────────────────────────────────────────
  { id: "ashdod_lido", he: "אשדוד – חוף לידו", en: "Ashdod – Lido Beach", region: "south_med" },
  { id: "ashdod_delfinarium", he: "אשדוד – דלפינריום", en: "Ashdod – Delfinarium Beach", region: "south_med" },
  { id: "nitzanim", he: "חוף ניצנים", en: "Nitzanim Beach", region: "south_med" },
  { id: "ashkelon_barnea", he: "אשקלון – חוף ברנע", en: "Ashkelon – Barnea Beach", region: "south_med" },
  { id: "ashkelon_delila", he: "אשקלון – חוף דלילה", en: "Ashkelon – Delila Beach", region: "south_med" },
  { id: "zikim", he: "חוף זיקים", en: "Zikim Beach", region: "south_med" },

  // ─── Sea of Galilee (Kinneret) ─────────────────────────────────────────────
  { id: "kinneret_ginosar", he: "כנרת – גינוסר", en: "Kinneret – Ginosar", region: "kinneret" },
  { id: "kinneret_amnon", he: "כנרת – חוף עמנון", en: "Kinneret – Amnon Beach", region: "kinneret" },
  { id: "kinneret_migdal", he: "כנרת – מגדל", en: "Kinneret – Migdal", region: "kinneret" },
  { id: "kinneret_ein_gev", he: "כנרת – עין גב", en: "Kinneret – Ein Gev", region: "kinneret" },
  { id: "kinneret_lavnun", he: "כנרת – חוף לבנון", en: "Kinneret – Lavnun Beach", region: "kinneret" },
  { id: "kinneret_gofra", he: "כנרת – גופרה", en: "Kinneret – Gofra Beach", region: "kinneret" },

  // ─── Dead Sea ──────────────────────────────────────────────────────────────
  { id: "dead_sea_ein_gedi", he: "ים המלח – עין גדי", en: "Dead Sea – Ein Gedi", region: "dead_sea" },
  { id: "dead_sea_neve_zohar", he: "ים המלח – נווה זוהר", en: "Dead Sea – Neve Zohar", region: "dead_sea" },
  { id: "dead_sea_mineral", he: "ים המלח – מינרל ביץ׳", en: "Dead Sea – Mineral Beach", region: "dead_sea" },

  // ─── Red Sea (Eilat) ───────────────────────────────────────────────────────
  { id: "eilat_north_beach", he: "אילת – חוף צפוני", en: "Eilat – North Beach", region: "red_sea" },
  { id: "eilat_coral_beach", he: "אילת – שמורת חוף האלמוגים", en: "Eilat – Coral Beach NP", region: "red_sea" },
  { id: "eilat_dolphin_reef", he: "אילת – ריף הדולפינים", en: "Eilat – Dolphin Reef", region: "red_sea" },
  { id: "eilat_dolphin_ship", he: "אילת – ספינת הדולפין", en: "Eilat – Dolphin Ship", region: "red_sea" },
  { id: "eilat_migdan", he: "אילת – חוף מגדן", en: "Eilat – Migdan Beach", region: "red_sea" },
  { id: "eilat_princess", he: "אילת – חוף הנסיכה", en: "Eilat – Princess Beach", region: "red_sea" },
  { id: "eilat_japanese_garden", he: "אילת – גן יפני", en: "Eilat – Japanese Garden", region: "red_sea" },
  { id: "eilat_moses_rock", he: "אילת – סלע משה", en: "Eilat – Moses Rock", region: "red_sea" },
  { id: "eilat_liberty_bell", he: "אילת – פעמון החירות", en: "Eilat – Liberty Bell", region: "red_sea" },
  { id: "eilat_three_arches", he: "אילת – שלושת הקשתות", en: "Eilat – Three Arches", region: "red_sea" },
];

export const DEPTH_RANGES: RangeItem[] = [
  { id: "0-5", he: "0–5 מ׳", en: "0–5 m", min: 0, max: 5 },
  { id: "5-10", he: "5–10 מ׳", en: "5–10 m", min: 5, max: 10 },
  { id: "10-15", he: "10–15 מ׳", en: "10–15 m", min: 10, max: 15 },
  { id: "15-20", he: "15–20 מ׳", en: "15–20 m", min: 15, max: 20 },
  { id: "20-30", he: "20–30 מ׳", en: "20–30 m", min: 20, max: 30 },
  { id: "30+", he: "30+ מ׳", en: "30+ m", min: 30, max: 100 },
];

export const VISIBILITY_RANGES: RangeItem[] = [
  { id: "poor", he: "גרועה (0–2 מ׳)", en: "Poor (0–2 m)", min: 0, max: 2 },
  { id: "medium", he: "בינונית (2–5 מ׳)", en: "Medium (2–5 m)", min: 2, max: 5 },
  { id: "good", he: "טובה (5–10 מ׳)", en: "Good (5–10 m)", min: 5, max: 10 },
  { id: "excellent", he: "מצוינת (10–20 מ׳)", en: "Excellent (10–20 m)", min: 10, max: 20 },
  { id: "fantastic", he: "פנטסטית (20+ מ׳)", en: "Fantastic (20+ m)", min: 20, max: 50 },
];

export const EQUIPMENT_TYPES = {
  masks: [
    { id: "black_silicone", he: "סיליקון שחור", en: "Black Silicone" },
    { id: "clear_silicone", he: "סיליקון שקוף", en: "Clear Silicone" },
    { id: "black_rubber", he: "גומי שחור", en: "Black Rubber" },
    { id: "prescription", he: "עדשות מותאמות", en: "Prescription" },
  ] as BilingualItem[],
  fins: [
    { id: "plastic", he: "פלסטיק", en: "Plastic" },
    { id: "fiberglass", he: "פייברגלס", en: "Fiberglass" },
    { id: "carbon", he: "קרבון", en: "Carbon" },
    { id: "split", he: "מפוצלות", en: "Split" },
  ] as BilingualItem[],
  suits: [
    { id: "3mm_wetsuit", he: "חליפת 3 מ\"מ", en: "3mm Wetsuit" },
    { id: "5mm_wetsuit", he: "חליפת 5 מ\"מ", en: "5mm Wetsuit" },
    { id: "7mm_wetsuit", he: "חליפת 7 מ\"מ", en: "7mm Wetsuit" },
    { id: "drysuit", he: "חליפה יבשה", en: "Drysuit" },
    { id: "swimsuit", he: "בגד ים", en: "Swimsuit" },
  ] as BilingualItem[],
};

export const MAX_NOTES_LENGTH = 500;
export const MAX_DEPTH = 100;
export const MAX_VISIBILITY = 50;
export const DEFAULT_LANGUAGE = "he";
export const DEFAULT_PAGE_SIZE = 20;

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
} as const;

export function getLabel(list: BilingualItem[], id: string, lang: string): string {
  const item = list.find((i) => i.id === id);
  if (!item) return id;
  return (item as any)[lang] || item.en || id;
}

export function getLocalizedList(list: BilingualItem[], lang: string) {
  return list.map((item) => ({
    id: item.id,
    label: (item as any)[lang] || item.en || item.id,
  }));
}
