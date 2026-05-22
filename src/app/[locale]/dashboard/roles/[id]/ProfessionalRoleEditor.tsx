"use client";

import { useState, useTransition, useEffect } from "react";
import { Shield, ShieldCheck, Save, Plus, ChevronRight, Search, Filter, Info, Trash2, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updatePermissions } from "@/app/actions/roles";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";

import { useTranslations } from "next-intl";

type Permission = { module: string; action: string; };
type Module = { id: string; label: string; description: string; totalActions: number; };

interface Props {
  role: { id: string; name: string; description: string | null; };
  allRoles: { id: string; name: string; }[];
  initialPermissions: Permission[];
}

export function ProfessionalRoleEditor({ role, allRoles, initialPermissions }: Props) {
  const t = useTranslations("Roles");
  const [mounted, setMounted] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [activeModule, setActiveModule] = useState<string>("orders");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-[600px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const modules: Module[] = [
    { id: "dashboard", label: t("moduleNames.dashboard"), description: t("moduleNames.dashboardDesc"), totalActions: 4 },
    { id: "orders", label: t("moduleNames.orders"), description: t("moduleNames.ordersDesc"), totalActions: 4 },
    { id: "clients", label: t("moduleNames.clients"), description: t("moduleNames.clientsDesc"), totalActions: 4 },
    { id: "wallets", label: t("moduleNames.wallets"), description: t("moduleNames.walletsDesc"), totalActions: 4 },
    { id: "currencies", label: t("moduleNames.currencies"), description: t("moduleNames.currenciesDesc"), totalActions: 4 },
    { id: "users", label: t("moduleNames.users"), description: t("moduleNames.usersDesc"), totalActions: 4 },
    { id: "roles", label: t("moduleNames.roles"), description: t("moduleNames.rolesDesc"), totalActions: 4 },
    { id: "reports", label: t("moduleNames.reports"), description: t("moduleNames.reportsDesc"), totalActions: 4 },
  ];

  const actions = [
    { id: "view", label: t("actionLabels.view"), desc: t("actionLabels.viewDesc") },
    { id: "create", label: t("actionLabels.create"), desc: t("actionLabels.createDesc") },
    { id: "edit", label: t("actionLabels.edit"), desc: t("actionLabels.editDesc") },
    { id: "delete", label: t("actionLabels.delete"), desc: t("actionLabels.deleteDesc") },
    { id: "all", label: t("actionLabels.all"), desc: t("actionLabels.allDesc") },
  ];

  const togglePermission = (module: string, action: string) => {
    if (action === "all") {
      const hasAll = permissions.some(p => p.module === module && p.action === "all");
      if (hasAll) {
        // Remove all for this module
        setPermissions(permissions.filter(p => p.module !== module));
      } else {
        // Remove all specific and add 'all'
        const otherModules = permissions.filter(p => p.module !== module);
        setPermissions([...otherModules, { module, action: "all" }]);
      }
      return;
    }

    // For specific actions
    const hasAll = permissions.some(p => p.module === module && p.action === "all");
    const hasSpecific = permissions.some(p => p.module === module && p.action === action);

    if (hasAll) {
      // If we had 'all', and we click a specific one, we remove 'all' and add the others except this one
      const availableActions = ["view", "create", "edit", "delete"];
      const otherActions = availableActions.filter(a => a !== action);
      const otherModules = permissions.filter(p => p.module !== module);
      const newPerms = otherActions.map(a => ({ module, action: a }));
      setPermissions([...otherModules, ...newPerms]);
    } else {
      if (hasSpecific) {
        setPermissions(permissions.filter(p => !(p.module === module && p.action === action)));
      } else {
        const availableActions = ["view", "create", "edit", "delete"];
        const currentModulePerms = permissions.filter(p => p.module === module);
        const nextPerms = [...currentModulePerms, { module, action }];
        
        if (availableActions.every(a => nextPerms.some(p => p.action === a))) {
          // All specific actions are now selected -> Upgrade to 'all'
          const otherModules = permissions.filter(p => p.module !== module);
          setPermissions([...otherModules, { module, action: "all" }]);
        } else {
          setPermissions([...permissions, { module, action }]);
        }
      }
    }
  };

  const isChecked = (module: string, action: string) => {
    const hasSpecific = !!permissions.find(p => p.module === module && p.action === action);
    const hasAll = !!permissions.find(p => p.module === module && p.action === "all");
    return hasSpecific || hasAll;
  };

  const getGrantedCount = (moduleId: string) => {
    const perms = permissions.filter(p => p.module === moduleId);
    if (perms.some(p => p.action === "all")) return 4;
    return perms.length;
  };

  const onUpdate = () => {
    startTransition(async () => {
      await updatePermissions(role.id, permissions);
      toast.success(t("editor.success"));
    });
  };

  const allAction = actions.find(a => a.id === "all");
  const specificActions = actions.filter(a => a.id !== "all");

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      
      {/* Header: Profile Selector */}
      <div className="card-rounded p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4 card-shadow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">{t("editor.title")}</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("editor.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-black px-3 opacity-50 uppercase whitespace-nowrap">{t("editor.userProfile")}:</span>
          <select 
            className="bg-transparent border-none text-sm font-black focus:ring-0 outline-none pr-8 cursor-pointer capitalize"
            value={role.id}
            onChange={(e) => router.push(`/dashboard/roles/${e.target.value}`)}
          >
            {allRoles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Groups List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 card-rounded border border-slate-200 dark:border-slate-800 overflow-hidden card-shadow">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("editor.groups")}</h3>
            </div>
            <div className="p-2 space-y-1">
              {modules.map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left",
                    activeModule === m.id 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-black">{m.label}</span>
                    <span className={cn("text-[10px] font-medium", activeModule === m.id ? "text-white/70" : "text-muted-foreground")}>
                      ({m.totalActions}/{getGrantedCount(m.id)})
                    </span>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 transition-transform", activeModule === m.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100")} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Capabilities Grid */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 card-rounded border border-slate-200 dark:border-slate-800 card-shadow min-h-[550px]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Filter className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-base font-black">{t("editor.skillsIn")}: <span className="text-emerald-600">{modules.find(m => m.id === activeModule)?.label}</span></h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t("editor.activateFor")} {role.name}</p>
                </div>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder={t("editor.quickFilter")} 
                  className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 transition-all w-32 focus:w-48"
                />
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Control Total - Distinct Design */}
              {allAction && (
                <button
                  onClick={() => togglePermission(activeModule, allAction.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-6 rounded-[2rem] border-2 transition-all duration-500 text-left relative overflow-hidden group",
                    isChecked(activeModule, allAction.id)
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-500/30 scale-[1.02]"
                      : "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:border-emerald-500/40"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    isChecked(activeModule, allAction.id)
                      ? "bg-white text-emerald-600 border-white"
                      : "border-emerald-500/30"
                  )}>
                    {isChecked(activeModule, allAction.id) && <Plus className="w-4 h-4 rotate-45 scale-125" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-base font-black uppercase tracking-tight">{allAction.label}</span>
                    <span className={cn("text-xs font-medium opacity-70", isChecked(activeModule, allAction.id) ? "text-white" : "text-emerald-600/80")}>
                      {allAction.desc}
                    </span>
                  </div>
                  {isChecked(activeModule, allAction.id) && (
                    <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 opacity-20 rotate-12" />
                  )}
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specificActions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => togglePermission(activeModule, action.id)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-2xl border-2 transition-all duration-300 text-left group",
                      isChecked(activeModule, action.id)
                        ? "bg-emerald-500/5 border-emerald-500/50 shadow-sm"
                        : "bg-slate-50/50 dark:bg-slate-800/30 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                      isChecked(activeModule, action.id)
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    )}>
                      {isChecked(activeModule, action.id) && <Plus className="w-3 h-3 rotate-45 scale-125" />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={cn("text-sm font-black", isChecked(activeModule, action.id) ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300")}>
                        {action.label}
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground leading-tight">
                        {action.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-12 p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 flex gap-4">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-amber-800 dark:text-amber-400 leading-relaxed">
                  <strong>{t("editor.note")}:</strong> {t("editor.noteText")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 card-rounded border border-slate-200 dark:border-slate-800 card-shadow p-4 space-y-3">
            <button
              onClick={onUpdate}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
              {t("editor.update")}
            </button>
            <div className="grid grid-cols-1 gap-2">
              <button className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Plus className="w-4 h-4 text-emerald-500" />
                {t("editor.addProfile")}
              </button>
              <button className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Edit3 className="w-4 h-4 text-blue-500" />
                {t("editor.renameProfile")}
              </button>
              <button className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Plus className="w-4 h-4 text-amber-500" />
                {t("editor.addCapacity")}
              </button>
            </div>
          </div>

          <div className="p-6 card-rounded bg-gradient-to-br from-slate-800 to-slate-900 text-white card-shadow relative overflow-hidden">
             <Shield className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
             <h4 className="text-sm font-black mb-2">{t("editor.summary")}</h4>
             <div className="space-y-3 relative z-10">
               <div>
                 <p className="text-[10px] uppercase font-black text-white/50 tracking-widest">{t("editor.name")}</p>
                 <p className="text-xs font-bold capitalize">{role.name}</p>
               </div>
               <div>
                 <p className="text-[10px] uppercase font-black text-white/50 tracking-widest">{t("editor.totalPermissions")}</p>
                 <p className="text-lg font-black">{modules.reduce((acc, m) => acc + getGrantedCount(m.id), 0)}</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", props.className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
