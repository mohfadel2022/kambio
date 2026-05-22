import { Link } from "@/i18n/routing";
import { Plus, ArrowLeftRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { OrderTable } from "./OrderTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { getOrdersPageData } from "@/app/actions/orders";

export default async function OrdersPage() {
  const orders = await getOrdersPageData();
  const t = await getTranslations("Orders");
  const dash = await getTranslations("Dashboard");
  const common = await getTranslations("Common");

  const translations = {
    orderNum: t("orderNum"),
    sender: t("sender"),
    recipient: t("recipient"),
    amount: t("amount"),
    rate: t("rate"),
    status: t("status"),
    date: t("date"),
    actions: common("actions"),
    searchPlaceholder: t("searchPlaceholder") || "Filter by order number...",
    statusMap: {
      pending: dash("pending"),
      verified: dash("verified"),
      paid: dash("paid"),
      cancelled: dash("cancelled"),
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle", { count: orders.length })}
        icon={ArrowLeftRight}
        action={{ label: t("newOrder"), href: "/dashboard/orders/new", icon: Plus }}
      />

      {orders.length === 0 ? (
        <div className="card-rounded border border-slate-200 dark:border-slate-800 bg-card p-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 card-rounded flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <ArrowLeftRight className="w-8 h-8 opacity-20" />
          </div>
          <p className="font-bold text-lg">{t("noOrdersYet")}</p>
          <p className="text-sm font-medium text-muted-foreground">
            {t("createFirstOrder")}
          </p>
          <Link
            href="/dashboard/orders/new"
            className="mt-4 px-8 py-3 card-rounded text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/10"
            style={{
              background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))",
            }}
          >
            {t("newOrder")}
          </Link>
        </div>
      ) : (
        <OrderTable data={orders as any} translations={translations} />
      )}
    </div>
  );
}
