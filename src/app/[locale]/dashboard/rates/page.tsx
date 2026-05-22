import { getTranslations } from "next-intl/server";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrenciesPageData } from "@/app/actions/currencies";

export default async function RatesPage() {
  const currencies = await getCurrenciesPageData();
  const t = await getTranslations("Rates");

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle")}
        icon={TrendingUp}
      />

      <div
        className="card-rounded p-10 card-shadow"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currencies.map((c: any) => (
            <div
              key={c.id}
              className="group flex items-center gap-5 p-6 card-rounded transition-all hover:scale-[1.02] card-shadow"
              style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
            >
              <div
                className="w-14 h-14 card-rounded flex items-center justify-center font-black text-lg card-shadow transition-transform group-hover:rotate-6"
                style={{ background: "white", color: "hsl(var(--primary))", border: "1px solid hsl(var(--border))" }}
              >
                {c.symbol}
              </div>
              <div>
                <p className="font-black text-lg tracking-tight">{c.code}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{c.name}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-8 card-rounded bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center text-center gap-4">
           <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center card-shadow border border-slate-100">
             <TrendingUp className="w-6 h-6 text-slate-300" />
           </div>
           <p className="text-xs font-bold text-slate-400 max-w-[300px]">
             {t("comingSoonHint")}
           </p>
        </div>
      </div>
    </div>
  );
}
