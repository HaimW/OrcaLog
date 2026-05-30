"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useTheme, THEMES } from "@/i18n/ThemeProvider";
import { Palette, Languages, LogOut, ChevronDown, Check } from "lucide-react";

function WaveIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
  );
}

export function Header() {
  const { t, lang, setLang } = useLanguage();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const user = session?.user as any;
  const [themeOpen, setThemeOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="text-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          href="/entries"
          className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
            <WaveIcon size={18} />
          </div>
          <span>{t("app.name")}</span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Theme switcher */}
          <div className="relative">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="p-2 rounded-xl hover:bg-white/12 transition-all duration-150 active:scale-90"
              title="Theme"
              aria-label="Change theme"
            >
              <Palette size={18} />
            </button>

            {themeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} />
                <div
                  className="absolute end-0 top-full mt-2 rounded-2xl shadow-2xl border py-2 z-50 min-w-[180px] animate-slide-down"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                    color: "var(--text)",
                  }}
                >
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => { setTheme(th.id); setThemeOpen(false); }}
                      className="w-full text-start px-4 py-2.5 text-sm flex items-center gap-3 transition-colors hover:opacity-80"
                      style={{ fontWeight: theme === th.id ? 600 : 400 }}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{
                          backgroundColor: th.swatch,
                          outline: theme === th.id ? `2px solid ${th.swatch}` : "2px solid transparent",
                          outlineOffset: "2px",
                        }}
                      />
                      <span>{th.label}</span>
                      {theme === th.id && (
                        <Check size={14} className="ms-auto text-ocean-teal" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "he" ? "en" : "he")}
            className="p-2 rounded-xl hover:bg-white/12 transition-all duration-150 active:scale-90"
            aria-label="Toggle language"
          >
            <Languages size={18} />
          </button>

          {user && (
            <>
              {/* User avatar */}
              <div
                className="hidden sm:flex w-8 h-8 rounded-xl bg-white/20 items-center justify-center text-xs font-bold tracking-wide ms-1"
                title={user.name || user.email}
              >
                {initials}
              </div>

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 rounded-xl hover:bg-white/12 transition-all duration-150 active:scale-90"
                title={t("auth.logout")}
                aria-label={t("auth.logout")}
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
