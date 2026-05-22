import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeftRight, ArrowLeft } from "lucide-react";
import { EditOrderForm } from "./EditOrderForm";
import { getOrderForEdit } from "@/app/actions/orders";
import { getWalletsForCurrency } from "@/app/actions/wallets";

export default async function OrderEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("Orders");

  // Use server action instead of direct prisma calls to avoid hot-reload "Invalid invocation" errors
  const { order, currencies, clients } = await getOrderForEdit(id);
  const walletsForPayment = order ? await getWalletsForCurrency(order.currencyToId) : [];

  if (!order) {
    notFound();
  }

  const clientsData = clients.map(c => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`.trim(),
  }));

  const currenciesData = currencies.map(c => ({
    ...c,
    rateUnder500: Number(c.rateUnder500),
    rate500To1000: Number(c.rate500To1000),
    rateOver1000: Number(c.rateOver1000),
    buyRate: Number(c.buyRate),
    sellRate: Number(c.sellRate),
  }));

  const orderData = {
    ...order,
    amountFrom: Number(order.amountFrom),
    amountTo: Number(order.amountTo),
    rate: Number(order.rate),
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/orders/${id}`}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t("cancelEdit") || "Cancelar Edición"}
        </Link>
      </div>
      <div>
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-black tracking-tight text-center">
            {t("editOrder") || "Editar Orden"} #{order.number}
          </h1>
        </div>
      </div>

      <EditOrderForm 
        currencies={currenciesData} 
        order={orderData} 
        clients={clientsData} 
        walletsForPayment={walletsForPayment}
        translations={{
          statusMap: {
            pending: t("statusMap.pending"),
            verified: t("statusMap.verified"),
            paid: t("statusMap.paid"),
            cancelled: t("statusMap.cancelled"),
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
    </div>
  );
}
