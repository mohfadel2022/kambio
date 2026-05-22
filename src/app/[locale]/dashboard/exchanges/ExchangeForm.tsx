"use client";

import { useState, useTransition, useEffect } from "react";
import { TrendingUp, ArrowRight, Loader2, Wallet, Coins, Building, Calendar, ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { performExchange, updateExchange } from "@/app/actions/exchange";

export default function ExchangeForm({ wallets, currencies, initialData }: { wallets: any[], currencies: any[], initialData?: any }) {
  const t = useTranslations("Exchange");
  const common = useTranslations("Common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [walletId, setWalletId] = useState(initialData?.walletId || wallets[0]?.id || "");
  const [fromCurrencyId, setFromCurrencyId] = useState(() => {
    return initialData?.currencyFromId || currencies.find(c => c.code === "EUR")?.id || currencies[0]?.id || "";
  });
  const [toCurrencyId, setToCurrencyId] = useState(() => {
    return initialData?.currencyToId || currencies.find(c => c.code === "DZD")?.id || currencies[1]?.id || "";
  });
  const [amountFrom, setAmountFrom] = useState<string>(initialData?.amountFrom?.toString() || "");
  const [amountTo, setAmountTo] = useState<string>(initialData?.amountTo?.toString() || "");
  const [rate, setRate] = useState<number>(initialData?.rate ? Number(initialData.rate) : 1);
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
  
  const isEditing = !!initialData?.id;

  const fromCurrency = currencies.find(c => c.id === fromCurrencyId);
  const toCurrency = currencies.find(c => c.id === toCurrencyId);
  const selectedWallet = wallets.find(w => w.id === walletId);

  // Auto-calculate rate and destination amount
  useEffect(() => {
    const from = currencies.find(c => c.id === fromCurrencyId);
    const to = currencies.find(c => c.id === toCurrencyId);
    if (!from || !to) return;

    let calculatedRate = 1;

    if (from.isPrimary && !to.isPrimary) {
      // Platform SELLS Foreign (EUR -> DZD)
      // Use to.sellRate directly (e.g. 250 DZD per 1 EUR)
      calculatedRate = Number(to.sellRate || 1);
    } else if (!from.isPrimary && to.isPrimary) {
      // Platform BUYS Foreign (DZD -> EUR)
      // Use 1 / from.buyRate (e.g. 1 / 240 = 0.00416 EUR per 1 DZD)
      calculatedRate = 1 / Number(from.buyRate || 1);
    } else if (!from.isPrimary && !to.isPrimary) {
      // Foreign to Foreign (DZD -> MRU) via EUR
      // (1) Sell DZD for EUR (1 / buyRate)
      // (2) Use EUR to buy MRU (sellRate)
      calculatedRate = (1 / Number(from.buyRate || 1)) * Number(to.sellRate || 1);
    }

    const finalRate = Number(calculatedRate.toFixed(6));
    setRate(finalRate);
    
    if (amountFrom && !isNaN(Number(amountFrom))) {
      setAmountTo((Number(amountFrom) * finalRate).toFixed(2));
    } else {
      setAmountTo("");
    }
  }, [fromCurrencyId, toCurrencyId, amountFrom, currencies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fromCurrencyId === toCurrencyId) {
      setError(t("errorCurrencySame"));
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          walletId,
          fromCurrencyId,
          toCurrencyId,
          amountFrom: Number(amountFrom),
          amountTo: Number(amountTo),
          rate,
          date,
        };

        const result = isEditing 
          ? await updateExchange(initialData.id, payload)
          : await performExchange(payload);

        if (result.success) {
          router.push("/dashboard/exchanges");
          router.refresh();
        }
      } catch (err: any) {
        if (err.message.includes("Insufficient funds")) {
          setError(t("insufficientFunds"));
        } else {
          setError(t("errorFailed"));
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="card-rounded p-8 md:p-12 space-y-10 card-shadow bg-card border border-border">
        
        {error && (
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-6 py-4 card-rounded animate-shake border border-destructive/10 text-destructive bg-destructive/5">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block px-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("wallet")}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"><Building className="w-4 h-4" /></span>
              <select 
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full pl-10 pr-6 py-4 card-rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block px-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("date")}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"><Calendar className="w-4 h-4" /></span>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-6 py-4 card-rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 items-start relative">
          {/* From Section */}
          <div className="space-y-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("fromCurrency")}</label>
              {selectedWallet && (
                <span className="text-[10px] font-bold text-emerald-600 uppercase">
                  {common("balance")}: {selectedWallet.balances.find((b: any) => b.currencyId === fromCurrencyId)?.amount || 0} {fromCurrency?.code}
                </span>
              )}
            </div>
            <div className="flex gap-4">
              <select 
                value={fromCurrencyId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === toCurrencyId) {
                    const other = currencies.find(c => c.id !== val)?.id;
                    if (other) setToCurrencyId(other);
                  }
                  setFromCurrencyId(val);
                }}
                className="w-24 px-4 py-4 card-rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-black text-sm"
              >
                {currencies.map(c => (
                  <option key={c.id} value={c.id}>{c.code}</option>
                ))}
              </select>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={amountFrom}
                onChange={(e) => setAmountFrom(e.target.value)}
                className="flex-1 px-6 py-4 card-rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-black text-xl text-right"
              />
            </div>
          </div>

          {/* Separator Arrow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-950 border border-border card-shadow flex items-center justify-center">
              <ArrowDown className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* To Section */}
          <div className="space-y-4 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
            <label className="block px-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60">{t("toCurrency")}</label>
            <div className="flex gap-4">
              <select 
                value={toCurrencyId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === fromCurrencyId) {
                    const other = currencies.find(c => c.id !== val)?.id;
                    if (other) setFromCurrencyId(other);
                  }
                  setToCurrencyId(val);
                }}
                className="w-24 px-4 py-4 card-rounded bg-white dark:bg-slate-950 border border-emerald-500/20 font-black text-sm text-emerald-600"
              >
                {currencies.map(c => (
                  <option key={c.id} value={c.id}>{c.code}</option>
                ))}
              </select>
              <input 
                type="number" 
                step="0.01"
                value={amountTo}
                onChange={(e) => {
                  const newTo = Number(e.target.value);
                  setAmountTo(e.target.value);
                  if (amountFrom && Number(amountFrom) > 0) {
                    setRate(Number((newTo / Number(amountFrom)).toFixed(6)));
                  }
                }}
                className="flex-1 px-6 py-4 card-rounded bg-white dark:bg-slate-950 border border-emerald-500/20 font-black text-xl text-right text-emerald-600"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center card-shadow border border-slate-100">
                 <TrendingUp className="w-4 h-4 text-emerald-600" />
               </div>
               <span className="text-xs font-bold text-muted-foreground">{t("rate")}</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground">1 {fromCurrency?.code} =</span>
                <input 
                  type="number" 
                  step="0.000001" 
                  value={rate}
                  onChange={(e) => {
                    const newRate = Number(e.target.value);
                    setRate(newRate);
                    if (amountFrom) setAmountTo((Number(amountFrom) * newRate).toFixed(2));
                  }}
                  className="w-32 px-3 py-1 card-rounded border border-border font-black text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <span className="text-[10px] font-bold text-muted-foreground">{toCurrency?.code}</span>
             </div>
           </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !amountFrom || !amountTo}
          className="w-full flex items-center justify-center gap-3 py-6 card-rounded text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-2xl shadow-emerald-500/20"
          style={{ background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))" }}
        >
          {isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {common("loading")}</>
          ) : (
            <>{t("execute")} <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </form>
  );
}
