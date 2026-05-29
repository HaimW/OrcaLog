"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { ThemeProvider } from "@/i18n/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
