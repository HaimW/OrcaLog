"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Eye, EyeOff, Mail, Lock, Waves } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError(t("auth.invalidCredentials"));
    } else {
      router.push("/entries");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ocean gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, #030f18 0%, #071e2e 40%, #0B4F6C 75%, #1B98A6 100%)",
        }}
      />

      {/* Decorative circles */}
      <div className="absolute -top-32 -end-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #1B98A6, transparent 70%)" }} />
      <div className="absolute -bottom-48 -start-48 w-[32rem] h-[32rem] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0B4F6C, transparent 70%)" }} />

      {/* Wave SVG at bottom */}
      <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: 80 }}>
        <path d="M0,64 C240,110 480,20 720,64 C960,108 1200,24 1440,64 L1440,120 L0,120 Z" fill="rgba(255,255,255,0.04)" />
      </svg>

      {/* Glass card */}
      <div
        className="relative w-full max-w-sm rounded-3xl p-8 z-10"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-3">
            <Waves size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OrcaLog</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{t("auth.loginTitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.4)" }} />
            <input
              type="email"
              required
              placeholder={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full ps-10 pe-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
              }}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.4)" }} />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full ps-10 pe-11 py-3 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 p-0.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-center py-2 px-3 rounded-xl" style={{ background: "rgba(255,107,107,0.15)", color: "#ff8a80" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-60"
            style={{
              background: loading ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.92)",
              color: "#0B4F6C",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-ocean-deep border-t-transparent rounded-full animate-spin" />
                {t("auth.loginBtn")}
              </span>
            ) : t("auth.loginBtn")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-semibold underline underline-offset-2" style={{ color: "rgba(255,255,255,0.85)" }}>
            {t("auth.registerBtn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
