"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, Save, MapPin, Globe, Phone, Mail, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateCompanySettings } from "@/app/actions/settings";

export function CompanySettingsForm({ initialData }: { initialData: any }) {
  const t = useTranslations("Settings");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updateCompanySettings(formData);
      if (result.success) {
        toast.success(t("success"));
      } else {
        toast.error(result.error || "Error");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t("companyName")}
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <Input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="pl-12 h-14 card-rounded bg-slate-50/50 border-slate-200 dark:border-slate-800 dark:bg-slate-900/50"
                required
              />
            </div>
          </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t("phone")}
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <Input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="pl-12 h-14 card-rounded bg-slate-50/50 border-slate-200 dark:border-slate-800 dark:bg-slate-900/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t("email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <Input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-12 h-14 card-rounded bg-slate-50/50 border-slate-200 dark:border-slate-800 dark:bg-slate-900/50"
              />
            </div>
          </div>
        </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t("address")}
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <Input 
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="pl-12 h-14 card-rounded bg-slate-50/50 border-slate-200 dark:border-slate-800 dark:bg-slate-900/50"
              />
            </div>
          </div>
        </div>


        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t("website")}
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <Input 
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="pl-12 h-14 card-rounded bg-slate-50/50 border-slate-200 dark:border-slate-800 dark:bg-slate-900/50"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t("logo")} URL
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <Input 
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                className="pl-12 h-14 card-rounded bg-slate-50/50 border-slate-200 dark:border-slate-800 dark:bg-slate-900/50"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button 
          type="submit" 
          disabled={loading}
          className="h-14 px-10 card-rounded font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20"
          style={{ background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))" }}
        >
          {loading ? "..." : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {t("saveChanges")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
