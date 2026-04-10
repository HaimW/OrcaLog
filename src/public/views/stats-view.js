/**
 * OrcaLog — Stats View Controller
 *
 * Dashboard with computed statistics and bar charts.
 * Admin users can view stats for any specific user.
 */

import { getEntries } from 'backend/api/entries-api';
import { getAllEntries, getUserEntries, getAllUsers } from 'backend/api/admin-api';
import { EL } from '../config/element-ids';
import { t } from '../i18n/index';
import { computeStats, emptyStats } from '../utils/stats-calculator';
import { formatNumber, formatSpecies, formatMethod } from '../utils/formatters';
import * as authClient from '../core/auth-client';
import * as errorHandler from '../core/error-handler';

let $w = null;
let state = {
  isAdmin: false,
  selectedUserId: null,
};

// ─── Public API ──────────────────────────────────────────────

export async function init($wRef) {
  $w = $wRef;
  state.isAdmin = await authClient.isAdmin();

  applyStaticText();

  if (state.isAdmin) {
    await setupAdminUserFilter();
  }

  bindHandlers();
  await loadAndRenderStats();
}

export function destroy() {
  state.selectedUserId = null;
}

export async function refresh() {
  await loadAndRenderStats();
}

// ─── Setup ───────────────────────────────────────────────────

function applyStaticText() {
  // Labels for each stat — in Wix you'd set these on dedicated label elements
  // Here, the stat boxes show the value; labels come from surrounding elements
  safeSet(EL.stats.userFilter, 'placeholder', t('stats.userFilter'));
}

async function setupAdminUserFilter() {
  try {
    const result = await getAllUsers();
    if (result.success && Array.isArray(result.data)) {
      const options = [
        { label: t('admin.allUsers'), value: '' },
        ...result.data.map(u => ({
          label: u.fullName || u.username || u.email || u.userId,
          value: u.userId,
        })),
      ];
      $w(EL.stats.userFilter).options = options;
      safeShow(EL.stats.userFilter);
    }
  } catch (_) {}
}

function bindHandlers() {
  if (state.isAdmin) {
    try {
      $w(EL.stats.userFilter).onChange((event) => {
        state.selectedUserId = event.target.value || null;
        loadAndRenderStats();
      });
    } catch (_) {}
  }
}

// ─── Data Loading ────────────────────────────────────────────

async function loadAndRenderStats() {
  try {
    const entries = await fetchAllEntries();
    const stats = entries.length > 0 ? computeStats(entries) : emptyStats();
    renderStats(stats);
  } catch (err) {
    errorHandler.showError(err.message || 'UNKNOWN_ERROR');
    renderStats(emptyStats());
  }
}

async function fetchAllEntries() {
  const allEntries = [];
  let skip = 0;
  const limit = 50;
  let hasNext = true;

  while (hasNext) {
    let result;

    if (state.isAdmin) {
      if (state.selectedUserId) {
        result = await getUserEntries(state.selectedUserId, {}, { skip, limit });
      } else {
        result = await getAllEntries({}, { skip, limit });
      }
    } else {
      result = await getEntries({}, { skip, limit });
    }

    if (!result.success) {
      throw new Error(result.error);
    }

    allEntries.push(...result.data.items);
    hasNext = result.data.hasNext;
    skip += limit;
  }

  return allEntries;
}

// ─── Rendering ───────────────────────────────────────────────

function renderStats(stats) {
  safeSet(EL.stats.totalDives, 'text', formatNumber(stats.totalDives, 0));
  safeSet(EL.stats.totalFish, 'text', formatNumber(stats.totalFishCaught, 0));
  safeSet(EL.stats.totalHours, 'text', formatNumber(stats.totalHoursInWater, 1));
  safeSet(EL.stats.avgRating, 'text', formatNumber(stats.averageRating, 1));
  safeSet(EL.stats.avgDepth, 'text', `${formatNumber(stats.averageDepth, 1)}${t('unit.meters')}`);
  safeSet(EL.stats.maxDepth, 'text', `${formatNumber(stats.maxDepth, 1)}${t('unit.meters')}`);
  safeSet(EL.stats.avgVisibility, 'text', `${formatNumber(stats.averageVisibility, 1)}${t('unit.meters')}`);
  safeSet(EL.stats.avgWaterTemp, 'text', `${formatNumber(stats.averageWaterTemperature, 1)}${t('unit.celsius')}`);
  safeSet(EL.stats.recentActivity, 'text', formatNumber(stats.recentActivity, 0));

  renderBarChart(EL.stats.topSpeciesBar, stats.topSpecies, 'species', formatSpecies);
  renderBarChart(EL.stats.methodBreakdownBar, stats.methodBreakdown, 'method', formatMethod);
}

/**
 * Render a horizontal bar chart as an HTML component or text.
 * Uses Wix HtmlComponent if available, otherwise formats as text.
 * @param {string} elementId
 * @param {Array<{count: number}>} data
 * @param {string} labelField - 'species' or 'method'
 * @param {Function} formatter
 */
function renderBarChart(elementId, data, labelField, formatter) {
  if (!data || data.length === 0) {
    safeSet(elementId, 'text', t('stats.noData'));
    return;
  }

  const max = Math.max(...data.map(d => d.count));

  // Build simple text-based horizontal bar display
  const lines = data.map(d => {
    const label = formatter(d[labelField]);
    const barLength = Math.round((d.count / max) * 20);
    const bar = '█'.repeat(barLength);
    return `${label}: ${bar} ${d.count}`;
  });

  safeSet(elementId, 'text', lines.join('\n'));

  // If element is an HtmlComponent, post HTML for a real chart
  try {
    const el = $w(elementId);
    if (el.type === '$w.HtmlComponent' || (el.postMessage && typeof el.postMessage === 'function')) {
      const html = buildBarChartHtml(data, labelField, formatter);
      el.postMessage({ type: 'renderChart', html });
    }
  } catch (_) {}
}

function buildBarChartHtml(data, labelField, formatter) {
  const max = Math.max(...data.map(d => d.count));
  const rows = data.map(d => {
    const label = formatter(d[labelField]);
    const percentage = (d.count / max) * 100;
    return `
      <div style="display:flex;align-items:center;margin-bottom:8px;">
        <div style="width:120px;font-size:14px;">${label}</div>
        <div style="flex:1;background:#e8f4f8;border-radius:4px;overflow:hidden;">
          <div style="width:${percentage}%;background:#1B98A6;height:20px;"></div>
        </div>
        <div style="width:40px;text-align:right;font-size:14px;padding-left:8px;">${d.count}</div>
      </div>
    `;
  }).join('');

  return `<div style="font-family:sans-serif;padding:12px;">${rows}</div>`;
}

// ─── Safe Helpers ────────────────────────────────────────────

function safeSet(id, prop, value) {
  try { $w(id)[prop] = value; } catch (_) {}
}

function safeShow(id) {
  try { $w(id).show(); } catch (_) {}
}
