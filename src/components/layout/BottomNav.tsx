"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";

export function BottomNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const items = [
    { href: "/entries", label: t("nav.entries"), icon: "📋" },
    { href: "/entries/new", label: t("nav.add"), icon: "➕" },
    { href: "/stats", label: t("nav.stats"), icon: "📊" },
    { href: "/leaderboard", label: t("nav.leaderboard"), icon: "🏆" },
  ];
  if (isAdmin) {
    items.push({ href: "/admin", label: t("nav.admin"), icon: "⚙️" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-around items-stretch">
        {items.map((item) => {
          const active = pathname === item.href || (item.href === "/entries" && pathname.startsWith("/entries/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 ${
                active ? "text-ocean-teal" : "text-gray-600"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
