import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { ProfessionalRoleEditor } from "./ProfessionalRoleEditor";
import { getRoleDetailsPageData } from "@/app/actions/roles";

export default async function RoleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("Roles");

  const data = await getRoleDetailsPageData(id);

  if (!data || !data.role) {
    notFound();
  }

  const { role, allRoles } = data;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between px-2">
        <Link
          href="/dashboard/roles"
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:-translate-x-1" />
          {t("back")}
        </Link>
      </div>

      <ProfessionalRoleEditor 
        role={role as any}
        allRoles={allRoles}
        initialPermissions={role.permissions.map((p: any) => ({ module: p.module, action: p.action }))}
      />
    </div>
  );
}
