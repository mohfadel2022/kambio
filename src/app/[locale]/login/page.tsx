import LoginForm from "./LoginForm";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
  const t = await getTranslations("Login");

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "hsl(var(--background))",
      }}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[120px]" style={{ background: "hsl(var(--primary))" }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[120px]" style={{ background: "hsl(var(--primary))" }} />

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center mb-12">
          <div
            className="w-20 h-20 card-rounded mx-auto mb-8 flex items-center justify-center shadow-2xl"
            style={{
              background: "linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 70%, 45%))",
              boxShadow: "0 20px 40px -10px hsla(142, 76%, 36%, 0.3)",
            }}
          >
            <svg className="w-10 h-10 text-white" fill="none" strokeWidth={2.5} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-3" style={{ color: "hsl(var(--foreground))" }}>
            {t("title")}
          </h1>
          <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-60" style={{ color: "hsl(var(--muted-foreground))" }}>
            {t("subtitle")}
          </p>
        </div>

        <div
          className="card-rounded p-10 card-shadow"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <LoginForm />
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs font-bold tracking-wide opacity-40 uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
            {t("devHint")}
          </p>
        </div>
      </div>
    </main>
  );
}
