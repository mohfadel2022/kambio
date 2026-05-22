import { TrendingUp, Plus, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { format } from "date-fns";
import { DataTableActions } from "@/components/DataTableActions";
import { deleteExchange, getExchangesPageData } from "@/app/actions/exchange";
import { revalidatePath } from "next/cache";

export default async function ExchangesPage() {
  const exchanges = await getExchangesPageData();
  const t = await getTranslations("Exchange");
  const common = await getTranslations("Common");

  async function handleDelete(id: string) {
    "use server";
    await deleteExchange(id);
    revalidatePath("/dashboard/exchanges");
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={TrendingUp}
        action={{ label: t("newExchange") || "Nuevo Cambio", href: "/dashboard/exchanges/new", icon: Plus }}
      />

      <div className="card-rounded border border-border bg-card overflow-hidden card-shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{common("date")}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{common("wallet")}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("fromCurrency")}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"></th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("toCurrency")}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("rate")}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">{common("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {exchanges.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-medium italic">
                  {common("noData")}
                </td>
              </tr>
            ) : (
              exchanges.map((ex: any) => (
                <tr key={ex.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                     <p className="text-sm font-bold">{format(new Date(ex.date || ex.createdAt), "dd/MM/yyyy")}</p>
                     <p className="text-[10px] font-medium text-muted-foreground">{format(new Date(ex.createdAt), "HH:mm")}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black">{ex.wallet.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center font-black text-xs">
                        {ex.currencyFrom.symbol}
                      </span>
                      <div>
                        <p className="text-sm font-black">-{ex.amountFrom}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{ex.currencyFrom.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-30" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xs">
                        {ex.currencyTo.symbol}
                      </span>
                      <div>
                        <p className="text-sm font-black text-emerald-600">+{ex.amountTo}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{ex.currencyTo.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="px-3 py-1 card-rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black inline-block">
                      1 {ex.currencyFrom.code} = {ex.rate} {ex.currencyTo.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DataTableActions 
                      id={ex.id} 
                      baseUrl="/dashboard/exchanges" 
                      actions={["view", "edit", "delete"]}
                      onDelete={handleDelete}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
