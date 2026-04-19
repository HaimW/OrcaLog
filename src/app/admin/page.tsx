"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const [whatsappInput, setWhatsappInput] = useState("");
  const [adminEmailsInput, setAdminEmailsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !isAdmin)) {
      router.push("/entries");
    }
  }, [status, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/config").then((r) => r.json()).then((c: any) => {
      setWhatsappInput(c.whatsappGroupLink || "");
      setAdminEmailsInput((c.adminEmails || []).join(", "));
    });
    fetch("/api/users").then((r) => r.json()).then(setUsers).catch(() => {});
  }, [isAdmin]);

  async function handleSaveConfig() {
    setSaving(true);
    setSaved(false);
    const adminEmails = adminEmailsInput.split(",").map((e) => e.trim()).filter(Boolean);
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminEmails, whatsappGroupLink: whatsappInput }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ocean-deep">{t("admin.title")}</h1>

      {/* Shortcut cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link href="/entries" className="card text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-3xl mb-2">📋</div>
          <p className="font-medium">{t("admin.viewEntries")}</p>
        </Link>
        <Link href="/stats" className="card text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-3xl mb-2">📊</div>
          <p className="font-medium">{t("admin.viewStats")}</p>
        </Link>
        <div className="card text-center">
          <div className="text-3xl mb-2">👥</div>
          <p className="font-medium">{users.length} users</p>
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
            Users with these emails will get admin role on next login.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSaveConfig} disabled={saving} className="btn btn-primary">
            {saving ? "..." : t("admin.saveConfig")}
          </button>
          {saved && <span className="text-green-600 text-sm">{t("admin.configSaved")}</span>}
        </div>
      </div>

      {/* User list */}
      {users.length > 0 && (
        <div className="card">
          <h2 className="section-title">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-start py-2 font-medium text-gray-600">Name / Email</th>
                  <th className="text-start py-2 font-medium text-gray-600">Role</th>
                  <th className="text-start py-2 font-medium text-gray-600">Joined</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2">
                      <p className="font-medium">{u.fullName || u.email}</p>
                      {u.fullName && <p className="text-gray-500 text-xs">{u.email}</p>}
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        u.role === "admin" ? "bg-ocean-deep text-white" : "bg-gray-100"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <Link
                        href={`/entries?userId=${u.id}`}
                        className="text-ocean-teal text-xs hover:underline"
                      >
                        {t("admin.viewEntries")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
