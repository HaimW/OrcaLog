import { he } from "./he";
import { en } from "./en";

const dictionaries: Record<string, Record<string, string>> = { he, en };

export function t(key: string, params?: Record<string, string | number>, lang?: string): string {
  const currentLang = lang || "he";
  const dict = dictionaries[currentLang] || dictionaries.he;
  let text = dict[key] || dictionaries.he[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
  }

  return text;
}

export function getLocale(lang: string): string {
  return lang === "he" ? "he-IL" : "en-US";
}
