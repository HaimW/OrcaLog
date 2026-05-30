"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { StatCard } from "@/components/stats/StatCard";
import { BarChart } from "@/components/stats/BarChart";
import { computeStats } from "@/shared/stats-calculator";
import { formatSpecies, formatMethod, formatNumber } from "@/shared/formatters";
import DiveMapWrapper from "@/components/map/DiveMapWrapper";
import TimeSeriesChartsWrapper from "@/components/stats/TimeSeriesChartsWrapper";
import PersonalRecordsCard from "@/components/stats/PersonalRecords";
import { computePersonalRecords } from "@/shared/stats-calculator";
import Link from "next/link";
import { SkeletonStatCard } from "@/components/ui/Skeleton";
import { Map, Waves } from "lucide-react";

export default function StatsPage() {
  const { t, lang } = useLanguage();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [showMap, setShowMap] = useState(false);

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

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-7 w-32 skeleton rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <SkeletonStatCard key={i} />)}
        </div>
      </div>
    );
  }

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{t("stats.title")}</h1>
        {isAdmin && users.length > 0 && (
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="input w-auto text-sm"
          >
            <option value="">{t("filter.allUsers")}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
            ))}
          </select>
        )}
      </div>

      {!entries.length ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--color-ocean-deep), var(--color-ocean-teal))" }}
          >
            <Waves size={36} className="text-white" />
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("stats.noData")}</p>
        </div>
      ) : (
        <>
          {/* Primary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
            <StatCard label={t("stats.totalDives")} value={stats.totalDives} icon="🤿" />
            <StatCard label={t("stats.totalFish")} value={stats.totalFishCaught} icon="🐟" />
            <StatCard label={t("stats.totalHours")} value={formatNumber(stats.totalHoursInWater, lang)} icon="⏱" />
            <StatCard label={t("stats.recentActivity")} value={stats.recentActivity} icon="📅" />
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
            <StatCard label={t("stats.avgRating")} value={formatNumber(stats.averageRating, lang)} icon="⭐" />
            <StatCard label={t("stats.avgDepth")} value={formatNumber(stats.averageDepth, lang)} unit="m" icon="🌊" />
            <StatCard label={t("stats.maxDepth")} value={formatNumber(stats.maxDepth, lang)} unit="m" icon="↕" />
            <StatCard label={t("stats.avgVisibility")} value={formatNumber(stats.averageVisibility, lang)} unit="m" icon="👁" />
          </div>

          {/* Tertiary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label={t("stats.avgWaterTemp")} value={formatNumber(stats.averageWaterTemperature, lang)} unit="°C" icon="🌡" />
          </div>

          {/* Charts */}
          {topSpeciesItems.length > 0 && (
            <BarChart title={t("stats.topSpecies")} items={topSpeciesItems} />
          )}

          {methodItems.length > 0 && (
            <BarChart title={t("stats.methodBreakdown")} items={methodItems} />
          )}

          {entries.length > 0 && (
            <PersonalRecordsCard records={computePersonalRecords(entries)} t={t} />
          )}

          {entries.length >= 2 && (
            <TimeSeriesChartsWrapper entries={entries} lang={lang} />
          )}

          {/* Map toggle */}
          <div>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`btn text-sm gap-2 ${showMap ? "btn-primary" : "btn-secondary"}`}
            >
              <Map size={15} />
              {showMap ? t("map.hideMap") : t("map.showMap")}
            </button>
          </div>

          {showMap && (
            <div className="h-64 sm:h-96 rounded-2xl overflow-hidden border animate-fade-in" style={{ borderColor: "var(--card-border)" }}>
              <DiveMapWrapper entries={entries} />
            </div>
          )}

          {/* Fishing analytics link */}
          <Link
            href="/stats/fishing"
            className="card block transition-all duration-200 text-center group"
            style={{ boxShadow: "var(--shadow-card)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "var(--shadow-hover)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "var(--shadow-card)"; (e.currentTarget as HTMLAnchorElement).style.transform = ""; }}
          >
            <p className="font-semibold" style={{ color: "var(--color-ocean-deep)" }}>
              🎣 {t("stats.fishing.title")} →
            </p>
          </Link>
        </>
      )}
    </div>
  );
}
