"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus, markOrderAsPaid, cancelOrder } from "@/app/actions/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Clock, Ban, Check, ArrowRight, Wallet, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "PENDING" | "VERIFIED" | "PAID" | "CANCELLED";

interface WalletBalance {
  id: string;
  walletId: string;
  currencyId: string;
  amount: number;
  wallet: { id: string; name: string; branch?: { name: string } | null };
  currency: { code: string; symbol: string };
}

interface OrderStatusBarProps {
  orderId: string;
  currentStatus: Status;
  translations: any;
  showActions?: boolean;
  availableWallets?: WalletBalance[]; // wallets holding currencyTo
  currencyToSymbol?: string;
  amountTo?: number;
}

export function OrderStatusBar({
  orderId,
  currentStatus,
  translations,
  showActions = false,
  availableWallets = [],
  currencyToSymbol = "",
  amountTo = 0,
}: OrderStatusBarProps) {
  const [isPending, startTransition] = useTransition();
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");

  const statuses: { id: Status; label: string; icon: any }[] = [
    { id: "PENDING", label: translations.statusMap.pending, icon: Clock },
    { id: "VERIFIED", label: translations.statusMap.verified, icon: CheckCircle2 },
    { id: "PAID", label: translations.statusMap.paid, icon: Check },
  ];

  const handleVerify = () => {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, "VERIFIED");
        toast.success(translations.statusMap.verified);
      } catch {
        toast.error(translations.updateError || "Error al actualizar estado");
      }
    });
  };

  const handleReactivate = () => {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, "PENDING");
        toast.success(translations.statusMap.pending);
      } catch {
        toast.error(translations.updateError || "Error al actualizar estado");
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (result.success) {
        toast.success(translations.orderCancelled || "Orden cancelada");
      } else {
        toast.error(result.message || "Error al cancelar");
      }
    });
  };

  const handleConfirmPay = () => {
    if (!selectedWalletId) return;
    startTransition(async () => {
      const result = await markOrderAsPaid(orderId, selectedWalletId);
      if (result.success) {
        setShowPayDialog(false);
        toast.success(translations.paymentSuccess || "Pago registrado correctamente");
      } else {
        toast.error(result.message || "Error al procesar pago");
      }
    });
  };

  const currentIndex = statuses.findIndex((s) => s.id === currentStatus);
  const isCancelled = currentStatus === "CANCELLED";

  return (
    <div className={cn("space-y-8", showActions ? "mb-6" : "mb-10")}>
      {/* Progress Bar */}
      {!isCancelled && (
        <div className="relative px-4">
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-700 ease-in-out"
              style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
            />
          </div>
          <div className="relative flex justify-between">
            {statuses.map((s, i) => {
              const Icon = s.icon;
              const isActive = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={s.id} className="flex flex-col items-center gap-3">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 z-10",
                      isActive 
                        ? "bg-emerald-500 border-emerald-50 dark:border-emerald-950/30 text-white shadow-lg shadow-emerald-500/20" 
                        : "bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-300"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isCurrent && "animate-pulse")} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                  )}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="p-6 rounded-[2rem] bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-red-600 dark:text-red-400 uppercase tracking-widest text-xs">{translations.orderCancelled}</h3>
            <p className="text-sm text-red-600/70 dark:text-red-400/70 font-medium">{translations.orderCancelledDesc}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">{translations.changeStatus}:</span>
          
          {currentStatus !== "VERIFIED" && !isCancelled && (
            <Button 
              type="button" size="sm" variant="outline" 
              className="rounded-xl font-bold gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
              onClick={handleVerify}
              disabled={isPending}
            >
              <CheckCircle2 className="w-4 h-4" />
              {translations.markVerified}
            </Button>
          )}

          {currentStatus !== "PAID" && !isCancelled && (
            <Button 
              type="button" size="sm"
              className="rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                setSelectedWalletId(availableWallets[0]?.walletId || "");
                setShowPayDialog(true);
              }}
              disabled={isPending}
            >
              <Wallet className="w-4 h-4" />
              {translations.markPaid}
            </Button>
          )}

          {currentStatus !== "CANCELLED" && (
            <Button 
              type="button" size="sm" variant="ghost"
              className="rounded-xl font-bold gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={handleCancel}
              disabled={isPending}
            >
              <Ban className="w-4 h-4" />
              {translations.cancelOrder}
            </Button>
          )}

          {isCancelled && (
            <Button 
              type="button" size="sm" variant="outline"
              className="rounded-xl font-bold gap-2"
              onClick={handleReactivate}
              disabled={isPending}
            >
              <Clock className="w-4 h-4" />
              {translations.reactivate}
            </Button>
          )}
        </div>
      )}

      {/* Pay Dialog — inline modal */}
      {showPayDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md card-rounded p-8 space-y-6 card-shadow animate-in zoom-in-95 duration-200"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-black text-lg tracking-tight">
                  {translations.selectWallet || "Seleccionar Caja"}
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  {translations.selectWalletDesc || "Elige la caja que procesará este pago"}
                </p>
              </div>
            </div>

            {/* Amount summary */}
            <div className="p-4 card-rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground">
                {translations.amountToDeduct || "Monto a descontar"}
              </span>
              <span className="font-black text-lg text-emerald-700 dark:text-emerald-400">
                {currencyToSymbol}{Number(amountTo).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Wallet list */}
            {availableWallets.length === 0 ? (
              <div className="p-6 card-rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {translations.noWalletsAvailable || "No hay cajas con saldo suficiente para esta moneda"}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableWallets.map((bal) => {
                  const isSelected = selectedWalletId === bal.walletId;
                  const hasEnough = Number(bal.amount) >= Number(amountTo);
                  return (
                    <button
                      key={bal.walletId}
                      type="button"
                      disabled={!hasEnough}
                      onClick={() => setSelectedWalletId(bal.walletId)}
                      className={cn(
                        "w-full text-left p-4 card-rounded border-2 transition-all",
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                          : hasEnough
                            ? "border-border hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                            : "border-border opacity-40 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-black text-sm">{bal.wallet.name}</p>
                          {bal.wallet.branch && (
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {bal.wallet.branch.name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-black text-sm",
                            hasEnough ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                          )}>
                            {bal.currency.symbol}{Number(bal.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{bal.currency.code}</p>
                        </div>
                      </div>
                      {!hasEnough && (
                        <p className="text-[10px] font-bold text-red-500 mt-1">
                          {translations.insufficientBalance || "Saldo insuficiente"}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button" variant="outline"
                className="flex-1 rounded-xl font-bold"
                onClick={() => setShowPayDialog(false)}
                disabled={isPending}
              >
                {translations.cancel || "Cancelar"}
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={handleConfirmPay}
                disabled={isPending || !selectedWalletId || availableWallets.length === 0}
              >
                <Check className="w-4 h-4" />
                {isPending ? (translations.processing || "Procesando...") : (translations.confirmPay || "Confirmar Pago")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
