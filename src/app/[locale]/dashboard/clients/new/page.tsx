import ClientForm from "../ClientForm";
import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";

export default async function NewClientPage() {
  const t = await getTranslations("Clients");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-bold">{t("newClient")}</h1>
        </div>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          {t("title")}
        </p>
      </div>
      <ClientForm />
    </div>
  );
}
