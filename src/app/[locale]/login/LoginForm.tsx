"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("Login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalidCredentials"));
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div 
          className="p-5 rounded-2xl text-xs font-bold uppercase tracking-wide animate-shake"
          style={{ 
            background: "rgba(239, 68, 68, 0.05)", 
            color: "hsl(var(--destructive))",
            border: "1px solid rgba(239, 68, 68, 0.1)"
          }}
        >
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 px-2" style={{ color: "hsl(var(--muted-foreground))" }}>
            {t("emailLabel")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] px-6 py-4.5 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:opacity-30"
            placeholder="admin@kambio.com"
          />
        </div>

        <div className="space-y-2.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 px-2" style={{ color: "hsl(var(--muted-foreground))" }}>
            {t("passwordLabel")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] px-6 py-4.5 pr-14 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:opacity-30"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-2"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 rounded-[1.25rem] text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-xl shadow-emerald-500/20 mt-2"
        style={{
          background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))",
        }}
      >
        {loading ? t("signingIn") : t("signInButton")}
      </button>
    </form>
  );
}
