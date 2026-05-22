"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Plus, Trash2, Building, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createBranch, deleteBranch } from "@/app/actions/settings";

export function BranchSettings({ initialBranches }: { initialBranches: any[] }) {
  const t = useTranslations("Settings");
  const [branches, setBranches] = useState(initialBranches);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newManager, setNewManager] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setLoading(true);
    try {
      const result = await createBranch({ 
        name: newName, 
        address: newAddress, 
        phone: newPhone,
        manager: newManager
      });
      if (result.success) {
        setBranches([...branches, result.branch]);
        setNewName("");
        setNewAddress("");
        setNewPhone("");
        setNewManager("");
        toast.success(t("success"));
      }
    } catch (error) {
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro?")) return;
    try {
      const result = await deleteBranch(id);
      if (result.success) {
        setBranches(branches.filter(b => b.id !== id));
        toast.success("Eliminado");
      }
    } catch (error) {
      toast.error("Error");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <form onSubmit={handleAdd} className="p-8 card-rounded border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Plus className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("newBranch")}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t("branchName")}
            </label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <Input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="pl-12 h-14 card-rounded bg-background border-slate-200 dark:border-slate-800"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t("managerName")}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <Input 
                value={newManager}
                onChange={(e) => setNewManager(e.target.value)}
                className="pl-12 h-14 card-rounded bg-background border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t("address")}
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <Input 
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="pl-12 h-14 card-rounded bg-background border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t("phone")}
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <Input 
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="pl-12 h-14 card-rounded bg-background border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={loading || !newName}
          className="h-12 px-8 card-rounded font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {loading ? "..." : t("newBranch")}
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.length === 0 && (
          <p className="col-span-full text-center py-10 opacity-40 font-bold italic">{t("noBranches")}</p>
        )}
        {branches.map((branch) => (
          <div key={branch.id} className="p-6 card-rounded border border-slate-200 dark:border-slate-800 card-shadow bg-card group relative transition-all hover:border-emerald-500/30">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-black text-lg">{branch.name}</h4>
                </div>
                <div className="space-y-1">
                  {branch.manager && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                      <User className="w-3 h-3 opacity-70" />
                      <span>{branch.manager}</span>
                    </div>
                  )}
                  {branch.address && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 opacity-50" />
                      <span>{branch.address}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3 opacity-50" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(branch.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 card-rounded transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
