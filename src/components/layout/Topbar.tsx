"use client";

import { signOut } from "next-auth/react";
import { LogOut, Bell, User as UserIcon, Menu } from "lucide-react";
import type { User } from "next-auth";
import { useTranslations, useLocale } from "next-intl";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "@/i18n/routing";
import { Languages } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

export default function Topbar({ user }: { user?: User }) {
  const t = useTranslations("Common");
  const { toggleSidebar } = useSidebar();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === "ar" ? "es" : "ar";
    router.replace(pathname as any, { locale: nextLocale });
  };

  return (
    <header
      className="h-20 flex items-center justify-between px-6 flex-shrink-0 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md"
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
           <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-10 h-10 card-rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5 opacity-60" />
          </Button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block" />
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-50" style={{ color: "hsl(var(--muted-foreground))" }}>
              {t("welcomeBack")}
            </h2>
            <p className="font-black text-lg tracking-tight">
              {user?.name ?? user?.email ?? "User"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        <button
          onClick={toggleLocale}
          className="relative w-11 h-11 card-rounded flex items-center justify-center transition-all hover:scale-105 active:scale-95 card-shadow border border-slate-200 dark:border-slate-800 bg-card"
          title={locale === "ar" ? "Español" : "العربية"}
        >
          <Languages className="w-5 h-5 opacity-60" />
        </button>
        
        <button
          id="topbar-notifications-btn"
          className="relative w-11 h-11 card-rounded flex items-center justify-center transition-all hover:scale-105 active:scale-95 card-shadow border border-slate-200 dark:border-slate-800 bg-card"
        >
          <Bell className="w-5 h-5 opacity-60" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800 ml-1">
          <div className="w-11 h-11 card-rounded flex items-center justify-center card-shadow font-black ring-4 ring-emerald-500/5" style={{ background: "hsl(var(--primary))", color: "white" }}>
             <UserIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
