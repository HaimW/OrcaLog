"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageProvider";

export function Header() {
  const { t, lang, setLang } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header className="bg-ocean-deep text-white shadow-md sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/entries" className="text-xl font-bold">
          🌊 {t("app.name")}
        </Link>

        <div className="flex items-center gap-2">
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
