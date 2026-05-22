import { notFound } from "next/navigation";
import CurrencyForm from "../../CurrencyForm";
import { getTranslations } from "next-intl/server";
import { Coins } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrencyForEdit } from "@/app/actions/currencies";

export default async function EditCurrencyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations("Currencies");

  const currency = await getCurrencyForEdit(resolvedParams.id);

  if (!currency) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("editTitle") || "Editar Moneda"}
        subtitle={t("subtitle")}
        icon={Coins}
      />
      <CurrencyForm initialData={currency} />
    </div>
  );
}
