export interface DiveStats {
  totalDives: number;
  totalFishCaught: number;
  totalHoursInWater: number;
  averageRating: number;
  averageDepth: number;
  maxDepth: number;
  averageVisibility: number;
  averageWaterTemperature: number;
  recentActivity: number;
  topSpecies: { species: string; count: number }[];
  methodBreakdown: { method: string; count: number }[];
}

export function computeStats(entries: any[]): DiveStats {
  if (!entries || entries.length === 0) return emptyStats();

  return {
    totalDives: entries.length,
    totalFishCaught: computeTotalFishCaught(entries),
    totalHoursInWater: computeTotalHoursInWater(entries),
    averageRating: computeAverageRating(entries),
    averageDepth: computeAverageDepth(entries),
    maxDepth: computeMaxDepth(entries),
    averageVisibility: computeAverageVisibility(entries),
    averageWaterTemperature: computeAverageWaterTemperature(entries),
    recentActivity: computeRecentActivity(entries),
    topSpecies: computeTopSpecies(entries, 5),
    methodBreakdown: computeMethodBreakdown(entries),
  };
}

export function emptyStats(): DiveStats {
  return {
    totalDives: 0,
    totalFishCaught: 0,
    totalHoursInWater: 0,
    averageRating: 0,
    averageDepth: 0,
    maxDepth: 0,
    averageVisibility: 0,
    averageWaterTemperature: 0,
    recentActivity: 0,
    topSpecies: [],
    methodBreakdown: [],
  };
}

function computeTotalFishCaught(entries: any[]): number {
  return entries.reduce((sum: number, entry: any) => {
    if (!entry.catches || !Array.isArray(entry.catches)) return sum;
    return sum + entry.catches
      .filter((c: any) => !c.released)
      .reduce((s: number, c: any) => s + (c.quantity || 1), 0);
  }, 0);
}

function computeTotalHoursInWater(entries: any[]): number {
  const totalMinutes = entries.reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0);
  return Math.round((totalMinutes / 60) * 10) / 10;
}

function computeAverageRating(entries: any[]): number {
  const rated = entries.filter((e: any) => typeof e.rating === "number" && e.rating > 0);
  if (rated.length === 0) return 0;
  const sum = rated.reduce((s: number, e: any) => s + e.rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

function computeAverageDepth(entries: any[]): number {
  const withDepth = entries.filter((e: any) => typeof e.depth === "number" && e.depth >= 0);
  if (withDepth.length === 0) return 0;
  const sum = withDepth.reduce((s: number, e: any) => s + e.depth, 0);
  return Math.round((sum / withDepth.length) * 10) / 10;
}

function computeMaxDepth(entries: any[]): number {
  const depths = entries.map((e: any) => e.depth).filter((d: any) => typeof d === "number");
  if (depths.length === 0) return 0;
  return Math.max(...depths);
}

function computeAverageVisibility(entries: any[]): number {
  const withVis = entries.filter((e: any) => typeof e.visibility === "number" && e.visibility >= 0);
  if (withVis.length === 0) return 0;
  const sum = withVis.reduce((s: number, e: any) => s + e.visibility, 0);
  return Math.round((sum / withVis.length) * 10) / 10;
}

function computeAverageWaterTemperature(entries: any[]): number {
  const withTemp = entries.filter((e: any) => e.weather && typeof e.weather.waterTemperature === "number");
  if (withTemp.length === 0) return 0;
  const sum = withTemp.reduce((s: number, e: any) => s + e.weather.waterTemperature, 0);
  return Math.round((sum / withTemp.length) * 10) / 10;
}

function computeRecentActivity(entries: any[]): number {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return entries.filter((e: any) => {
    if (!e.date) return false;
    const d = typeof e.date === "string" ? new Date(e.date) : e.date;
    return d >= thirtyDaysAgo;
  }).length;
}

function computeTopSpecies(entries: any[], limit = 5) {
  const counts: Record<string, number> = {};
  entries.forEach((entry: any) => {
    if (!entry.catches || !Array.isArray(entry.catches)) return;
    entry.catches.forEach((c: any) => {
      if (!c.species) return;
      counts[c.species] = (counts[c.species] || 0) + (c.quantity || 1);
    });
  });
  return Object.entries(counts)
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function computeMethodBreakdown(entries: any[]) {
  const counts: Record<string, number> = {};
  entries.forEach((entry: any) => {
    if (!entry.fishingTypes || !Array.isArray(entry.fishingTypes)) return;
    entry.fishingTypes.forEach((method: string) => {
      counts[method] = (counts[method] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);
}
