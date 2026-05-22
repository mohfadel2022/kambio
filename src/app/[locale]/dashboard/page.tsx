import { auth } from "@/auth";
import { 
  ArrowLeftRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Plus,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { getDashboardPageData } from "@/app/actions/orders";

export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations("Dashboard");
  const common = await getTranslations("Common");

  const {
    totalOrders,
    pendingOrders,
    paidOrders,
    cancelledOrders,
    wallets,
    recentOrders,
  } = await getDashboardPageData();

  // Flatten wallets and balances into single items
  const allBalances = wallets.flatMap((wallet: any) => 
    wallet.balances.map((balance: any) => ({
      walletName: wallet.name,
      walletBranch: wallet.branch?.name,
      balance
    }))
  );

  const stats = [
    { label: t("totalOrders"), value: totalOrders, icon: ArrowLeftRight, color: "hsl(var(--primary))" },
    { label: t("pending"), value: pendingOrders, icon: Clock, color: "hsl(45, 93%, 47%)" },
    { label: t("paid"), value: paidOrders, icon: CheckCircle2, color: "hsl(142, 71%, 45%)" },
    { label: t("cancelled"), value: cancelledOrders, icon: XCircle, color: "hsl(0, 72%, 51%)" },
  ];

  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-700">
      
      {/* Wallets Balances Grid (Available Balance Section) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-50">{t("availableBalance")}</h2>
          <Link href="/dashboard/wallets" className="text-xs font-bold transition-colors" style={{ color: "hsl(var(--primary))" }}>
            {t("viewAll")}
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allBalances.length > 0 ? allBalances.map((item: any, idx: number) => (
            <BalanceCard 
              key={`${item.balance.id}`} 
              item={item} 
              idx={idx} 
              mainOfficeText={t("mainOffice")} 
            />
          )) : (
            <div className="card-rounded p-10 border-2 border-dashed border-border flex items-center justify-center col-span-full">
              <p className="text-sm font-bold text-muted-foreground">{t("noWallets")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts Section */}
      <DashboardCharts translations={{
        activityOverTime: t("activityOverTime"),
        statusDistribution: t("statusDistribution")
      }} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black tracking-tight">{t("recentOrders")}</h2>
            <Link href="/dashboard/orders" className="text-xs font-bold transition-colors" style={{ color: "hsl(var(--primary))" }}>
              {t("viewAll")}
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order: any) => {
                const statusColors: any = {
                  PENDING: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
                  VERIFIED: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
                  PAID: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
                  CANCELLED: "text-red-600 bg-red-50 dark:bg-red-900/20",
                };
                return (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between p-6 card-rounded bg-card border border-slate-200 dark:border-slate-800 transition-all hover:scale-[1.01] hover:shadow-lg group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 card-rounded bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:border-emerald-500/30 transition-colors">
                        <span className="font-black text-xs opacity-40">{order.currencyFrom.code}</span>
                      </div>
                      <div>
                        <p className="font-black text-sm tracking-tight">#{order.number}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{order.recipientName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                       <div className="text-right hidden sm:block">
                          <p className="font-black text-sm">
                            {order.currencyTo.symbol}{Number(order.amountTo).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] font-bold opacity-40 uppercase">{order.currencyTo.code}</p>
                       </div>
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[order.status]}`}>
                         {t(order.status.toLowerCase())}
                       </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div 
                className="card-rounded flex flex-col items-center justify-center py-16 px-8 text-center border-2 border-dashed"
                style={{ 
                  borderColor: "hsl(var(--border))",
                  background: "hsl(var(--muted)/0.3)"
                }}
              >
                <div className="w-20 h-20 card-rounded bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 card-shadow border border-slate-100 dark:border-slate-800">
                  <ArrowLeftRight className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-sm font-bold text-slate-500 max-w-[200px] leading-relaxed">
                  {t("noOrders")}
                </p>
                <Link 
                  href="/dashboard/orders/new"
                  className="mt-8 px-8 py-3 card-rounded text-white text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-xl"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  {common("create")}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Info */}
        <div className="lg:col-span-4 space-y-6">
           <div className="card-rounded p-8 bg-emerald-600 text-white space-y-6 card-shadow relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black tracking-tight mb-2">Kambio Platform</h3>
                <p className="text-xs opacity-80 leading-relaxed font-medium">
                  {t("platformDesc")}
                </p>
                <Link 
                  href="/dashboard/orders/new"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 card-rounded text-xs font-black transition-transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  {t("newOrder")}
                </Link>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
           </div>
        </div>
      </div>
    </div>
  );
}
