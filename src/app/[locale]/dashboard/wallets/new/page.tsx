import WalletForm from "../WalletForm";
import { getTranslations } from "next-intl/server";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getWalletNewFormData } from "@/app/actions/wallets";

export default async function NewWalletPage() {
  const t = await getTranslations("Wallets");
  const { branches } = await getWalletNewFormData();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("newWallet")}
        subtitle={t("newSubtitle") || "Create a new wallet"}
        icon={Wallet}
      />
      <WalletForm branches={branches} />
    </div>
  );
}
