"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("auth.invalidCredentials"));
    } else {
      router.push("/entries");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-ocean-light to-white">
      <div className="w-full max-w-md card">
        <h1 className="text-2xl font-bold text-ocean-deep mb-2">OrcaLog</h1>
        <p className="text-gray-600 mb-6">{t("auth.loginTitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          {error && <div className="text-coral text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "..." : t("auth.loginBtn")}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="text-ocean-teal hover:underline">
            {t("auth.registerBtn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
