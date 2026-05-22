import { Link } from "@/i18n/routing";
import { Plus, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ClientTable } from "./ClientTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { getClientsPageData } from "@/app/actions/clients";

export default async function ClientsPage() {
  const t = await getTranslations("Clients");
  const common = await getTranslations("Common");

  const clients = await getClientsPageData();

  const translations = {
    firstName: t("firstName"),
    lastName: t("lastName"),
    documentId: t("documentId"),
    phone: t("phone"),
    email: t("email"),
    actions: common("actions"),
    searchPlaceholder: t("searchPlaceholder") || "Filter by first name...",
    hasDocument: t("hasDocument"),
    noDocument: t("noDocument"),
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle")}
        icon={Users}
        action={{ label: t("newClient"), href: "/dashboard/clients/new", icon: Plus }}
      />

      {clients.length === 0 ? (
        <div className="card-rounded border border-slate-200 dark:border-slate-800 bg-card p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-bold mb-1">No clients found</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Get started by creating your first client.
          </p>
          <Link
            href="/dashboard/clients/new"
            className="flex items-center gap-2 px-6 py-3 card-rounded text-sm font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("newClient")}
          </Link>
        </div>
      ) : (
        <ClientTable data={clients} translations={translations} />
      )}
    </div>
  );
}
