import { Shield, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RoleTable } from "@/app/[locale]/dashboard/roles/RoleTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { getRolesPageData } from "@/app/actions/roles";

export default async function RolesPage() {
  const common = await getTranslations("Common");
  const t = await getTranslations("Roles");

  const roles = await getRolesPageData();

  const translations = {
    name: t("roleName"),
    users: t("moduleNames.users"),
    actions: common("actions"),
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle")}
        icon={Shield}
        action={{ label: t("new"), href: "/dashboard/roles/new", icon: Plus }}
      />

      <div className="card-rounded p-8 bg-card border border-slate-200 dark:border-slate-800 card-shadow flex items-center gap-6">
        <div className="w-16 h-16 card-rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <Shield className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight">{t("security")}</h2>
          <p className="text-sm text-muted-foreground font-medium">
            {t("description")}
          </p>
        </div>
      </div>

      <RoleTable data={roles as any} translations={translations} />
    </div>
  );
}
