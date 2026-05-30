"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useLanguage } from "@/i18n/LanguageProvider";
import OfflineIndicator from "./OfflineIndicator";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg)" }}>
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: "var(--color-ocean-deep)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        </svg>
      </div>
      <div
        className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--color-ocean-teal)", borderTopColor: "transparent" }}
      />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") return <LoadingScreen />;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
        {t("auth.loginRequired")}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <OfflineIndicator />
      <BottomNav />
    </div>
  );
}
