"use client";

import { useActionState, useState, useTransition } from "react";
import { 
  createWallet, 
  updateWallet, 
  addWalletBalance, 
  updateWalletBalance, 
  deleteWalletBalance, 
  type WalletState 
} from "@/app/actions/wallets";
import { ArrowRight, Loader2, Wallet as WalletIcon, Building, Coins, Plus, Trash2, Save } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type WalletData = {
  id?: string;
  name: string;
  branchId?: string | null;
  balances?: Array<{
    id: string;
    amount: any;
    currency: {
      id: string;
      code: string;
      symbol: string;
    };
  }>;
};

type Branch = {
  id: string;
  name: string;
};

type Currency = {
  id: string;
  code: string;
  name: string;
};

const initialState: WalletState = {};

function Field({ label, name, error, children }: { label: string; name: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-[10px] font-black uppercase tracking-[0.2em] px-2" style={{ color: "hsl(var(--muted-foreground))" }}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] font-bold px-2 animate-shake" style={{ color: "hsl(var(--destructive))" }}>
          {error.join(", ")}
        </p>
      )}
    </div>
  );
}

const inputClass = "w-full px-6 py-4 card-rounded text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 placeholder:opacity-30";

export default function WalletForm({ initialData, allCurrencies = [], branches = [] }: { initialData?: WalletData, allCurrencies?: Currency[], branches?: Branch[] }) {
  const isEditing = !!initialData?.id;
  const t = useTranslations("Wallets");
  const common = useTranslations("Common");
  const [isPending, startTransition] = useTransition();

  const actionFunction = isEditing
    ? updateWallet.bind(null, initialData.id!)
    : createWallet;

  const [state, action, pending] = useActionState(actionFunction, initialState);

  // Balance management state
  const [newCurrencyId, setNewCurrencyId] = useState("");
  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState("");

  const handleAddBalance = () => {
    if (!newCurrencyId || !initialData?.id) return;
    
    startTransition(async () => {
      const result = await addWalletBalance(initialData.id!, newCurrencyId, 0);
      if (result.success) {
        toast.success(t("toastAddSuccess"));
        setNewCurrencyId("");
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleUpdateBalance = (balanceId: string) => {
    if (!initialData?.id) return;
    
    startTransition(async () => {
      const result = await updateWalletBalance(initialData.id!, balanceId, parseFloat(editingAmount));
      if (result.success) {
        toast.success(t("toastUpdateSuccess"));
        setEditingBalanceId(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDeleteBalance = (balanceId: string) => {
    if (!initialData?.id) return;
    
    startTransition(async () => {
      const result = await deleteWalletBalance(initialData.id!, balanceId);
      if (result.success) {
        toast.success(t("toastDeleteSuccess"));
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 w-full space-y-8 animate-in fade-in duration-700">
      <form action={action} className="w-full">
        <div className="card-rounded p-6 md:p-10 space-y-8 card-shadow" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          
          {state.message && (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-6 py-4 card-rounded animate-shake card-shadow" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)", color: "hsl(var(--destructive))" }}>
              {state.message}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <WalletIcon className="w-4 h-4 opacity-30" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                {t("title") || "Wallet Details"}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label={t("name") || "Name"} name="name" error={state.errors?.name}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"><WalletIcon className="w-4 h-4" /></span>
                  <input id="name" name="name" type="text" defaultValue={initialData?.name || ""} className={`${inputClass} pl-10`} required />
                </div>
              </Field>

              <Field label={t("branch") || "Branch"} name="branchId" error={state.errors?.branchId}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"><Building className="w-4 h-4" /></span>
                  <select id="branchId" name="branchId" defaultValue={initialData?.branchId || ""} className={`${inputClass} pl-10 appearance-none`}>
                    <option value="">{t("selectBranch") || "Seleccionar Sucursal..."}</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </Field>
            </div>
          </div>

          <div className="border-t pt-8 mt-4" style={{ borderColor: "hsl(var(--border))" }}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 w-full flex items-center justify-center gap-3 py-5 card-rounded text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-emerald-500/20"
                style={{ background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))" }}
              >
                {pending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />{isEditing ? (t("updating") || "Updating...") : (t("creating") || "Creating...")}</>
                ) : (
                  <><span>{isEditing ? (t("updateButton") || "Update Wallet") : (t("createButton") || "Create Wallet")}</span><ArrowRight className="w-5 h-5" /></>
                )}
              </button>
              <Link
                href="/dashboard/wallets"
                className="w-full sm:w-auto text-center px-10 py-5 card-rounded text-sm font-black transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
              >
                {common("cancel")}
              </Link>
            </div>
          </div>
        </div>
      </form>

      {/* Balances Management Section (Only in Edit mode) */}
      {isEditing && (
        <div className="card-rounded p-6 md:p-10 space-y-8 card-shadow" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 px-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                {t("manageBalances") || "Manage Balances"}
              </h3>
            </div>

            {/* Add Currency Row */}
            <div className="flex items-center gap-2">
              {allCurrencies.filter(c => !initialData?.balances?.some(b => b.currency.id === c.id)).length > 0 ? (
                <>
                  <select 
                    value={newCurrencyId}
                    onChange={(e) => setNewCurrencyId(e.target.value)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all min-w-[150px]"
                  >
                    <option value="">{t("selectCurrency")}</option>
                    {allCurrencies
                      .filter(c => !initialData?.balances?.some(b => b.currency.id === c.id))
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                      ))
                    }
                  </select>
                  <button
                    onClick={handleAddBalance}
                    disabled={!newCurrencyId || isPending}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-3 h-3" />
                    {common("create")}
                  </button>
                </>
              ) : (
                <p className="text-[10px] font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg italic">
                  {t("allCurrenciesAdded")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialData?.balances?.map(balance => (
              <div 
                key={balance.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-xs border border-slate-100 dark:border-slate-700 shadow-sm">
                    {balance.currency.code}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("balanceLabel")}</p>
                    {editingBalanceId === balance.id ? (
                      <input 
                        type="number"
                        step="0.01"
                        value={editingAmount}
                        onChange={(e) => setEditingAmount(e.target.value)}
                        autoFocus
                        className="text-lg font-black bg-transparent border-b-2 border-emerald-500 outline-none w-24"
                      />
                    ) : (
                      <p className="text-lg font-black">{parseFloat(balance.amount).toLocaleString()} {balance.currency.symbol}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingBalanceId === balance.id ? (
                    <button 
                      onClick={() => handleUpdateBalance(balance.id)}
                      disabled={isPending}
                      className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setEditingBalanceId(balance.id);
                        setEditingAmount(balance.amount.toString());
                      }}
                      className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <WalletIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteBalance(balance.id)}
                    disabled={isPending}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

