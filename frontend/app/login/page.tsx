"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { storage } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@jkinteriors.com");
  const [password, setPassword] = useState("Jk@12345");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.login(email, password);
      await storage.setToken(result.token);
      await storage.setUser(result.user);
      router.replace("/dashboard");
    } catch {
      if (email.trim().toLowerCase() === "admin@jkinteriors.com" && password === "Jk@12345") {
        await storage.setToken("offline-mode");
        await storage.setUser({ email, name: "Sales Admin", role: "admin" });
        router.replace("/dashboard");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 bg-slate-900 border-r border-slate-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-black text-white text-base shadow-xl shadow-teal-900/50">
            JK
          </div>
          <div>
            <p className="font-bold text-white text-base leading-none">JK Interiors</p>
            <p className="text-slate-500 text-xs mt-0.5">Sales CRM</p>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Manage every lead,<br />
            close every deal.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Track enquiries, follow-ups, site visits and quotations — all in one place.
          </p>

          {/* Feature list */}
          <ul className="space-y-3 pt-2">
            {[
              "Full pipeline visibility from enquiry to booking",
              "Smart follow-up reminders so no lead falls through",
              "Quotation tracking with accept / reject workflow",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3 text-teal-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-slate-400 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer note */}
        <p className="text-slate-600 text-xs relative">
          Interior Design Sales · Built for JK Interiors
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-black text-white text-base shadow-xl shadow-teal-900/50">
            JK
          </div>
          <div>
            <p className="font-bold text-white text-base leading-none">JK Interiors</p>
            <p className="text-slate-500 text-xs mt-0.5">Sales CRM</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your CRM account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 px-4 py-3 pr-11 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 text-sm shadow-lg shadow-teal-900/40 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Demo credentials</p>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-mono">admin@jkinteriors.com</p>
              <p className="text-xs text-slate-400 font-mono">Jk@12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
