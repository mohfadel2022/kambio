import { Coins, TrendingUp, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CurrencyTable } from "./CurrencyTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrenciesPageData } from "@/app/actions/currencies";

export default async function CurrenciesPage() {
  const t = await getTranslations("Currencies");
  const common = await getTranslations("Common");

  const currencies = await getCurrenciesPageData();

  const translations = {
    code: t("code"),
    name: t("name"),
    symbol: t("symbol"),
    rateUnder500: t("rateUnder500"),
    rate500To1000: t("rate500To1000"),
    rateOver1000: t("rateOver1000"),
    actions: common("actions"),
    searchPlaceholder: t("searchPlaceholder") || "Filter by code...",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle")}
        icon={Coins}
        action={{ label: t("newCurrency"), href: "/dashboard/currencies/new", icon: Plus }}
      />

      <div className="card-rounded p-8 bg-card border border-slate-200 dark:border-slate-800 card-shadow flex items-center gap-6">
        <div className="w-16 h-16 card-rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <TrendingUp className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight">Tasas Escalonadas</h2>
          <p className="text-sm text-muted-foreground font-medium">
            Las tasas se aplican automáticamente según el monto del envío:
            <span className="mx-2 font-bold text-foreground">≤ 500</span> |
            <span className="mx-2 font-bold text-foreground">501 - 999</span> |
            <span className="mx-2 font-bold text-foreground">≥ 1000</span>
          </p>
        </div>
      </div>

      <CurrencyTable data={currencies as any} translations={translations} />
    </div>
  );
}
