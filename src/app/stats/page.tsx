"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { StatCard } from "@/components/stats/StatCard";
import { BarChart } from "@/components/stats/BarChart";
import { computeStats } from "@/shared/stats-calculator";
import { formatSpecies, formatMethod, formatNumber } from "@/shared/formatters";

export default function StatsPage() {
  const { t, lang } = useLanguage();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/users").then((r) => r.json()).then(setUsers).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    const params = new URLSearchParams({ take: "9999" });
    if (isAdmin && selectedUser) params.set("userId", selectedUser);
    fetch(`/api/entries?${params}`)
      .then((r) => r.json())
      .then((d) => { setEntries(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedUser, isAdmin]);

  if (loading) return <p className="text-center py-12">...</p>;

  const stats = computeStats(entries);

  const topSpeciesItems = stats.topSpecies.map((s) => ({
    label: formatSpecies(s.species, lang),
    count: s.count,
  }));
  const methodItems = stats.methodBreakdown.map((m) => ({
    label: formatMethod(m.method, lang),
    count: m.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-ocean-deep">{t("stats.title")}</h1>
        {isAdmin && users.length > 0 && (
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="input w-auto"
          >
            <option value="">{t("filter.allUsers")}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
            ))}
          </select>
        )}
      </div>

      {!entries.length ? (
        <p className="text-center text-gray-500 py-12">{t("stats.noData")}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label={t("stats.totalDives")} value={stats.totalDives} icon="🤿" />
            <StatCard label={t("stats.totalFish")} value={stats.totalFishCaught} icon="🐟" />
            <StatCard label={t("stats.totalHours")} value={formatNumber(stats.totalHoursInWater, lang)} icon="⏱" />
            <StatCard label={t("stats.recentActivity")} value={stats.recentActivity} icon="📅" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label={t("stats.avgRating")} value={formatNumber(stats.averageRating, lang)} icon="⭐" />
            <StatCard label={t("stats.avgDepth")} value={formatNumber(stats.averageDepth, lang)} unit="m" icon="🌊" />
            <StatCard label={t("stats.maxDepth")} value={formatNumber(stats.maxDepth, lang)} unit="m" icon="↕" />
            <StatCard label={t("stats.avgVisibility")} value={formatNumber(stats.averageVisibility, lang)} unit="m" icon="👁" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatCard label={t("stats.avgWaterTemp")} value={formatNumber(stats.averageWaterTemperature, lang)} unit="°C" icon="🌡" />
          </div>

          {topSpeciesItems.length > 0 && (
            <BarChart title={t("stats.topSpecies")} items={topSpeciesItems} />
          )}

          {methodItems.length > 0 && (
            <BarChart title={t("stats.methodBreakdown")} items={methodItems} />
          )}
        </>
      )}
    </div>
  );
}
