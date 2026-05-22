import { getExchange } from "@/app/actions/exchange";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TrendingUp, ArrowRight, Wallet, Calendar, User, Hash } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { format } from "date-fns";

export default async function ExchangeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("Exchange");
  const common = await getTranslations("Common");

  const exchange = await getExchange(id);

  if (!exchange) {
    notFound();
  }

  const data = exchange as any;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title={t("detailsTitle") || "Detalles del Intercambio"}
        subtitle={`ID: ${id}`}
        icon={TrendingUp}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="card-rounded border border-border bg-card p-8 card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* From */}
              <div className="text-center md:text-left space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("fromCurrency")}</p>
                <p className="text-4xl font-black">{data.amountFrom} <span className="text-sm text-muted-foreground">{data.currencyFrom?.code || ""}</span></p>
              </div>

              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-border">
                <ArrowRight className="w-6 h-6 text-emerald-600" />
              </div>

              {/* To */}
              <div className="text-center md:text-right space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">{t("toCurrency")}</p>
                <p className="text-4xl font-black text-emerald-600">{data.amountTo} <span className="text-sm text-emerald-600/60">{data.currencyTo?.code || ""}</span></p>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-dashed border-border flex flex-wrap gap-12 justify-center md:justify-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("rate")}</p>
                <p className="text-sm font-bold">1 {data.currencyFrom?.code || ""} = {data.rate} {data.currencyTo?.code || ""}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-rounded border border-border bg-card p-6 card-shadow space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-2">Información Operativa</h3>
            
            <div className="space-y-4">
              <InfoRow icon={Wallet} label={common("wallet")} value={data.wallet?.name || "N/A"} />
              <InfoRow icon={Calendar} label={t("date")} value={format(new Date(data.date || data.createdAt), "dd/MM/yyyy HH:mm")} />
              <InfoRow icon={User} label="Operador" value={data.user?.name || data.user?.email || "N/A"} />
              <InfoRow icon={Hash} label="ID" value={data.id} isCode />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, isCode }: { icon: any, label: string, value: string, isCode?: boolean }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={`text-sm font-bold ${isCode ? "font-mono text-xs opacity-70" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
