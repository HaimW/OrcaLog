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
import {
  Calendar, MapPin, Gauge, Wind, Waves, Wrench,
  Fish, Camera, StickyNote, Users, Trash2, Plus, X,
} from "lucide-react";

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

/* ── Section header ─────────────────────────────────────────────── */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
        style={{ background: "linear-gradient(135deg, var(--color-ocean-deep), var(--color-ocean-teal))" }}
      >
        {icon}
      </div>
      <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</h2>
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--card-border)" }} />
    </div>
  );
}

/* ── Chip toggle ────────────────────────────────────────────────── */
function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-150 active:scale-95"
      style={
        active
          ? {
              backgroundColor: "var(--color-ocean-teal)",
              borderColor: "var(--color-ocean-teal)",
              color: "#fff",
            }
          : {
              backgroundColor: "var(--surface-alt)",
              borderColor: "var(--card-border)",
              color: "var(--text-muted)",
            }
      }
    >
      {label}
    </button>
  );
}

/* ── Range slider with value bubble ────────────────────────────── */
function RangeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 accent-ocean-teal"
        />
        <span
          className="w-9 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: "var(--color-ocean-deep)" }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

/* ── Main form ──────────────────────────────────────────────────── */
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

  const initLocId = initial?.location || "";
  const initIsCustom = !!initLocId && !KNOWN_LOCATION_IDS.has(initLocId);
  const [locationId, setLocationId] = useState(initIsCustom ? "__custom__" : initLocId);
  const [customLocation, setCustomLocation] = useState(initIsCustom ? initLocId : "");

  const location = locationId === "__custom__" ? customLocation : locationId;

  const [detailedLocation, setDetailedLocation] = useState(initial?.detailedLocation || "");
  const [depth, setDepth] = useState<string>(initial?.depth?.toString() || "");
  const [duration, setDuration] = useState<string>(initial?.duration?.toString() || "");

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
  const [groupId, setGroupId] = useState<string>(initial?.groupId || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

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
      groupId: groupId || null,
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
    if (res.ok) router.push("/entries");
  }

  function err(key: string) {
    const errKey = errors[key];
    if (!errKey) return null;
    return <p className="text-coral text-xs mt-1">{t(errKey, { max: MAX_NOTES_LENGTH })}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      {/* Page title */}
      <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
        {isEdit ? t("form.editTitle") : t("form.addTitle")}
      </h1>

      {/* ── Section 1: Basic Info ─────────────────────────────── */}
      <section className="card space-y-3">
        <SectionHeader icon={<Calendar size={14} />} title={t("form.section.basic")} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">{t("form.date")} *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            {err("date")}
          </div>
          <div>
            <label className="label">
              {t("form.time")}
              <span className="ms-1.5 text-[10px] font-normal normal-case tracking-normal" style={{ color: "var(--color-ocean-teal)" }}>
                auto-filled
              </span>
            </label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">{t("form.startTime")}</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">
              {t("form.endTime")}
            </label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">
              {t("form.duration")}
              {startTime && endTime && calcDuration(startTime, endTime) && (
                <span className="ms-1.5 text-[10px] font-normal normal-case tracking-normal" style={{ color: "var(--color-ocean-teal)" }}>auto</span>
              )}
            </label>
            <input
              type="number"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input"
              placeholder="min"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="label"><MapPin size={10} className="inline me-1" />{t("form.location")}</label>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">{t("form.detailedLocation")}</label>
            <input type="text" value={detailedLocation} onChange={(e) => setDetailedLocation(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label"><Gauge size={10} className="inline me-1" />{t("form.depth")}</label>
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

      {/* ── Section 2: Weather ───────────────────────────────── */}
      <section className="card space-y-3">
        <SectionHeader icon={<Wind size={14} />} title={t("form.section.weather")} />

        <div>
          <label className="label">{t("form.weather.conditions")}</label>
          <div className="flex flex-wrap gap-2">
            {weatherItems.map((w) => (
              <Chip
                key={w.id}
                label={w.label}
                active={conditions.includes(w.id)}
                onClick={() => toggleCondition(w.id)}
              />
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
          <RangeField label={t("form.weather.windIntensity")} value={windIntensity} onChange={setWindIntensity} />
          <div>
            <label className="label">{t("form.weather.currentDirection")}</label>
            <select value={currentDirection} onChange={(e) => setCurrentDirection(e.target.value)} className="input">
              <option value="">-</option>
              {compass.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <RangeField label={t("form.weather.currentIntensity")} value={currentIntensity} onChange={setCurrentIntensity} />
        </div>
      </section>

      {/* ── Section 3: Equipment ─────────────────────────────── */}
      <section className="card space-y-3">
        <SectionHeader icon={<Wrench size={14} />} title={t("form.section.equipment")} />
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

      {/* ── Fishing types ────────────────────────────────────── */}
      <section className="card space-y-3">
        <SectionHeader icon={<Waves size={14} />} title={t("detail.fishingTypes")} />
        <div className="flex flex-wrap gap-2">
          {methods.map((m) => (
            <Chip
              key={m.id}
              label={m.label}
              active={fishingTypes.includes(m.id)}
              onClick={() => toggleFishingType(m.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Section 4: Catches ───────────────────────────────── */}
      <section className="card space-y-3">
        <SectionHeader icon={<Fish size={14} />} title={t("form.section.catches")} />

        {catches.map((c, i) => (
          <div
            key={c.id}
            className="rounded-xl border p-3 space-y-2.5"
            style={{ borderColor: "var(--card-border)", backgroundColor: "var(--surface-alt)" }}
          >
            {/* Catch header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, var(--color-ocean-deep), var(--color-ocean-teal))" }}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {c.species ? species.find((s) => s.id === c.species)?.label || c.species : t("form.catch.species")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeCatch(i)}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-coral/15"
                style={{ color: "var(--color-coral)" }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="label">{t("form.catch.species")} *</label>
                <select value={c.species} onChange={(e) => updateCatch(i, "species", e.target.value)} className="input">
                  <option value="">-</option>
                  {species.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                {errors[`catch_${i}_species`] && <p className="text-coral text-xs mt-1">{t(errors[`catch_${i}_species`])}</p>}
              </div>
              <div>
                <label className="label">{t("form.catch.method")}</label>
                <select value={c.method} onChange={(e) => updateCatch(i, "method", e.target.value)} className="input">
                  {methods.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t("form.catch.weight")} (g)</label>
                <input type="number" value={c.weight || ""} onChange={(e) => updateCatch(i, "weight", e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">{t("form.catch.length")} (cm)</label>
                <input type="number" value={c.length || ""} onChange={(e) => updateCatch(i, "length", e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">{t("form.catch.quantity")}</label>
                <input type="number" min="1" value={c.quantity} onChange={(e) => updateCatch(i, "quantity", e.target.value)} className="input" />
              </div>
              <div className="flex items-center gap-2.5 pt-5">
                <input
                  type="checkbox"
                  id={`released-${i}`}
                  checked={c.released}
                  onChange={(e) => updateCatch(i, "released", e.target.checked)}
                  className="w-4 h-4 accent-ocean-teal rounded"
                />
                <label htmlFor={`released-${i}`} className="text-sm" style={{ color: "var(--text)" }}>
                  {t("form.catch.released")}
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="label">{t("form.catch.notes")}</label>
                <input type="text" value={c.notes || ""} onChange={(e) => updateCatch(i, "notes", e.target.value)} className="input" />
              </div>
            </div>
          </div>
        ))}

        {/* Add catch button — dashed */}
        <button
          type="button"
          onClick={() => setCatches([...catches, emptyCatch()])}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all duration-150 hover:opacity-80 active:scale-98"
          style={{ borderColor: "var(--color-ocean-teal)", color: "var(--color-ocean-teal)" }}
        >
          <Plus size={15} />
          {t("form.catch.add")}
        </button>
      </section>

      {/* ── Section 5: Photos ────────────────────────────────── */}
      <section className="card space-y-3">
        <SectionHeader icon={<Camera size={14} />} title={t("form.section.photos")} />
        <PhotoUpload photos={photos} onChange={setPhotos} />
      </section>

      {/* ── Group outing ─────────────────────────────────────── */}
      <section className="card space-y-3">
        <SectionHeader icon={<Users size={14} />} title={t("buddy.groupId")} />
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="input flex-1"
              placeholder={lang === "he" ? "מזהה קבוצה (אופציונלי)" : "Group ID (optional)"}
            />
            <button
              type="button"
              onClick={() => setGroupId(uuidv4())}
              className="btn btn-secondary whitespace-nowrap"
            >
              {t("buddy.startGroup")}
            </button>
          </div>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>{t("buddy.groupHint")}</p>
        </div>
      </section>

      {/* ── Section 6: Notes & Rating ────────────────────────── */}
      <section className="card space-y-4">
        <SectionHeader icon={<StickyNote size={14} />} title={t("form.section.notes")} />
        <div>
          <label className="label">{t("form.notes")}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={MAX_NOTES_LENGTH}
            rows={4}
            className="input resize-none"
          />
          <div className="flex justify-between mt-1">
            {err("notes")}
            <p className="text-xs ms-auto tabular-nums" style={{ color: "var(--text-muted)" }}>
              {notes.length} / {MAX_NOTES_LENGTH}
            </p>
          </div>
        </div>
        <div>
          <label className="label">{t("form.rating")} *</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
          {err("rating")}
        </div>
      </section>

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="flex gap-2 justify-end flex-wrap pb-2">
        {isEdit && (
          <button type="button" onClick={() => setShowDelete(true)} className="btn btn-danger gap-1.5">
            <Trash2 size={14} />
            {t("form.delete")}
          </button>
        )}
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">
          {t("form.cancel")}
        </button>
        <button type="submit" disabled={saving} className="btn btn-primary min-w-[90px]">
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {t("form.saving")}
            </span>
          ) : t("form.save")}
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
