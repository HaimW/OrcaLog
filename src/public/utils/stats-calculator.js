/**
 * OrcaLog — Stats Calculator
 *
 * Pure functions that compute statistics from a list of dive entries.
 * No side effects, no DOM, no API calls — just math.
 */

/**
 * Compute all stats for a list of dive entries.
 * @param {Array} entries - Array of DiveEntry objects
 * @returns {DiveStats}
 */
export function computeStats(entries) {
  if (!entries || entries.length === 0) {
    return emptyStats();
  }

  return {
    totalDives: computeTotalDives(entries),
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

/**
 * Empty stats object for no-data state.
 * @returns {DiveStats}
 */
export function emptyStats() {
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

// ─── Individual Metrics ──────────────────────────────────────

export function computeTotalDives(entries) {
  return entries.length;
}

export function computeTotalFishCaught(entries) {
  return entries.reduce((sum, entry) => {
    if (!entry.catches || !Array.isArray(entry.catches)) return sum;
    return sum + entry.catches
      .filter(c => !c.released)
      .reduce((s, c) => s + (c.quantity || 1), 0);
  }, 0);
}

export function computeTotalHoursInWater(entries) {
  const totalMinutes = entries.reduce((sum, entry) => {
    return sum + (entry.duration || 0);
  }, 0);
  return Math.round((totalMinutes / 60) * 10) / 10; // 1 decimal place
}

export function computeAverageRating(entries) {
  const rated = entries.filter(e => typeof e.rating === 'number' && e.rating > 0);
  if (rated.length === 0) return 0;
  const sum = rated.reduce((s, e) => s + e.rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

export function computeAverageDepth(entries) {
  const withDepth = entries.filter(e => typeof e.depth === 'number' && e.depth >= 0);
  if (withDepth.length === 0) return 0;
  const sum = withDepth.reduce((s, e) => s + e.depth, 0);
  return Math.round((sum / withDepth.length) * 10) / 10;
}

export function computeMaxDepth(entries) {
  const depths = entries.map(e => e.depth).filter(d => typeof d === 'number');
  if (depths.length === 0) return 0;
  return Math.max(...depths);
}

export function computeAverageVisibility(entries) {
  const withVis = entries.filter(e => typeof e.visibility === 'number' && e.visibility >= 0);
  if (withVis.length === 0) return 0;
  const sum = withVis.reduce((s, e) => s + e.visibility, 0);
  return Math.round((sum / withVis.length) * 10) / 10;
}

export function computeAverageWaterTemperature(entries) {
  const withTemp = entries.filter(e =>
    e.weather && typeof e.weather.waterTemperature === 'number'
  );
  if (withTemp.length === 0) return 0;
  const sum = withTemp.reduce((s, e) => s + e.weather.waterTemperature, 0);
  return Math.round((sum / withTemp.length) * 10) / 10;
}

export function computeRecentActivity(entries) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return entries.filter(e => {
    if (!e.date) return false;
    const entryDate = typeof e.date === 'string' ? new Date(e.date) : e.date;
    return entryDate >= thirtyDaysAgo;
  }).length;
}

/**
 * Compute top N species by total quantity caught.
 * @param {Array} entries
 * @param {number} [limit=5]
 * @returns {Array<{species: string, count: number}>}
 */
export function computeTopSpecies(entries, limit = 5) {
  const counts = {};

  entries.forEach(entry => {
    if (!entry.catches || !Array.isArray(entry.catches)) return;
    entry.catches.forEach(c => {
      if (!c.species) return;
      counts[c.species] = (counts[c.species] || 0) + (c.quantity || 1);
    });
  });

  return Object.entries(counts)
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Compute breakdown by fishing method.
 * Counts dives per method (not catches).
 * @param {Array} entries
 * @returns {Array<{method: string, count: number}>}
 */
export function computeMethodBreakdown(entries) {
  const counts = {};

  entries.forEach(entry => {
    if (!entry.fishingTypes || !Array.isArray(entry.fishingTypes)) return;
    entry.fishingTypes.forEach(method => {
      counts[method] = (counts[method] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);
}
