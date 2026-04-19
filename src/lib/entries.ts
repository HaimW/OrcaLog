import { DiveEntry } from "@prisma/client";

export interface DiveEntryParsed extends Omit<DiveEntry, "weather" | "equipment" | "fishingTypes" | "catches" | "photos"> {
  weather: Weather | null;
  equipment: Equipment | null;
  fishingTypes: string[];
  catches: Catch[];
  photos: string[];
}

export interface Weather {
  conditions: string[];
  temperature: number | null;
  waterTemperature: number | null;
  windDirection: string;
  windIntensity: number | null;
  currentDirection: string;
  currentIntensity: number | null;
}

export interface Equipment {
  mask: string;
  fins: string;
  suit: string;
  weight: number | null;
  gear: string[];
}

export interface Catch {
  id: string;
  species: string;
  weight: number | null;
  length: number | null;
  quantity: number;
  method: string;
  released: boolean;
  photo: string;
  notes: string;
}

export function parseEntry(entry: DiveEntry): DiveEntryParsed {
  return {
    ...entry,
    weather: entry.weather ? JSON.parse(entry.weather) : null,
    equipment: entry.equipment ? JSON.parse(entry.equipment) : null,
    fishingTypes: entry.fishingTypes ? JSON.parse(entry.fishingTypes) : [],
    catches: entry.catches ? JSON.parse(entry.catches) : [],
    photos: entry.photos ? JSON.parse(entry.photos) : [],
  };
}

export function serializeEntry(data: any) {
  return {
    ...data,
    weather: data.weather ? JSON.stringify(data.weather) : null,
    equipment: data.equipment ? JSON.stringify(data.equipment) : null,
    fishingTypes: data.fishingTypes ? JSON.stringify(data.fishingTypes) : null,
    catches: data.catches ? JSON.stringify(data.catches) : null,
    photos: data.photos ? JSON.stringify(data.photos) : null,
  };
}
