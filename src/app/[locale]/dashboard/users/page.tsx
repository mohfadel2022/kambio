import { Users, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { UserTable } from "./UserTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { getUsersPageData } from "@/app/actions/users";

export default async function UsersPage() {
  const t = await getTranslations("Users");
  const common = await getTranslations("Common");

  const { users, roles } = await getUsersPageData();

  const translations = {
    name: t("name"),
    email: t("email"),
    role: t("role"),
    actions: common("actions"),
    searchPlaceholder: t("searchPlaceholder") || "Filter by email...",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle")}
        icon={Users}
        action={{ label: t("newUser"), href: "/dashboard/users/new", icon: Plus }}
      />

      <UserTable data={users as any} translations={translations} roles={roles} />
    </div>
  );
}
