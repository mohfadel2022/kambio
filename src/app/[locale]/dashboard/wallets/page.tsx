import { Wallet, Plus, Edit } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { getWalletsPageData } from "@/app/actions/wallets";

export default async function WalletsPage() {
  const wallets = await getWalletsPageData();
  const t = await getTranslations("Wallets");
  const dash = await getTranslations("Dashboard");

  const totalByCurrency: Record<string, { symbol: string; amount: number }> = {};
  for (const wallet of wallets) {
    for (const b of wallet.balances) {
      if (!totalByCurrency[b.currency.code]) {
        totalByCurrency[b.currency.code] = { symbol: b.currency.symbol, amount: 0 };
      }
      totalByCurrency[b.currency.code].amount += Number(b.amount);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle")}
        icon={Wallet}
        action={{ label: t("newWallet"), href: "/dashboard/wallets/new", icon: Plus }}
      />

      {/* Summary Cards */}
      {Object.keys(totalByCurrency).length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">
            {t("totalHoldings")}
          </p>
          <div className="flex flex-wrap gap-4">
            {Object.entries(totalByCurrency).map(([code, { symbol, amount }]) => (
              <div
                key={code}
                className="px-6 py-4 card-rounded flex items-center gap-4 card-shadow"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                <div
                  className="w-10 h-10 card-rounded flex items-center justify-center text-[10px] font-black tracking-wider"
                  style={{
                    background: "rgba(20, 83, 45, 0.08)",
                    color: "hsl(var(--primary))",
                  }}
                >
                  {code}
                </div>
                <span className="font-black text-xl tracking-tight">
                  {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet Cards */}
      {wallets.length === 0 ? (
        <div
          className="card-rounded flex flex-col items-center justify-center py-24 gap-4 border-2 border-dashed"
          style={{ background: "transparent", borderColor: "hsl(var(--border))" }}
        >
          <div
            className="w-20 h-20 card-rounded flex items-center justify-center card-shadow"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            <Wallet className="w-10 h-10 opacity-20" />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{t("noWalletsYet")}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {t("createFirstWallet")}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wallets.map((wallet: any) => (
            <div
              key={wallet.id}
              className="card-rounded p-8 transition-all hover:-translate-y-1 duration-300 card-shadow"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            >
              {/* Wallet Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 card-rounded flex items-center justify-center card-shadow"
                    style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
                  >
                    <Wallet className="w-7 h-7 opacity-30" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight">{wallet.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {wallet.branch?.name || dash("mainOffice")}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/wallets/${wallet.id}/edit`}
                  className="p-2 card-rounded text-muted-foreground hover:text-primary hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </div>

              {/* Balances */}
              <div className="space-y-4">
                {wallet.balances.map((b: any) => {
                  const amount = Number(b.amount);
                  const isPositive = amount > 0;
                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between px-5 py-4 card-rounded group transition-colors hover:bg-slate-50"
                      style={{ background: "hsl(var(--secondary))" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black"
                          style={{
                            background: "white",
                            color: "hsl(var(--muted-foreground))",
                            border: "1px solid hsl(var(--border))"
                          }}
                        >
                          {b.currency.code[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black">{b.currency.code}</span>
                          <span className="text-[10px] font-bold text-muted-foreground">{b.currency.name}</span>
                        </div>
                      </div>
                      <span
                        className="font-black text-sm tabular-nums tracking-tight"
                        style={{ color: isPositive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                      >
                        {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
