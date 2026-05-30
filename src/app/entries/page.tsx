"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { EntryCard } from "@/components/entries/EntryCard";
import { FilterBar, Filters } from "@/components/entries/FilterBar";
import DiveMapWrapper from "@/components/map/DiveMapWrapper";

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
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-ocean-deep">{t("list.title")}</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn btn-secondary text-sm">{t("io.export")}</button>
          <label className="btn btn-secondary text-sm cursor-pointer">
            {t("io.import")}
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <Link href="/entries/new" className="btn btn-primary text-sm">+ {t("nav.add")}</Link>
        </div>
      </div>

      <input
        type="text"
        placeholder={t("list.search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input"
      />

      <button onClick={() => setShowFilters(!showFilters)} className="text-ocean-teal text-sm">
        {showFilters ? "▲" : "▼"} {t("filter.title")}
      </button>

      {showFilters && (
        <FilterBar filters={filters} onChange={setFilters} users={users} showUserFilter={isAdmin} />
      )}

      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-600">{t("list.totalCount", { count: totalCount })}</p>
        <button
          onClick={() => setShowMap(!showMap)}
          className="text-ocean-teal text-sm underline"
        >
          {showMap ? t("map.hideMap") : t("map.showMap")}
        </button>
      </div>

      {showMap && (
        <div className="h-64 sm:h-96 rounded-lg overflow-hidden mb-4">
          <DiveMapWrapper entries={entries} />
        </div>
      )}

      {loading ? (
        <p className="text-center py-8">...</p>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">{t("list.noResults")}</p>
          <p>{t("list.addFirst")}</p>
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
