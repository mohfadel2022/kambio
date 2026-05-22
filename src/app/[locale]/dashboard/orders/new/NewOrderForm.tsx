"use client";

import { useActionState, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createOrder, type CreateOrderState } from "@/app/actions/orders";
import { ArrowRight, ArrowLeftRight, Loader2, User, FileText, TrendingUp, DollarSign, Plus } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { SearchableSelect } from "@/components/SearchableSelect";

type Client = { id: string; name: string };

type Currency = { 
  id: string; 
  code: string; 
  symbol: string; 
  name: string;
  isPrimary: boolean;
  rateUnder500: any;
  rate500To1000: any;
  rateOver1000: any;
};

const initialState: CreateOrderState = {};

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 w-full">
      <label
        htmlFor={name}
        className="block text-[10px] font-black uppercase tracking-[0.2em] px-2 text-muted-foreground"
      >
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

const inputClass =
  "w-full px-6 py-4 rounded-2xl text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 placeholder:opacity-30";

function OrderFormContent({ currencies, clients: initialClients }: { currencies: Currency[], clients: Client[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledSender = searchParams.get("senderName") || "";
  
  const [state, action, pending] = useActionState(createOrder, initialState);
  const [amountFrom, setAmountFrom] = useState("");
  const [rate, setRate] = useState("");
  const [amountTo, setAmountTo] = useState("");
  const [currencyFrom, setCurrencyFrom] = useState(currencies.find((c) => c.code === "EUR")?.id ?? currencies[0]?.id ?? "");
  const [currencyTo, setCurrencyTo] = useState(currencies.find(c => c.code === "DZD")?.id ?? currencies.find(c => c.code === "USD")?.id ?? currencies[1]?.id ?? "");
  
  const [senderName, setSenderName] = useState(prefilledSender);
  const [recipientName, setRecipientName] = useState("");
  const [clients, setClients] = useState(initialClients);
  
  const t = useTranslations("NewOrder");
  const common = useTranslations("Common");

  const fromCurr = currencies.find((c) => c.id === currencyFrom);
  const toCurr = currencies.find((c) => c.id === currencyTo);

  useEffect(() => {
    if (!fromCurr || !toCurr) return;

    const amount = parseFloat(amountFrom) || 0;
    let selectedRate = 1;

    if (fromCurr.isPrimary && !toCurr.isPrimary) {
      if (amount <= 500) selectedRate = Number(toCurr.rateUnder500);
      else if (amount < 1000) selectedRate = Number(toCurr.rate500To1000);
      else selectedRate = Number(toCurr.rateOver1000);
      setRate(selectedRate.toString());
    } else if (!fromCurr.isPrimary && toCurr.isPrimary) {
      if (amount <= 500) selectedRate = 1 / Number(fromCurr.rateUnder500);
      else if (amount < 1000) selectedRate = 1 / Number(fromCurr.rate500To1000);
      else selectedRate = 1 / Number(fromCurr.rateOver1000);
      setRate(selectedRate.toFixed(6));
    }
  }, [amountFrom, currencyFrom, currencyTo, fromCurr, toCurr]);

  useEffect(() => {
    const a = parseFloat(amountFrom);
    const r = parseFloat(rate);
    if (!isNaN(a) && !isNaN(r) && r > 0) {
      setAmountTo((a * r).toFixed(2));
    }
  }, [amountFrom, rate]);

  const handleSwapCurrencies = () => {
    setCurrencyFrom(currencyTo);
    setCurrencyTo(currencyFrom);
  };

  return (
    <form action={action} className="max-w-[1600px] mx-auto pb-20 w-full animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Section (Left) */}
        <div className="flex-1 w-full space-y-8">
          {state.message && (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-6 py-4 rounded-2xl animate-shake card-shadow border border-destructive/10 text-destructive bg-destructive/5">
              {state.message}
            </div>
          )}

          {/* Currency Exchange Card */}
          <div className="card-rounded p-8 md:p-10 space-y-10 card-shadow bg-card border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-black tracking-tight">{t("currencyExchange")}</h2>
            </div>

            <div className="flex flex-col gap-6 items-stretch max-w-xl mx-auto w-full">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">{t("youSend")}</label>
                <div className="flex card-rounded overflow-hidden border border-slate-200 dark:border-slate-800 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all bg-slate-50 dark:bg-slate-900">
                  <input 
                     type="number"
                     name="amountFrom"
                     step="0.01"
                     className="w-full px-6 py-5 bg-transparent font-black text-2xl outline-none"
                     value={amountFrom}
                     onChange={(e) => setAmountFrom(e.target.value)}
                  />
                  <select
                     name="currencyFromId"
                     className="appearance-none px-6 py-5 bg-slate-100 dark:bg-slate-800 font-bold outline-none cursor-pointer min-w-[120px] text-center border-l border-slate-200 dark:border-slate-800"
                     value={currencyFrom}
                     onChange={(e) => setCurrencyFrom(e.target.value)}
                  >
                     {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-center -my-3 relative z-10">
                <div className="bg-white dark:bg-slate-950 p-2 card-rounded border border-slate-200 dark:border-slate-800 shadow-sm">
                  <ArrowLeftRight className="w-5 h-5 text-emerald-500 rotate-90" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">{t("recipientGets")}</label>
                <div className="flex card-rounded overflow-hidden border border-slate-200 dark:border-slate-800 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all bg-slate-50 dark:bg-slate-900">
                  <input 
                     type="number"
                     name="amountTo"
                     step="0.01"
                     className="w-full px-6 py-5 bg-transparent font-black text-2xl outline-none"
                     value={amountTo}
                     onChange={(e) => setAmountTo(e.target.value)}
                  />
                  <select
                     name="currencyToId"
                     className="appearance-none px-6 py-5 bg-slate-100 dark:bg-slate-800 font-bold outline-none cursor-pointer min-w-[120px] text-center border-l border-slate-200 dark:border-slate-800"
                     value={currencyTo}
                     onChange={(e) => setCurrencyTo(e.target.value)}
                  >
                     {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="w-full card-rounded p-6 sm:p-8 bg-emerald-500/5 border border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                <TrendingUp className="w-5 h-5 shrink-0" />
                <span className="font-black uppercase text-[10px] sm:text-xs tracking-widest">{t("exchangeRate")}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 bg-white dark:bg-slate-950 px-4 sm:px-6 py-3 rounded-2xl shadow-sm border border-emerald-500/10 w-full sm:w-auto justify-center">
                 <span className="font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 whitespace-nowrap">1 {fromCurr?.code} =</span>
                 <input
                   type="number"
                   name="rate"
                   step="0.000001"
                   value={rate}
                   onChange={(e) => setRate(e.target.value)}
                   className="w-24 sm:w-32 bg-transparent border-b-2 border-emerald-500/20 font-black text-lg sm:text-xl text-emerald-700 dark:text-emerald-400 text-center outline-none focus:border-emerald-500 transition-colors"
                 />
                 <span className="font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{toCurr?.code}</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="card-rounded p-8 md:p-10 card-shadow bg-card border border-slate-200 dark:border-slate-800 space-y-6">
             <div className="flex items-center gap-3">
               <FileText className="w-5 h-5 text-blue-600" />
               <h2 className="text-lg font-black tracking-tight">{t("notes")}</h2>
             </div>
             <Field label={t("notes")} name="notes">
               <textarea name="notes" rows={2} placeholder={t("notesPlaceholder")} className={`${inputClass} resize-none`} />
             </Field>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="w-full lg:w-[400px] xl:w-[450px] space-y-8 shrink-0">
          
          {/* Sender Details */}
          <div className="card-rounded p-8 card-shadow bg-card border border-slate-200 dark:border-slate-800 space-y-8">
             <div className="flex items-center gap-3">
               <User className="w-5 h-5 text-emerald-600" />
               <h2 className="text-lg font-black tracking-tight">{t("senderDetails")}</h2>
             </div>
             <Field label={t("senderName")} name="senderName" error={state.errors?.senderName}>
               <SearchableSelect 
                 name="senderName"
                 options={clients}
                 value={senderName}
                 onChange={setSenderName}
                 placeholder={t("senderPlaceholder")}
                 onAddNew={() => router.push("/dashboard/clients/new")}
               />
             </Field>
          </div>

          {/* Recipient Details */}
          <div className="card-rounded p-8 card-shadow bg-card border border-slate-200 dark:border-slate-800 space-y-8">
             <div className="flex items-center gap-3">
               <User className="w-5 h-5 text-blue-600" />
               <h2 className="text-lg font-black tracking-tight">{t("recipientDetails")}</h2>
             </div>
             <Field label={t("recipientName")} name="recipientName" error={state.errors?.recipientName}>
               <SearchableSelect 
                 name="recipientName"
                 options={clients}
                 value={recipientName}
                 onChange={setRecipientName}
                 placeholder={t("recipientPlaceholder")}
                 onAddNew={() => router.push("/dashboard/clients/new")}
               />
             </Field>
          </div>

          {/* Form Actions */}
          <div className="card-rounded p-8 card-shadow bg-card border border-slate-200 dark:border-slate-800 space-y-4">
             <button
                type="submit"
                disabled={pending}
                className="w-full flex items-center justify-center gap-3 py-6 card-rounded text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-emerald-500/20"
                style={{ background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))" }}
              >
                {pending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {t("creating")}</>
                ) : (
                  <><ArrowRight className="w-5 h-5" /> <span>{t("createButton")}</span></>
                )}
              </button>
              <Link
                href="/dashboard/orders"
                className="w-full flex items-center justify-center py-6 card-rounded text-sm font-black transition-all bg-secondary text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {common("cancel")}
              </Link>
          </div>
        </div>

      </div>
    </form>
  );
}

export default function NewOrderForm(props: { currencies: Currency[], clients: Client[] }) {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold opacity-50">...</div>}>
      <OrderFormContent {...props} />
    </Suspense>
  );
}

