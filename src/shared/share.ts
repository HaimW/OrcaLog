import { t } from "@/i18n";
import { formatDate, formatLocation, formatCatchesSummary } from "./formatters";

export function buildShareMessage(entry: any, lang: string): string {
  const lines: string[] = [];

  lines.push(t("share.title", { date: formatDate(entry.date, lang), time: entry.time || "" }, lang));

  if (entry.location) {
    lines.push(t("share.location", { location: formatLocation(entry.location, lang) }, lang));
  }

  const waterTemp = entry.weather?.waterTemperature;
  lines.push(
    t("share.details", {
      depth: entry.depth || 0,
      visibility: entry.visibility || 0,
      waterTemp: waterTemp !== undefined ? waterTemp : "-",
    }, lang)
  );

  if (entry.catches && entry.catches.length > 0) {
    const catchList = formatCatchesSummary(entry.catches, lang);
    if (catchList) {
      lines.push(t("share.catches", { list: catchList }, lang));
    }
  }

  if (entry.rating) {
    lines.push(t("share.rating", { rating: entry.rating }, lang));
  }

  if (entry.notes) {
    lines.push(t("share.notes", { notes: entry.notes }, lang));
  }

  return lines.join("\n");
}

export function shareViaWhatsApp(entry: any, lang: string, whatsappGroupLink?: string): boolean {
  const message = buildShareMessage(entry, lang);
  const fullMessage = whatsappGroupLink ? message + "\n\n" + whatsappGroupLink : message;
  const url = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;

  try {
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
      return true;
    }
  } catch {
    // fallback below
  }
  return false;
}

export async function copyShareMessage(entry: any, lang: string): Promise<boolean> {
  const message = buildShareMessage(entry, lang);
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      return true;
    }
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = message;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
