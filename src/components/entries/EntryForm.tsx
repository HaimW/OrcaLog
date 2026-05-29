"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useLanguage } from "@/i18n/LanguageProvider";
import { StarRating } from "@/components/ui/StarRating";
import { PhotoUpload } from "./PhotoUpload";
import { Modal } from "@/components/ui/Modal";
import {
  DIVING_LOCATIONS,
  LOCATION_REGIONS,
  WEATHER_CONDITIONS,
  COMPASS_DIRECTIONS,
  EQUIPMENT_TYPES,
  COMMON_FISH_SPECIES,
  FISHING_METHODS,
  MAX_NOTES_LENGTH,
  getLocalizedList,
} from "@/shared/constants";
import { validateEntryForm } from "@/shared/validators";
import { formatDateForInput } from "@/shared/formatters";

function nowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function calcDuration(start: string, end: string): string {
  if (!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? String(mins) : "";
}

const KNOWN_LOCATION_IDS = new Set(DIVING_LOCATIONS.map((l) => l.id));

interface EntryFormProps {
  initial?: any;
  entryId?: string;
}

function emptyCatch() {
  return {
    id: uuidv4(),
    species: "",
    weight: null,
    length: null,
    quantity: 1,
    method: "speargun",
    released: false,
    photo: "",
    notes: "",
  };
}

export function EntryForm({ initial, entryId }: EntryFormProps) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const isEdit = Boolean(entryId);

  const [date, setDate] = useState<string>(
    initial?.date ? formatDateForInput(initial.date) : formatDateForInput(new Date())
  );
  const [time, setTime] = useState(initial?.time || (!isEdit ? nowTime() : ""));
  const [startTime, setStartTime] = useState(initial?.startTime || "");
  const [endTime, setEndTime] = useState(initial?.endTime || "");

  // Determine if the saved location is a custom (free-text) value
  const initLocId = initial?.location || "";
  const initIsCustom = !!initLocId && !KNOWN_LOCATION_IDS.has(initLocId);
  const [locationId, setLocationId] = useState(initIsCustom ? "__custom__" : initLocId);
  const [customLocation, setCustomLocation] = useState(initIsCustom ? initLocId : "");

  // Derive the location value sent to the server
  const location = locationId === "__custom__" ? customLocation : locationId;

  const [detailedLocation, setDetailedLocation] = useState(initial?.detailedLocation || "");
  const [depth, setDepth] = useState<string>(initial?.depth?.toString() || "");
  const [duration, setDuration] = useState<string>(initial?.duration?.toString() || "");

  // Auto-calculate duration when both dive times are set
  useEffect(() => {
    const calc = calcDuration(startTime, endTime);
    if (calc) setDuration(calc);
  }, [startTime, endTime]);
  const [visibility, setVisibility] = useState<string>(initial?.visibility?.toString() || "");

  const initWeather = initial?.weather || {};
  const [conditions, setConditions] = useState<string[]>(initWeather.conditions || []);
  const [airTemp, setAirTemp] = useState<string>(initWeather.temperature?.toString() || "");
  const [waterTemp, setWaterTemp] = useState<string>(initWeather.waterTemperature?.toString() || "");
  const [windDirection, setWindDirection] = useState(initWeather.windDirection || "");
  const [windIntensity, setWindIntensity] = useState<string>(initWeather.windIntensity?.toString() || "0");
  const [currentDirection, setCurrentDirection] = useState(initWeather.currentDirection || "");
  const [currentIntensity, setCurrentIntensity] = useState<string>(initWeather.currentIntensity?.toString() || "0");

  const initEquipment = initial?.equipment || {};
  const [mask, setMask] = useState(initEquipment.mask || "");
  const [fins, setFins] = useState(initEquipment.fins || "");
  const [suit, setSuit] = useState(initEquipment.suit || "");
  const [weight, setWeight] = useState<string>(initEquipment.weight?.toString() || "");
  const [gear, setGear] = useState<string>((initEquipment.gear || []).join(", "));

  const [fishingTypes, setFishingTypes] = useState<string[]>(initial?.fishingTypes || []);
  const [catches, setCatches] = useState<any[]>(initial?.catches || []);
  const [photos, setPhotos] = useState<string[]>(initial?.photos || []);
  const [notes, setNotes] = useState(initial?.notes || "");
  const [rating, setRating] = useState<number>(initial?.rating || 0);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Group locations by region for the dropdown
  const regionLabels = Object.fromEntries(
    LOCATION_REGIONS.map((r) => [r.id, lang === "he" ? r.he : r.en])
  );
  const locationsByRegion = LOCATION_REGIONS.map((r) => ({
    regionId: r.id,
    label: regionLabels[r.id],
    items: getLocalizedList(DIVING_LOCATIONS.filter((l) => l.region === r.id), lang),
  })).filter((g) => g.items.length > 0);
  const weatherItems = getLocalizedList(WEATHER_CONDITIONS, lang);
  const compass = getLocalizedList(COMPASS_DIRECTIONS, lang);
  const masks = getLocalizedList(EQUIPMENT_TYPES.masks, lang);
  const finsList = getLocalizedList(EQUIPMENT_TYPES.fins, lang);
  const suits = getLocalizedList(EQUIPMENT_TYPES.suits, lang);
  const species = getLocalizedList(COMMON_FISH_SPECIES, lang);
  const methods = getLocalizedList(FISHING_METHODS, lang);

  function toggleCondition(id: string) {
    setConditions(conditions.includes(id) ? conditions.filter((c) => c !== id) : [...conditions, id]);
  }

  function toggleFishingType(id: string) {
    setFishingTypes(fishingTypes.includes(id) ? fishingTypes.filter((c) => c !== id) : [...fishingTypes, id]);
  }

  function updateCatch(i: number, key: string, value: any) {
    const updated = [...catches];
    updated[i] = { ...updated[i], [key]: value };
    setCatches(updated);
  }

  function removeCatch(i: number) {
    setCatches(catches.filter((_, idx) => idx !== i));
  }

  function buildData() {
    return {
      date,
      time: time || null,
      startTime: startTime || null,
      endTime: endTime || null,
      location: location || null,
      detailedLocation: detailedLocation || null,
      depth: depth ? Number(depth) : null,
      duration: duration ? Number(duration) : null,
      visibility: visibility ? Number(visibility) : null,
      weather: {
        conditions,
        temperature: airTemp ? Number(airTemp) : null,
        waterTemperature: waterTemp ? Number(waterTemp) : null,
        windDirection,
        windIntensity: windIntensity ? Number(windIntensity) : null,
        currentDirection,
        currentIntensity: currentIntensity ? Number(currentIntensity) : null,
      },
      equipment: {
        mask,
        fins,
        suit,
        weight: weight ? Number(weight) : null,
        gear: gear.split(",").map((s) => s.trim()).filter(Boolean),
      },
      fishingTypes,
      catches: catches.map((c) => ({
        ...c,
        weight: c.weight ? Number(c.weight) : null,
        length: c.length ? Number(c.length) : null,
        quantity: Number(c.quantity) || 1,
      })),
      photos,
      notes: notes || null,
      rating,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = buildData();
    const validation = validateEntryForm(data);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setSaving(true);

    const url = isEdit ? `/api/entries/${entryId}` : "/api/entries";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setSaving(false);

    if (res.ok) {
      const entry = await res.json();
      router.push(`/entries/${entry.id}`);
    } else {
      alert(t("error.generic"));
    }
  }

  async function handleDelete() {
    setShowDelete(false);
    const res = await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/entries");
    }
  }

  function err(key: string) {
    const errKey = errors[key];
    if (!errKey) return null;
    return <p className="text-coral text-xs mt-1">{t(errKey, { max: MAX_NOTES_LENGTH })}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ocean-deep">
          {isEdit ? t("form.editTitle") : t("form.addTitle")}
        </h1>
      </div>

      {/* Section 1: Basic Info */}
      <section className="card space-y-3">
        <h2 className="section-title">{t("form.section.basic")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">{t("form.date")} *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            {err("date")}
          </div>
          <div>
            <label className="label">{t("form.time")} <span className="text-gray-400 font-normal text-xs">(auto-filled)</span></label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">{t("form.startTime")}</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">{t("form.endTime")}</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">{t("form.duration")} {startTime && endTime && calcDuration(startTime, endTime) && <span className="text-ocean-teal font-normal text-xs">(auto)</span>}</label>
            <input type="number" min="0" value={duration} onChange={(e) => setDuration(e.target.value)} className="input" placeholder="minutes" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">{t("form.location")}</label>
            <select
              value={locationId}
              onChange={(e) => { setLocationId(e.target.value); if (e.target.value !== "__custom__") setCustomLocation(""); }}
              className="input"
            >
              <option value="">— {lang === "he" ? "בחר מיקום" : "Select location"} —</option>
              {locationsByRegion.map((group) => (
                <optgroup key={group.regionId} label={group.label}>
                  {group.items.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </optgroup>
              ))}
              <option value="__custom__">✏️ {lang === "he" ? "מיקום אחר / מותאם אישית" : "Other / Custom location"}</option>
            </select>
            {locationId === "__custom__" && (
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="input mt-2"
                placeholder={lang === "he" ? "הקלד שם מיקום..." : "Type location name..."}
                autoFocus
              />
            )}
          </div>
          <div>
            <label className="label">{t("form.detailedLocation")}</label>
            <input type="text" value={detailedLocation} onChange={(e) => setDetailedLocation(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">{t("form.depth")}</label>
            <input type="number" step="0.5" min="0" max="100" value={depth} onChange={(e) => setDepth(e.target.value)} className="input" />
            {err("depth")}
          </div>
          <div>
            <label className="label">{t("form.visibility")}</label>
            <input type="number" step="0.5" min="0" max="50" value={visibility} onChange={(e) => setVisibility(e.target.value)} className="input" />
            {err("visibility")}
          </div>
        </div>
      </section>

      {/* Section 2: Weather */}
      <section className="card space-y-3">
        <h2 className="section-title">{t("form.section.weather")}</h2>
        <div>
          <label className="label">{t("form.weather.conditions")}</label>
          <div className="flex flex-wrap gap-2">
            {weatherItems.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => toggleCondition(w.id)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  conditions.includes(w.id) ? "bg-ocean-teal text-white border-ocean-teal" : "bg-white border-gray-300"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">{t("form.weather.airTemp")}</label>
            <input type="number" value={airTemp} onChange={(e) => setAirTemp(e.target.value)} className="input" />
            {err("airTemp")}
          </div>
          <div>
            <label className="label">{t("form.weather.waterTemp")}</label>
            <input type="number" value={waterTemp} onChange={(e) => setWaterTemp(e.target.value)} className="input" />
            {err("waterTemp")}
          </div>
          <div>
            <label className="label">{t("form.weather.windDirection")}</label>
            <select value={windDirection} onChange={(e) => setWindDirection(e.target.value)} className="input">
              <option value="">-</option>
              {compass.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t("form.weather.windIntensity")}</label>
            <input type="range" min="0" max="10" value={windIntensity} onChange={(e) => setWindIntensity(e.target.value)} className="w-full" />
            <span className="text-sm">{windIntensity}/10</span>
          </div>
          <div>
            <label className="label">{t("form.weather.currentDirection")}</label>
            <select value={currentDirection} onChange={(e) => setCurrentDirection(e.target.value)} className="input">
              <option value="">-</option>
              {compass.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t("form.weather.currentIntensity")}</label>
            <input type="range" min="0" max="10" value={currentIntensity} onChange={(e) => setCurrentIntensity(e.target.value)} className="w-full" />
            <span className="text-sm">{currentIntensity}/10</span>
          </div>
        </div>
      </section>

      {/* Section 3: Equipment */}
      <section className="card space-y-3">
        <h2 className="section-title">{t("form.section.equipment")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">{t("form.equipment.mask")}</label>
            <select value={mask} onChange={(e) => setMask(e.target.value)} className="input">
              <option value="">-</option>
              {masks.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t("form.equipment.fins")}</label>
            <select value={fins} onChange={(e) => setFins(e.target.value)} className="input">
              <option value="">-</option>
              {finsList.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t("form.equipment.suit")}</label>
            <select value={suit} onChange={(e) => setSuit(e.target.value)} className="input">
              <option value="">-</option>
              {suits.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t("form.equipment.weight")}</label>
            <input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">{t("form.equipment.gear")}</label>
            <input type="text" value={gear} onChange={(e) => setGear(e.target.value)} className="input" placeholder="a, b, c" />
          </div>
        </div>
      </section>

      {/* Fishing types */}
      <section className="card space-y-3">
        <h2 className="section-title">{t("detail.fishingTypes")}</h2>
        <div className="flex flex-wrap gap-2">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => toggleFishingType(m.id)}
              className={`px-3 py-1 rounded-full border text-sm ${
                fishingTypes.includes(m.id) ? "bg-ocean-teal text-white border-ocean-teal" : "bg-white border-gray-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      {/* Section 4: Catches */}
      <section className="card space-y-3">
        <h2 className="section-title">{t("form.section.catches")}</h2>
        {catches.map((c, i) => (
          <div key={c.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">#{i + 1}</span>
              <button type="button" onClick={() => removeCatch(i)} className="text-coral text-sm">
                {t("form.catch.remove")}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="label">{t("form.catch.species")} *</label>
                <select value={c.species} onChange={(e) => updateCatch(i, "species", e.target.value)} className="input">
                  <option value="">-</option>
                  {species.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                {errors[`catch_${i}_species`] && <p className="text-coral text-xs">{t(errors[`catch_${i}_species`])}</p>}
              </div>
              <div>
                <label className="label">{t("form.catch.method")}</label>
                <select value={c.method} onChange={(e) => updateCatch(i, "method", e.target.value)} className="input">
                  {methods.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t("form.catch.weight")}</label>
                <input type="number" value={c.weight || ""} onChange={(e) => updateCatch(i, "weight", e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">{t("form.catch.length")}</label>
                <input type="number" value={c.length || ""} onChange={(e) => updateCatch(i, "length", e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">{t("form.catch.quantity")}</label>
                <input type="number" min="1" value={c.quantity} onChange={(e) => updateCatch(i, "quantity", e.target.value)} className="input" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id={`released-${i}`}
                  checked={c.released}
                  onChange={(e) => updateCatch(i, "released", e.target.checked)}
                />
                <label htmlFor={`released-${i}`}>{t("form.catch.released")}</label>
              </div>
              <div className="sm:col-span-2">
                <label className="label">{t("form.catch.notes")}</label>
                <input type="text" value={c.notes || ""} onChange={(e) => updateCatch(i, "notes", e.target.value)} className="input" />
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setCatches([...catches, emptyCatch()])} className="btn btn-secondary">
          + {t("form.catch.add")}
        </button>
      </section>

      {/* Section 5: Photos */}
      <section className="card space-y-3">
        <h2 className="section-title">{t("form.section.photos")}</h2>
        <PhotoUpload photos={photos} onChange={setPhotos} />
      </section>

      {/* Section 6: Notes & Rating */}
      <section className="card space-y-3">
        <h2 className="section-title">{t("form.section.notes")}</h2>
        <div>
          <label className="label">{t("form.notes")}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={MAX_NOTES_LENGTH}
            rows={4}
            className="input"
          />
          <p className="text-xs text-gray-500 mt-1">{t("form.notes.counter", { count: notes.length, max: MAX_NOTES_LENGTH })}</p>
          {err("notes")}
        </div>
        <div>
          <label className="label">{t("form.rating")} *</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
          {err("rating")}
        </div>
      </section>

      <div className="flex gap-2 justify-end flex-wrap">
        {isEdit && (
          <button type="button" onClick={() => setShowDelete(true)} className="btn btn-danger">
            {t("form.delete")}
          </button>
        )}
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">
          {t("form.cancel")}
        </button>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? t("form.saving") : t("form.save")}
        </button>
      </div>

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
    </form>
  );
}
