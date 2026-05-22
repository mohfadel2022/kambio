import ExchangeForm from "../ExchangeForm";
import { getTranslations } from "next-intl/server";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getExchangeNewFormData } from "@/app/actions/exchange";

export default async function NewExchangePage() {
  const t = await getTranslations("Exchange");
  const { wallets, currencies } = await getExchangeNewFormData();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("newExchange") || "Nuevo Cambio"}
        subtitle={t("subtitle") || "Realiza un intercambio de divisas"}
        icon={TrendingUp}
      />

      <ExchangeForm
        wallets={wallets}
        currencies={currencies}
      />
    </div>
  );
}
