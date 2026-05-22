import RoleForm from "../RoleForm";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";

import { useTranslations } from "next-intl";

export default function NewRolePage() {
  const t = useTranslations("Roles");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between px-2">
        <Link
          href="/dashboard/roles"
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:-translate-x-1" />
          {t("back")}
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-bold">{t("new")}</h1>
        </div>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          {t("description")}
        </p>
      </div>
      <RoleForm />
    </div>
  );
}
