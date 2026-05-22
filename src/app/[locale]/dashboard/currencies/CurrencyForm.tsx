"use client";

import { useActionState } from "react";
import { createCurrency, updateCurrency, type CurrencyState } from "@/app/actions/currencies";
import { ArrowRight, Loader2, Coins, Hash, Type, Star, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type CurrencyData = {
  id?: string;
  code: string;
  name: string;
  symbol: string;
  isPrimary: boolean;
  rateUnder500: number;
  rate500To1000: number;
  rateOver1000: number;
  buyRate: number;
  sellRate: number;
};

const initialState: CurrencyState = {};

function Field({ label, name, error, children }: { label: string; name: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-[10px] font-black uppercase tracking-[0.2em] px-2 text-muted-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] font-bold px-2 text-destructive animate-shake">
          {error.join(", ")}
        </p>
      )}
    </div>
  );
}

const inputClass = "w-full px-6 py-4 card-rounded text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 placeholder:opacity-30";

export default function CurrencyForm({ initialData }: { initialData?: CurrencyData }) {
  const isEditing = !!initialData?.id;
  const t = useTranslations("Currencies");
  const common = useTranslations("Common");

  const actionFunction = isEditing
    ? updateCurrency.bind(null, initialData.id!)
    : createCurrency;

  const [state, action, pending] = useActionState(actionFunction, initialState);

  return (
    <form action={action} className="max-w-4xl mx-auto pb-20 w-full animate-in fade-in duration-700">
      <div className="card-rounded p-8 md:p-12 space-y-12 card-shadow bg-card border border-border">
        
        {state.message && (
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-6 py-4 card-rounded animate-shake card-shadow border border-destructive/10 text-destructive bg-destructive/5">
            {state.message}
          </div>
        )}

        {/* Basic Info Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t("basicInfo")}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <Field label={t("code") || "Código (USD/EUR)"} name="code" error={state.errors?.code}>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                <input name="code" type="text" defaultValue={initialData?.code || ""} className={`${inputClass} pl-12 uppercase`} placeholder="USD" required />
              </div>
            </Field>

            <Field label={t("name") || "Nombre"} name="name" error={state.errors?.name}>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                <input name="name" type="text" defaultValue={initialData?.name || ""} className={`${inputClass} pl-12`} placeholder="Dólar Estadounidense" required />
              </div>
            </Field>

            <Field label={t("symbol") || "Símbolo"} name="symbol" error={state.errors?.symbol}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold opacity-20">$</span>
                <input name="symbol" type="text" defaultValue={initialData?.symbol || ""} className={`${inputClass} pl-12`} placeholder="$" required />
              </div>
            </Field>
          </div>

          <div className="flex items-center gap-4 px-2 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
             <input 
               type="checkbox" 
               id="isPrimary" 
               name="isPrimary" 
               defaultChecked={initialData?.isPrimary}
               className="w-5 h-5 accent-emerald-600 cursor-pointer"
             />
             <label htmlFor="isPrimary" className="text-sm font-bold cursor-pointer select-none">
                {t("isPrimary") || "Establecer como moneda principal (Base)"}
             </label>
             <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
        </div>

        {/* Exchange Rates Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <ArrowRight className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t("rateTiers")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <Field label={t("rateUnder500") || "Hasta 500"} name="rateUnder500" error={state.errors?.rateUnder500}>
               <input name="rateUnder500" type="number" step="0.000001" defaultValue={initialData?.rateUnder500 || 1.0} className={inputClass} required />
            </Field>

            <Field label={t("rate500To1000") || "De 500 a 1000"} name="rate500To1000" error={state.errors?.rate500To1000}>
               <input name="rate500To1000" type="number" step="0.000001" defaultValue={initialData?.rate500To1000 || 1.0} className={inputClass} required />
            </Field>

            <Field label={t("rateOver1000") || "Más de 1000"} name="rateOver1000" error={state.errors?.rateOver1000}>
               <input name="rateOver1000" type="number" step="0.000001" defaultValue={initialData?.rateOver1000 || 1.0} className={inputClass} required />
            </Field>
          </div>
        </div>

        {/* OTC Rates Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t("otcRates") || "Tasas Compra/Venta (OTC)"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Field label={t("buyRate") || "Tasa de Compra"} name="buyRate" error={state.errors?.buyRate}>
               <input name="buyRate" type="number" step="0.000001" defaultValue={initialData?.buyRate || 1.0} className={inputClass} required />
            </Field>

            <Field label={t("sellRate") || "Tasa de Venta"} name="sellRate" error={state.errors?.sellRate}>
               <input name="sellRate" type="number" step="0.000001" defaultValue={initialData?.sellRate || 1.0} className={inputClass} required />
            </Field>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col sm:flex-row items-center gap-4 border-border">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 w-full flex items-center justify-center gap-3 py-5 card-rounded text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-emerald-500/20"
            style={{ background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))" }}
          >
            {pending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {common("loading")}</>
            ) : (
              <>{isEditing ? common("save") : common("create")} <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
          <Link
            href="/dashboard/currencies"
            className="w-full sm:w-auto text-center px-10 py-5 card-rounded text-sm font-black transition-all bg-secondary text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-border"
          >
            {common("cancel")}
          </Link>
        </div>
      </div>
    </form>
  );
}
