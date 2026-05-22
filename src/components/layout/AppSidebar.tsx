"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  Settings,
  TrendingUp,
  LogOut,
  ChevronRight,
  Sparkles,
  Users,
  Shield,
  Coins
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { Separator } from "@/components/ui/separator";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const { state } = useSidebar();
  const { data: session } = useSession();
  const user = session?.user as any;
  const permissions = user?.permissions || [];
  const userRole = user?.role?.toLowerCase();

  const hasPermission = (module: string, action: string = "view") => {
    // Si es admin, tiene permiso total
    if (userRole === "admin") return true;
    
    return permissions.some((p: any) => 
      p.module === module && (p.action === action || p.action === "all")
    );
  };

  const mainItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard, module: "dashboard" },
    { href: "/dashboard/orders", label: t("orders"), icon: ArrowLeftRight, module: "orders" },
    { href: "/dashboard/clients", label: t("clients") || "Clientes", icon: Users, module: "clients" },
    { href: "/dashboard/exchanges", label: t("exchanges") || "Compra/Venta", icon: TrendingUp, module: "exchanges" },
    { href: "/dashboard/wallets", label: t("wallets") || "Wallets", icon: Wallet, module: "wallets" },
    { href: "/dashboard/users", label: t("users") || "Users", icon: Users, module: "users" },
    { href: "/dashboard/roles", label: "Roles", icon: Shield, module: "roles" },
  ].filter(item => item.module === "dashboard" || hasPermission(item.module));

  const toolsItems = [
    { href: "/dashboard/reports", label: t("reports"), icon: BarChart3, module: "reports" },
    { href: "/dashboard/currencies", label: t("currencies") || "Currencies", icon: Coins, module: "currencies" },
  ].filter(item => hasPermission(item.module));

  return (
    <Sidebar collapsible="icon" side={locale === 'ar' ? 'right' : 'left'} {...props} className="border-e border-slate-100 dark:border-slate-800 z-40">
      <SidebarHeader className="h-20 flex flex-row items-center px-4 md:px-6 gap-3 transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 md:group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:gap-0">
        <div
          className="w-10 h-10 card-rounded flex items-center justify-center card-shadow shrink-0 transition-transform hover:rotate-3"
          style={{ background: "hsl(var(--primary))" }}
        >
          <svg className="w-5 h-5 text-white" fill="none" strokeWidth={3} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
        <div className="flex flex-col transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:invisible overflow-hidden whitespace-nowrap">
          <span className="font-black text-xl tracking-tighter text-green-800 dark:text-white leading-none">Kambio</span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Platform</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 gap-0">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:opacity-100">
            {state === "expanded" ? (t("mainMenu") || "Main Menu") : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      className={`h-12 px-4 card-rounded transition-all duration-300 ${
                        isActive 
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold" 
                          : "hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:bg-emerald-500/10"
                      }`}
                      render={
                        <Link href={item.href as any} className="flex items-center gap-4 w-full h-full">
                          <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "opacity-50"}`} />
                          <span className="transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:invisible overflow-hidden whitespace-nowrap">
                            {item.label}
                          </span>
                          {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-40 transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:invisible" />}
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:opacity-100">
            {state === "expanded" ? (t("tools") || "Analytics & Tools") : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      className={`h-12 px-4 card-rounded transition-all duration-300 ${
                        isActive 
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold" 
                          : "hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:bg-emerald-500/10"
                      }`}
                      render={
                        <Link href={item.href as any} className="flex items-center gap-4 w-full h-full">
                          <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "opacity-50"}`} />
                          <span className="transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:invisible overflow-hidden whitespace-nowrap">
                            {item.label}
                          </span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pro Banner Replacement (Hidden) */}
        {/* <div className="mt-auto p-4 transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:invisible overflow-hidden">
           ...
        </div> */}
      </SidebarContent>

      <SidebarFooter className="p-4 gap-2">
        <Separator className="opacity-50 mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push('/dashboard/settings' as any)}
              className="w-full h-10 justify-start px-4 gap-3 font-bold card-rounded hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:bg-emerald-500/10 transition-colors"
            >
              <Settings className="w-4 h-4 opacity-60" />
              <span className="transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:invisible overflow-hidden whitespace-nowrap">
                {t("settings")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                await signOut({ redirect: false });
                router.push('/login' as any);
              }}
              className="w-full h-10 justify-start px-4 gap-3 font-bold card-rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4 opacity-60" />
              <span className="transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:invisible overflow-hidden whitespace-nowrap">
                {tCommon("signOut")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="flex items-center justify-between px-2 mt-2 transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:invisible overflow-hidden">
          <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">Kambio v0.1.0</p>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
