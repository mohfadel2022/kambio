import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import ExchangeForm from "../../ExchangeForm";
import { getExchangeForEdit } from "@/app/actions/exchange";

export default async function EditExchangePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("Exchange");

  // Use server action instead of direct prisma calls to avoid hot-reload "Invalid invocation" errors
  const data = await getExchangeForEdit(id);

  if (!data.exchange) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("editExchange") || "Editar Cambio"}
        subtitle={`ID: ${id}`}
        icon={TrendingUp}
      />

      <div className="card-rounded border border-border bg-card p-6 card-shadow">
        <ExchangeForm
          wallets={data.wallets}
          currencies={data.currencies}
          initialData={data.exchange}
        />
      </div>
    </div>
  );
}
