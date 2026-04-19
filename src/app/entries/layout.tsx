import { AppShell } from "@/components/layout/AppShell";

export default function EntriesLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
