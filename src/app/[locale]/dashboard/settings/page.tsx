import { getTranslations } from "next-intl/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySettingsForm } from "./CompanySettingsForm";
import { BranchSettings } from "./BranchSettings";
import { Settings, Building2, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getSettingsPageData } from "@/app/actions/settings";

export default async function SettingsPage() {
  const t = await getTranslations("Settings");
  const { company, branches } = await getSettingsPageData();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle")}
        icon={Settings}
      />

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="mb-8 p-1.5 h-14 w-full md:w-auto card-rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="company" className="h-full px-8 text-xs uppercase tracking-widest gap-2">
            <Building2 className="w-3 h-3" />
            {t("company")}
          </TabsTrigger>
          <TabsTrigger value="branches" className="h-full px-8 text-xs uppercase tracking-widest gap-2">
            <MapPin className="w-3 h-3" />
            {t("branches")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="card-rounded p-10 bg-card border border-slate-200 dark:border-slate-800 card-shadow">
          <CompanySettingsForm initialData={company} />
        </TabsContent>

        <TabsContent value="branches">
          <BranchSettings initialBranches={branches} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
