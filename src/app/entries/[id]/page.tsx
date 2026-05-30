"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { StarRating } from "@/components/ui/StarRating";
import { Modal } from "@/components/ui/Modal";
import { shareViaWhatsApp, copyShareMessage } from "@/shared/share";
import {
  formatDate,
  formatLocation,
  formatSpecies,
  formatMethod,
  formatWeatherConditions,
  formatCompassDirection,
  formatEquipment,
  formatFishingTypes,
} from "@/shared/formatters";

export default function EntryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [groupEntries, setGroupEntries] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/entries/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setEntry(data);
        setLoading(false);
        if (data?.groupId) {
          fetch(`/api/entries/group/${data.groupId}`)
            .then(r => r.ok ? r.json() : [])
            .then((groupData: any[]) => {
              setGroupEntries(groupData.filter((e: any) => e.id !== data.id));
            })
            .catch(() => {});
        }
      });
    fetch("/api/config")
      .then((r) => r.ok ? r.json() : { whatsappGroupLink: "" })
      .then((c: any) => setWhatsappLink(c.whatsappGroupLink || ""));
  }, [params.id]);

  async function handleDelete() {
    setShowDelete(false);
    const res = await fetch(`/api/entries/${params.id}`, { method: "DELETE" });
    if (res.ok) router.push("/entries");
  }

  function handleShare() {
    const shared = shareViaWhatsApp(entry, lang, whatsappLink || undefined);
    if (!shared) copyShareMessage(entry, lang).then(() => alert(t("share.copied")));
  }

  async function handleCopyShareLink() {
    const res = await fetch(`/api/entries/${params.id}/share`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      const fullUrl = window.location.origin + data.url;
      try {
        await navigator.clipboard.writeText(fullUrl);
      } catch {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = fullUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  }

  if (loading) return <p className="text-center py-12">...</p>;
  if (!entry) return <p className="text-center py-12 text-gray-500">{t("error.notFound")}</p>;

  const w = entry.weather || {};
  const eq = entry.equipment || {};

  function Row({ label, value }: { label: string; value: any }) {
    if (!value && value !== 0) return null;
    return (
      <div className="flex justify-between py-1 border-b border-gray-100 last:border-0 gap-2">
        <span className="text-gray-600 text-sm">{label}</span>
        <span className="text-sm font-medium text-end">{value}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button onClick={() => router.back()} className="text-ocean-teal flex items-center gap-1">
          ← {t("detail.back")}
        </button>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleShare} className="btn btn-secondary text-sm">
            💬 {t("detail.share")}
          </button>
          <button
            onClick={handleCopyShareLink}
            className={`btn text-sm ${shareCopied ? "btn-primary" : "btn-secondary"}`}
          >
            🔗 {shareCopied ? t("share.linkCopied") : t("share.copyLink")}
          </button>
          <Link href={`/entries/${entry.id}/edit`} className="btn btn-primary text-sm">
            {t("detail.edit")}
          </Link>
          <button onClick={() => setShowDelete(true)} className="btn btn-danger text-sm">
            {t("detail.delete")}
          </button>
        </div>
      </div>

      {/* Title card */}
      <div className="card bg-ocean-deep text-white">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-ocean-light text-sm">{formatDate(entry.date, lang)}{entry.time ? ` • ${entry.time}` : ""}</p>
            <h1 className="text-xl font-bold mt-1">
              {formatLocation(entry.location, lang) || entry.location || t("detail.location")}
            </h1>
          </div>
          <StarRating value={entry.rating} readOnly />
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-3">
        {entry.depth != null && (
          <div className="card text-center">
            <p className="text-2xl font-bold text-ocean-teal">{entry.depth}</p>
            <p className="text-xs text-gray-500">{t("detail.depth")} (m)</p>
          </div>
        )}
        {entry.duration != null && (
          <div className="card text-center">
            <p className="text-2xl font-bold text-ocean-teal">{entry.duration}</p>
            <p className="text-xs text-gray-500">{t("detail.duration")} (min)</p>
          </div>
        )}
        {entry.visibility != null && (
          <div className="card text-center">
            <p className="text-2xl font-bold text-ocean-teal">{entry.visibility}</p>
            <p className="text-xs text-gray-500">{t("detail.visibility")} (m)</p>
          </div>
        )}
      </div>

      {/* Fishing types */}
      {entry.fishingTypes?.length > 0 && (
        <div className="card">
          <h2 className="section-title">{t("detail.fishingTypes")}</h2>
          <p>{formatFishingTypes(entry.fishingTypes, lang)}</p>
        </div>
      )}

      {/* Weather */}
      {(w.conditions?.length > 0 || w.temperature != null || w.waterTemperature != null) && (
        <div className="card">
          <h2 className="section-title">{t("detail.weather")}</h2>
          <Row label={t("detail.weather")} value={formatWeatherConditions(w.conditions, lang)} />
          <Row label={t("detail.airTemp")} value={w.temperature != null ? `${w.temperature}°C` : null} />
          <Row label={t("detail.waterTemp")} value={w.waterTemperature != null ? `${w.waterTemperature}°C` : null} />
          {(w.windDirection || w.windIntensity != null) && (
            <Row
              label={t("detail.wind")}
              value={[formatCompassDirection(w.windDirection, lang), w.windIntensity != null ? `${w.windIntensity}/10` : null]
                .filter(Boolean).join(" ")}
            />
          )}
          {(w.currentDirection || w.currentIntensity != null) && (
            <Row
              label={t("detail.current")}
              value={[formatCompassDirection(w.currentDirection, lang), w.currentIntensity != null ? `${w.currentIntensity}/10` : null]
                .filter(Boolean).join(" ")}
            />
          )}
        </div>
      )}

      {/* Equipment */}
      {(eq.mask || eq.fins || eq.suit || eq.weight || eq.gear?.length) && (
        <div className="card">
          <h2 className="section-title">{t("detail.equipment")}</h2>
          <Row label={t("detail.mask")} value={formatEquipment("masks", eq.mask, lang)} />
          <Row label={t("detail.fins")} value={formatEquipment("fins", eq.fins, lang)} />
          <Row label={t("detail.suit")} value={formatEquipment("suits", eq.suit, lang)} />
          <Row label={t("detail.weight")} value={eq.weight != null ? `${eq.weight} kg` : null} />
          <Row label={t("detail.gear")} value={eq.gear?.join(", ")} />
        </div>
      )}

      {/* Catches */}
      <div className="card">
        <h2 className="section-title">{t("detail.catches")}</h2>
        {!entry.catches?.length ? (
          <p className="text-gray-500 text-sm">{t("detail.noCatches")}</p>
        ) : (
          <div className="space-y-2">
            {entry.catches.map((c: any) => (
              <div key={c.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{formatSpecies(c.species, lang)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.released ? "bg-green-100 text-green-700" : "bg-coral/20 text-coral"}`}>
                    {c.released ? t("detail.released") : t("detail.kept")}
                  </span>
                </div>
                <div className="flex gap-3 mt-1 text-sm text-gray-600 flex-wrap">
                  <span>×{c.quantity}</span>
                  {c.weight && <span>{c.weight}g</span>}
                  {c.length && <span>{c.length}cm</span>}
                  <span>{formatMethod(c.method, lang)}</span>
                </div>
                {c.notes && <p className="text-sm text-gray-500 mt-1">{c.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photos */}
      <div className="card">
        <h2 className="section-title">{t("detail.photos")}</h2>
        {!entry.photos?.length ? (
          <p className="text-gray-500 text-sm">{t("detail.noPhotos")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {entry.photos.map((url: string, i: number) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-24 h-24 rounded-lg object-cover cursor-pointer hover:opacity-90"
                onClick={() => setLightbox(url)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="card">
        <h2 className="section-title">{t("detail.notes")}</h2>
        {entry.notes ? (
          <p className="text-sm whitespace-pre-wrap">{entry.notes}</p>
        ) : (
          <p className="text-gray-500 text-sm">{t("detail.noNotes")}</p>
        )}
      </div>

      {/* Detailed location (private) */}
      {entry.detailedLocation && (
        <div className="card">
          <h2 className="section-title">{t("detail.detailedLocation")}</h2>
          <p className="text-sm">{entry.detailedLocation}</p>
        </div>
      )}

      {/* Group Outing */}
      {entry.groupId && (
        <div className="card">
          <h2 className="section-title">{t("buddy.groupDives")}</h2>
          {groupEntries.length === 0 ? (
            <p className="text-sm text-gray-500">{t("buddy.noGroup")}</p>
          ) : (
            <div className="space-y-2">
              {groupEntries.map((ge: any) => (
                <Link
                  key={ge.id}
                  href={`/entries/${ge.id}`}
                  className="block border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">{ge.location || t("detail.location")}</p>
                    <p className="text-xs text-gray-500">{ge.date ? new Date(ge.date).toLocaleDateString() : ""}</p>
                  </div>
                  {ge.depth && <p className="text-xs text-gray-500">{ge.depth}m</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}

      <Modal
        open={showDelete}
        title={t("confirm.deleteEntry")}
        description={t("confirm.deleteEntryDesc")}
        confirmText={t("confirm.yes")}
        cancelText={t("confirm.no")}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        danger
      />
    </div>
  );
}
