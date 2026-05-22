"use client";

import { useState, useTransition } from "react";
import { updatePermissions } from "@/app/actions/roles";
import { Check, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type Permission = {
  module: string;
  action: string;
};

type Props = {
  roleId: string;
  initialPermissions: Permission[];
  modules: { id: string; label: string }[];
  actions: { id: string; label: string }[];
};

export function PermissionMatrix({ roleId, initialPermissions, modules, actions }: Props) {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [isPending, startTransition] = useTransition();

  const togglePermission = (module: string, action: string) => {
    const exists = permissions.find(p => p.module === module && p.action === action);
    if (exists) {
      setPermissions(permissions.filter(p => !(p.module === module && p.action === action)));
    } else {
      setPermissions([...permissions, { module, action }]);
    }
  };

  const isChecked = (module: string, action: string) => {
    // If role has "all" for this module, it's considered checked for everything
    if (permissions.find(p => p.module === module && p.action === "all")) return true;
    return !!permissions.find(p => p.module === module && p.action === action);
  };

  const onSave = () => {
    startTransition(async () => {
      await updatePermissions(roleId, permissions);
      alert("Permisos actualizados con éxito");
    });
  };

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50">
              <th className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-slate-100 dark:border-slate-800">Módulo</th>
              {actions.map(action => (
                <th key={action.id} className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground text-center border-b border-slate-100 dark:border-slate-800">
                  {action.label}
                </th>
              ))}
              <th className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground text-center border-b border-slate-100 dark:border-slate-800">
                Todo
              </th>
            </tr>
          </thead>
          <tbody>
            {modules.map(module => (
              <tr key={module.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{module.label}</span>
                </td>
                {actions.map(action => (
                  <td key={action.id} className="p-6 text-center border-b border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => togglePermission(module.id, action.id)}
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200",
                        isChecked(module.id, action.id)
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110"
                          : "bg-slate-100 dark:bg-slate-800 text-transparent hover:bg-slate-200"
                      )}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </td>
                ))}
                <td className="p-6 text-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                  <button
                    onClick={() => togglePermission(module.id, "all")}
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 mx-auto",
                      isChecked(module.id, "all")
                        ? "bg-slate-800 text-white scale-110"
                        : "bg-slate-100 dark:bg-slate-800 text-transparent hover:bg-slate-200"
                    )}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onSave}
          disabled={isPending}
          className="flex items-center gap-2 px-8 py-4 card-rounded text-sm font-black text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))" }}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
