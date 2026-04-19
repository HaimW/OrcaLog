"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error === "Email already registered" ? t("auth.emailExists") : t("auth.registrationFailed"));
      setLoading(false);
      return;
    }

    // Auto-login
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.ok) {
      router.push("/entries");
      router.refresh();
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-ocean-light to-white">
      <div className="w-full max-w-md card">
        <h1 className="text-2xl font-bold text-ocean-deep mb-2">OrcaLog</h1>
        <p className="text-gray-600 mb-6">{t("auth.registerTitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t("auth.fullName")}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t("auth.email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t("auth.password")}</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          {error && <div className="text-coral text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "..." : t("auth.registerBtn")}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          {t("auth.hasAccount")}{" "}
          <Link href="/login" className="text-ocean-teal hover:underline">
            {t("auth.loginBtn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
