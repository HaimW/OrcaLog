"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { BookOpen, PlusCircle, BarChart2, Trophy, Settings } from "lucide-react";

const NAV_ICONS = {
  entries: BookOpen,
  add: PlusCircle,
  stats: BarChart2,
  leaderboard: Trophy,
  admin: Settings,
};

export function BottomNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const items = [
    { href: "/entries",     label: t("nav.entries"),     icon: NAV_ICONS.entries },
    { href: "/entries/new", label: t("nav.add"),         icon: NAV_ICONS.add },
    { href: "/stats",       label: t("nav.stats"),       icon: NAV_ICONS.stats },
    { href: "/leaderboard", label: t("nav.leaderboard"), icon: NAV_ICONS.leaderboard },
  ] as const;

  const allItems = isAdmin
    ? [...items, { href: "/admin" as const, label: t("nav.admin"), icon: NAV_ICONS.admin }]
    : [...items];

  function isActive(href: string) {
    if (href === "/entries") return pathname === "/entries" || (pathname.startsWith("/entries/") && pathname !== "/entries/new");
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20"
      style={{
        backgroundColor: "var(--card-bg)",
        borderTop: "1px solid var(--card-border)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <div className="max-w-6xl mx-auto flex justify-around items-stretch px-1">
        {allItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative group transition-all duration-150"
            >
              <div
                className="flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200"
                style={active ? {
                  backgroundColor: "var(--color-ocean-teal)",
                  color: "#fff",
                  transform: "scale(1.05)",
                } : {
                  color: "var(--text-muted)",
                }}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span
                className="text-[10px] font-medium transition-colors duration-150 leading-tight"
                style={{ color: active ? "var(--color-ocean-teal)" : "var(--text-muted)" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
