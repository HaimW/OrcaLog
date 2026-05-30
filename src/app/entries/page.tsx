"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { EntryCard } from "@/components/entries/EntryCard";
import { FilterBar, Filters } from "@/components/entries/FilterBar";
import DiveMapWrapper from "@/components/map/DiveMapWrapper";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Search, SlidersHorizontal, Map, Download, Upload, Plus, Waves } from "lucide-react";

export default function EntriesPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [entries, setEntries] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters]);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/users").then((r) => r.json()).then(setUsers).catch(() => {});
    }
  }, [isAdmin]);

  async function fetchEntries() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const res = await fetch(`/api/entries?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setEntries(data.items);
      setTotalCount(data.totalCount);
    }
    setLoading(false);
  }

  async function handleExport() {
    const res = await fetch("/api/entries/export");
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orcalog-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      const res = await fetch("/api/entries/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        alert(t("io.importSuccess", { count: result.imported }));
        fetchEntries();
      } else {
        alert(t("io.importError", { error: "server" }));
      }
    } catch {
      alert(t("io.invalidFormat"));
    }
    e.target.value = "";
  }

  const hasActiveFilters = Object.keys(filters).length > 0 || search.length > 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{t("list.title")}</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn btn-secondary text-xs px-3 py-1.5" title={t("io.export")}>
            <Download size={14} />
            <span className="hidden sm:inline">{t("io.export")}</span>
          </button>
          <label className="btn btn-secondary text-xs px-3 py-1.5 cursor-pointer" title={t("io.import")}>
            <Upload size={14} />
            <span className="hidden sm:inline">{t("io.import")}</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <Link href="/entries/new" className="btn btn-primary text-xs px-3 py-1.5">
            <Plus size={14} />
            {t("nav.add")}
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder={t("list.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input ps-10"
        />
      </div>

      {/* Filter + map toggles */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn text-xs px-3 py-1.5 gap-1.5 ${showFilters ? "btn-primary" : "btn-secondary"}`}
        >
          <SlidersHorizontal size={13} />
          {t("filter.title")}
          {hasActiveFilters && !showFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-ocean-teal" />
          )}
        </button>

        <button
          onClick={() => setShowMap(!showMap)}
          className={`btn text-xs px-3 py-1.5 gap-1.5 ${showMap ? "btn-primary" : "btn-secondary"}`}
        >
          <Map size={13} />
          {showMap ? t("map.hideMap") : t("map.showMap")}
        </button>

        <p className="text-xs ms-auto" style={{ color: "var(--text-muted)" }}>
          {t("list.totalCount", { count: totalCount })}
        </p>
      </div>

      {showFilters && (
        <div className="animate-slide-down">
          <FilterBar filters={filters} onChange={setFilters} users={users} showUserFilter={isAdmin} />
        </div>
      )}

      {showMap && (
        <div className="h-64 sm:h-96 rounded-2xl overflow-hidden border animate-fade-in" style={{ borderColor: "var(--card-border)" }}>
          <DiveMapWrapper entries={entries} />
        </div>
      )}

      {/* Entry list */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--color-ocean-deep), var(--color-ocean-teal))" }}
          >
            <Waves size={36} className="text-white" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-base" style={{ color: "var(--text)" }}>{t("list.noResults")}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{t("list.addFirst")}</p>
          </div>
          <Link href="/entries/new" className="btn btn-primary px-6 py-2.5 mt-1">
            <Plus size={16} />
            {t("nav.add")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
