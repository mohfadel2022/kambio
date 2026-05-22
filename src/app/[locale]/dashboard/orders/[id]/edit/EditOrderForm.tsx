"use client";

import { useActionState, useState, useEffect } from "react";
import { updateOrder, type UpdateOrderState } from "@/app/actions/orders";
import { ArrowRight, ArrowLeftRight, Loader2, User, Calculator, FileText, CheckCircle2, Calendar, Hash, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { OrderStatusBar } from "../OrderStatusBar";

import { SearchableSelect } from "@/components/SearchableSelect";
import { useRouter } from "@/i18n/routing";

type Client = { id: string; name: string };
type Currency = { id: string; code: string; symbol: string; name: string };
type OrderData = {
  id: string;
  number: string;
  senderName: string;
  recipientName: string;
  amountFrom: number;
  currencyFromId: string;
  amountTo: number;
  currencyToId: string;
  rate: number;
  status: string;
  notes: string | null;
  createdAt: Date;
};

const initialState: UpdateOrderState = {};

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

export function EditOrderForm({ 
  currencies, 
  order, 
  clients,
  walletsForPayment,
  translations
}: { 
  currencies: Currency[], 
  order: OrderData, 
  clients: Client[],
  walletsForPayment?: any[],
  translations?: any
}) {
  const router = useRouter();
  const updateOrderWithId = updateOrder.bind(null, order.id);
  const [state, action, pending] = useActionState(updateOrderWithId, initialState);
  
  const [amountFrom, setAmountFrom] = useState(order.amountFrom.toString());
  const [rate, setRate] = useState(order.rate.toString());
  const [amountTo, setAmountTo] = useState(order.amountTo.toString());
  const [currencyFrom, setCurrencyFrom] = useState(order.currencyFromId);
  const [currencyTo, setCurrencyTo] = useState(order.currencyToId);
  
  const [senderName, setSenderName] = useState(order.senderName);
  const [recipientName, setRecipientName] = useState(order.recipientName);
  
  const t = useTranslations("NewOrder");
  const tOrders = useTranslations("Orders");
  const common = useTranslations("Common");
  const dash = useTranslations("Dashboard");

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
    const r = parseFloat(rate);
    if (!isNaN(r) && r > 0) {
      setRate((1 / r).toFixed(6));
    }
  };

  const fromCurrency = currencies.find((c) => c.id === currencyFrom);
  const toCurrency = currencies.find((c) => c.id === currencyTo);

  return (
    <form action={action} className="max-w-[1600px] mx-auto pb-20 w-full animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* Main Column (Left) */}
        <div className="flex-1 w-full space-y-8">
          
          {/* Status Section */}
          <div className="card-rounded p-8 md:p-10 card-shadow bg-card border border-slate-200 dark:border-slate-800 space-y-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-black tracking-tight">{tOrders("orderStatus")}</h2>
            </div>
            
            <OrderStatusBar 
              orderId={order.id} 
              currentStatus={order.status as any} 
              showActions={true}
              availableWallets={walletsForPayment}
              currencyToSymbol={toCurrency?.symbol || ""}
              amountTo={Number(amountTo) || 0}
              translations={translations || {
                statusMap: {
                  pending: dash("pending"),
                  verified: dash("verified"),
                  paid: dash("paid"),
                  cancelled: dash("cancelled"),
                },
                orderStatus: tOrders("orderStatus"),
                changeStatus: tOrders("changeStatus"),
                markVerified: tOrders("markVerified"),
                markPaid: tOrders("markPaid"),
                cancelOrder: tOrders("cancelOrder"),
                reactivate: tOrders("reactivate"),
                orderCancelled: tOrders("orderCancelled"),
                orderCancelledDesc: tOrders("orderCancelledDesc"),
              }}
            />
            <input type="hidden" name="status" value={order.status} />
          </div>

          {/* Financial Details */}
          <div className="card-rounded p-8 md:p-10 card-shadow bg-card border border-slate-200 dark:border-slate-800 space-y-10">
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-black tracking-tight">{t("details")}</h2>
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

            <div className="w-full rounded-[2rem] p-6 sm:p-8 bg-emerald-500/5 border border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                <TrendingUp className="w-5 h-5 shrink-0" />
                <span className="font-black uppercase text-[10px] sm:text-xs tracking-widest">{t("exchangeRate")}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 bg-white dark:bg-slate-950 px-4 sm:px-6 py-3 rounded-2xl shadow-sm border border-emerald-500/10 w-full sm:w-auto justify-center">
                 <span className="font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 whitespace-nowrap">1 {fromCurrency?.code} =</span>
                 <input
                   type="number"
                   name="rate"
                   step="0.000001"
                   value={rate}
                   onChange={(e) => setRate(e.target.value)}
                   className="w-24 sm:w-32 bg-transparent border-b-2 border-emerald-500/20 font-black text-lg sm:text-xl text-emerald-700 dark:text-emerald-400 text-center outline-none focus:border-emerald-500 transition-colors"
                 />
                 <span className="font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{toCurrency?.code}</span>
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
               <textarea name="notes" rows={2} defaultValue={order.notes ?? ""} className={`${inputClass} resize-none`} />
             </Field>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="w-full xl:w-[420px] space-y-8 shrink-0">
          
          {/* Order Identity Card */}
          <div className="card-rounded p-8 card-shadow bg-slate-900 text-white space-y-6 border border-white/5">
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Referencia</p>
                  <h3 className="text-2xl font-black tracking-tight text-emerald-400">#{order.number}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Hash className="w-6 h-6 opacity-30" />
                </div>
             </div>
             <div className="flex items-center gap-4 py-4 border-t border-white/10">
                <Calendar className="w-4 h-4 opacity-30" />
                <div className="text-sm font-bold opacity-60">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
             </div>
          </div>

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

          {/* Submit Actions */}
          <div className="card-rounded p-8 card-shadow bg-card border border-slate-200 dark:border-slate-800 space-y-4">
            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-emerald-500/20"
              style={{ background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))" }}
            >
              {pending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> {common("loading")}</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> <span>{common("save")}</span></>
              )}
            </button>
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="w-full flex items-center justify-center py-5 rounded-2xl text-sm font-black transition-all bg-secondary text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {common("cancel")}
            </Link>
          </div>

        </div>

      </div>
    </form>
  );
}
