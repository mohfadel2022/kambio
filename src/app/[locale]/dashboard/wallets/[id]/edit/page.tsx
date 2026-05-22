import { notFound } from "next/navigation";
import WalletForm from "../../WalletForm";
import { getTranslations } from "next-intl/server";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getWalletForEdit } from "@/app/actions/wallets";

export default async function EditWalletPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations("Wallets");

  const { wallet, currencies, branches } = await getWalletForEdit(resolvedParams.id);

  if (!wallet) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("editTitle") || "Edit Wallet"}
        subtitle={t("editSubtitle") || "Update wallet details."}
        icon={Wallet}
      />
      <WalletForm 
        initialData={wallet as any} 
        allCurrencies={currencies as any} 
        branches={branches as any}
      />
    </div>
  );
}
