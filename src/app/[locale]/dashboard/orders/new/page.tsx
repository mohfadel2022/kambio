import NewOrderForm from "./NewOrderForm";
import { getTranslations } from "next-intl/server";
import { ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getOrderNewFormData } from "@/app/actions/orders";

export default async function NewOrderPage() {
  const t = await getTranslations("NewOrder");
  const { currencies, clients: rawClients } = await getOrderNewFormData();

  const clients = rawClients.map((c: any) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`.trim(),
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle")}
        icon={ArrowLeftRight}
      />
      <NewOrderForm currencies={currencies} clients={clients} />
    </div>
  );
}
