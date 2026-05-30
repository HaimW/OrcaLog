"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useLanguage } from "@/i18n/LanguageProvider";
import OfflineIndicator from "./OfflineIndicator";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">{t("auth.loginRequired")}</div>;
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
