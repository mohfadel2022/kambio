import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Edit2, User, Calculator, FileText, ArrowLeftRight } from "lucide-react";
import { OrderStatusBar } from "./OrderStatusBar";
import { Badge } from "@/components/ui/badge";
import { OrderInvoice } from "@/components/orders/OrderInvoice";
import { OrderQRCode } from "@/components/orders/OrderQRCode";
import { WhatsAppShareButton } from "@/components/orders/WhatsAppShareButton";
import { SendEmailButton } from "@/components/orders/SendEmailButton";
import { getOrderDetailsPageData } from "@/app/actions/orders";
import { getWalletsForCurrency } from "@/app/actions/wallets";

export default async function OrderViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id || id === 'undefined') {
    notFound();
  }

  const t = await getTranslations("Orders");
  const common = await getTranslations("Common");
  const dash = await getTranslations("Dashboard");

  const order = await getOrderDetailsPageData(id);

  if (!order) {
    notFound();
  }

  // Fetch wallets that hold currencyTo (for the payment dialog)
  const walletsForPayment = await getWalletsForCurrency(order.currencyToId);

  const statusConfig: Record<string, { color: string; bg: string }> = {
    PENDING: { color: "hsl(38,92%,50%)", bg: "rgba(245,158,11,0.1)" },
    VERIFIED: { color: "hsl(217,91%,60%)", bg: "rgba(59,130,246,0.1)" },
    PAID: { color: "hsl(142,71%,45%)", bg: "rgba(34,197,94,0.1)" },
    CANCELLED: { color: "hsl(0,72%,51%)", bg: "rgba(239,68,68,0.1)" },
  };
  const sc = statusConfig[order.status] || statusConfig.PENDING;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between px-2 no-print">
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t("title")}
        </Link>
        <Link
          href={`/dashboard/orders/${order.id}/edit`}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20 text-white"
          style={{
            background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))",
          }}
        >
          <Edit2 className="w-4 h-4" />
          {common("edit")}
        </Link>
      </div>

      <OrderInvoice 
        order={order} 
        translations={{ 
          printInvoice: t("printInvoice"),
          invoice: t("invoice"),
          reference: t("orderNum"),
          status: t("status"),
          statusLabel: dash(order.status.toLowerCase()),
          sender: t("sender"),
          recipient: t("recipient"),
          description: t("description"),
          rate: t("rate"),
          amount: t("amount"),
          moneyTransfer: t("moneyTransfer"),
          totalToReceive: t("totalToReceive"),
          thankYou: t("thankYou"),
          systemGenerated: t("systemGenerated"),
          generatedOn: t("generatedOn"),
          notes: t("notes"),
          downloadPDF: t("downloadPDF"),
          generating: t("generating"),
          previewInvoice: t("previewInvoice")
        }} 
      />

      <div className="grid lg:grid-cols-12 gap-6 no-print">
        {/* Main Details Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card-rounded p-10 space-y-10 card-shadow" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: "hsl(var(--primary))" }}>#{order.number}</h1>
                <p className="text-sm font-medium text-muted-foreground mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge
                variant="outline"
                className="font-black uppercase tracking-widest text-[10px] px-3 h-8"
                style={{ background: sc.bg, color: sc.color }}
              >
                {dash(order.status.toLowerCase())}
              </Badge>
            </div>

            <OrderStatusBar 
              orderId={order.id} 
              currentStatus={order.status as any} 
              showActions={false}
              availableWallets={walletsForPayment}
              currencyToSymbol={order.currencyTo?.symbol || ""}
              amountTo={Number(order.amountTo)}
              translations={{
                statusMap: {
                  pending: dash("pending"),
                  verified: dash("verified"),
                  paid: dash("paid"),
                  cancelled: dash("cancelled"),
                },
                orderStatus: t("orderStatus"),
                changeStatus: t("changeStatus"),
                markVerified: t("markVerified"),
                markPaid: t("markPaid"),
                cancelOrder: t("cancelOrder"),
                reactivate: t("reactivate"),
                orderCancelled: t("orderCancelled"),
                orderCancelledDesc: t("orderCancelledDesc"),
                selectWallet: t("selectWallet"),
                selectWalletDesc: t("selectWalletDesc"),
                amountToDeduct: t("amountToDeduct"),
                noWalletsAvailable: t("noWalletsAvailable"),
                insufficientBalance: t("insufficientBalance"),
                confirmPay: t("confirmPay"),
                processing: t("processing"),
                paymentSuccess: t("paymentSuccess"),
                cancel: t("cancel"),
                updateError: t("updateError"),
              }}
            />

            <div className="border-t" style={{ borderColor: "hsl(var(--border))" }} />

            {/* Sender & Recipient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 opacity-30" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    {t("sender")}
                  </h3>
                </div>
                <p className="text-xl font-bold">{order.senderName}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 opacity-30" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    {t("recipient")}
                  </h3>
                </div>
                <p className="text-xl font-bold">{order.recipientName}</p>
              </div>
            </div>

            <div className="border-t" style={{ borderColor: "hsl(var(--border))" }} />

            {/* Financial Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 opacity-30" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {t("amount")} & {t("rate")}
                </h3>
              </div>

              <div className="flex flex-col items-center gap-8 mb-8 p-8 md:p-10 card-rounded card-shadow border" style={{ background: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}>
                <div className="text-center w-full">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{t("from")}</p>
                  <p className="font-black text-3xl md:text-4xl tracking-tighter">{order.currencyFrom.symbol}{Number(order.amountFrom).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-xs font-bold opacity-40">{order.currencyFrom.code}</p>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl card-shadow border" style={{ background: "hsl(var(--card))", color: "hsl(var(--primary))", borderColor: "hsl(var(--border))" }}>
                    <ArrowLeftRight className="w-5 h-5 rotate-90" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                    {t("rate")}: {Number(order.rate).toFixed(4)}
                  </p>
                </div>

                <div className="text-center w-full">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{t("to")}</p>
                  <p className="font-black text-3xl md:text-4xl tracking-tighter text-emerald-600 dark:text-emerald-400">{order.currencyTo.symbol}{Number(order.amountTo).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-xs font-bold opacity-40">{order.currencyTo.code}</p>
                </div>
              </div>
            </div>

            <div className="border-t" style={{ borderColor: "hsl(var(--border))" }} />

            {/* Notes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 opacity-30" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Notes
                </h3>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {order.notes ? (
                  <p className="text-sm">{order.notes}</p>
                ) : (
                  <p className="text-sm opacity-50 italic">No notes provided.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Side Column with QR and Actions */}
        <div className="lg:col-span-4 space-y-6">
          <OrderQRCode 
            orderId={order.id} 
            orderNumber={order.number}
            translations={{
              verification: t("verification"),
              qrDesc: t("qrDesc")
            }}
          />

          {/* WhatsApp Share Section */}
          <WhatsAppShareButton 
            order={order}
            translations={{
              sendWhatsApp: t("sendWhatsApp")
            }}
          />

          {/* Email Share Section */}
          <SendEmailButton 
            orderId={order.id}
            order={order}
            translations={{
              sendEmail: t("sendEmail")
            }}
          />
        </div>
      </div>
    </div>
  );
}
