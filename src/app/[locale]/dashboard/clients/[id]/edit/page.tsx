import { notFound } from "next/navigation";
import ClientForm from "../../ClientForm";
import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getClientForEdit } from "@/app/actions/clients";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations("Clients");

  const client = await getClientForEdit(resolvedParams.id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("editTitle")}
        subtitle={t("editSubtitle")}
        icon={Users}
      />
      <ClientForm initialData={client} />
    </div>
  );
}
