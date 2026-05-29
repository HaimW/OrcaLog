"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";

const ROOT_EMAIL = "yafim.sh@gmail.com";

export default function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const isRoot = (session?.user as any)?.email === ROOT_EMAIL;

  const [whatsappInput, setWhatsappInput] = useState("");
  const [adminEmailsInput, setAdminEmailsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !isAdmin)) {
      router.push("/entries");
    }
  }, [status, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  async function loadData() {
    const [usersRes, entriesRes] = await Promise.all([
      fetch("/api/users"),
      fetch("/api/entries?take=1"),
    ]);
    if (usersRes.ok) setUsers(await usersRes.json());
    if (entriesRes.ok) {
      const d = await entriesRes.json();
      setTotalEntries(d.totalCount ?? 0);
    }
    const configRes = await fetch("/api/config");
    if (configRes.ok) {
      const c = await configRes.json();
      setWhatsappInput(c.whatsappGroupLink || "");
      setAdminEmailsInput((c.adminEmails || []).join(", "));
    }
  }

  async function handleSaveConfig() {
    setSaving(true);
    setSaved(false);
    const adminEmails = adminEmailsInput.split(",").map((e) => e.trim()).filter(Boolean);
    // Always keep root email in the list
    if (!adminEmails.includes(ROOT_EMAIL)) adminEmails.unshift(ROOT_EMAIL);
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminEmails, whatsappGroupLink: whatsappInput }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function toggleRole(user: any) {
    setTogglingId(user.id);
    const newRole = user.role === "admin" ? "user" : "admin";
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
    }
    setTogglingId(null);
  }

  async function deleteUser(user: any) {
    if (!confirm(`Delete ${user.email} and all their entries? This cannot be undone.`)) return;
    setDeletingId(user.id);
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setDeletingId(null);
  }

  if (!isAdmin) return null;

  const adminCount = users.filter((u) => u.role === "admin").length;
  const totalDiveEntries = users.reduce((sum, u) => sum + (u.entryCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ocean-deep">{t("admin.title")}</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center">
          <p className="text-3xl font-bold text-ocean-deep">{users.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total users</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-ocean-deep">{adminCount}</p>
          <p className="text-sm text-gray-600 mt-1">Admins</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-ocean-deep">{totalDiveEntries}</p>
          <p className="text-sm text-gray-600 mt-1">Total dives</p>
        </div>
        <Link href="/stats" className="card text-center hover:shadow-md transition-shadow">
          <p className="text-3xl mb-1">📊</p>
          <p className="text-sm text-gray-600">View stats</p>
        </Link>
      </div>

      {/* User list */}
      <div className="card">
        <h2 className="section-title">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 font-medium">
                <th className="text-start py-2">Name / Email</th>
                <th className="text-start py-2">Role</th>
                <th className="text-start py-2">Dives</th>
                <th className="text-start py-2">Joined</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isCurrentUser = u.email === (session?.user as any)?.email;
                const isRootUser = u.email === ROOT_EMAIL;
                return (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4">
                      <p className="font-medium">{u.fullName || u.email}</p>
                      {u.fullName && <p className="text-gray-500 text-xs">{u.email}</p>}
                      {isRootUser && <span className="text-xs text-ocean-teal">👑 root</span>}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        u.role === "admin" ? "bg-ocean-deep text-white" : "bg-gray-100 text-gray-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{u.entryCount ?? 0}</td>
                    <td className="py-2 pr-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/entries?userId=${u.id}`}
                          className="text-ocean-teal text-xs hover:underline"
                        >
                          Dives
                        </Link>
                        {!isRootUser && isRoot && (
                          <>
                            <button
                              onClick={() => toggleRole(u)}
                              disabled={togglingId === u.id}
                              className="text-xs text-gray-500 hover:text-ocean-deep disabled:opacity-50"
                            >
                              {togglingId === u.id ? "..." : u.role === "admin" ? "Demote" : "Make admin"}
                            </button>
                            {!isCurrentUser && (
                              <button
                                onClick={() => deleteUser(u)}
                                disabled={deletingId === u.id}
                                className="text-xs text-coral hover:opacity-70 disabled:opacity-50"
                              >
                                {deletingId === u.id ? "..." : "Delete"}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Config */}
      <div className="card space-y-4">
        <h2 className="section-title">{t("admin.editConfig")}</h2>
        <div>
          <label className="label">{t("admin.whatsapp")}</label>
          <input
            type="url"
            value={whatsappInput}
            onChange={(e) => setWhatsappInput(e.target.value)}
            className="input"
            placeholder="https://chat.whatsapp.com/..."
          />
        </div>
        <div>
          <label className="label">Admin Emails (comma-separated)</label>
          <input
            type="text"
            value={adminEmailsInput}
            onChange={(e) => setAdminEmailsInput(e.target.value)}
            className="input"
            placeholder="admin@example.com, other@example.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Users whose email is in this list get admin role on next login. <strong>{ROOT_EMAIL}</strong> is always included.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSaveConfig} disabled={saving} className="btn btn-primary">
            {saving ? "..." : t("admin.saveConfig")}
          </button>
          {saved && <span className="text-green-600 text-sm">{t("admin.configSaved")}</span>}
        </div>
      </div>
    </div>
  );
}
