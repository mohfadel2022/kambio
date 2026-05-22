import { notFound } from "next/navigation";
import { ArrowLeft, Coins } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrencyForEdit } from "@/app/actions/currencies";

export default async function CurrencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currency = await getCurrencyForEdit(id);

  if (!currency) notFound();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/currencies" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader 
          title="Detalles de la Moneda"
          icon={Coins}
        />
      </div>

      <div className="card-rounded p-8 bg-card border border-slate-200 dark:border-slate-800 card-shadow flex items-center gap-6">
        <div className="w-16 h-16 card-rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <Coins className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight">{currency.name} ({currency.code})</h2>
          <p className="text-sm text-muted-foreground font-medium">Símbolo: {currency.symbol}</p>
        </div>
      </div>
    </div>
  );
}
