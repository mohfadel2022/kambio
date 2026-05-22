import CurrencyForm from "../CurrencyForm";
import { getTranslations } from "next-intl/server";
import { Coins } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function NewCurrencyPage() {
  const t = await getTranslations("Currencies");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("newCurrency")}
        subtitle={t("subtitle")}
        icon={Coins}
      />
      <CurrencyForm />
    </div>
  );
}
