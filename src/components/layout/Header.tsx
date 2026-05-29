"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useTheme, THEMES } from "@/i18n/ThemeProvider";

export function Header() {
  const { t, lang, setLang } = useLanguage();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const user = session?.user as any;
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <header className="bg-ocean-deep text-white shadow-md sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/entries" className="text-xl font-bold">
          🌊 {t("app.name")}
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <div className="relative">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="px-2 py-1 text-sm border border-white/30 rounded hover:bg-white/10"
              title="Theme"
            >
              🎨
            </button>
            {themeOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setThemeOpen(false)}
                />
                <div
                  className="absolute end-0 top-full mt-1 rounded-lg shadow-lg border py-1 z-50 min-w-[170px]"
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
                      className="w-full text-start px-3 py-2 text-sm flex items-center gap-2 hover:opacity-80"
                      style={theme === th.id ? { fontWeight: 600 } : {}}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block shrink-0 border border-gray-300"
                        style={{ backgroundColor: th.swatch }}
                      />
                      {th.label}
                      {theme === th.id && <span className="ms-auto">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setLang(lang === "he" ? "en" : "he")}
            className="px-2 py-1 text-sm border border-white/30 rounded hover:bg-white/10"
          >
            {t("nav.langToggle")}
          </button>
          {user && (
            <>
              <span className="text-sm hidden sm:inline">{user.name || user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm px-2 py-1 border border-white/30 rounded hover:bg-white/10"
              >
                {t("auth.logout")}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
