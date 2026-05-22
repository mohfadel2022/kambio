import UserForm from "../UserForm";
import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getUserFormData } from "@/app/actions/users";

export default async function NewUserPage() {
  const t = await getTranslations("Users");
  const { roles } = await getUserFormData();

  const emptyUser = {
    name: "",
    email: "",
    roleId: "",
    phone: "",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("newUser")}
        subtitle={t("newSubtitle") || "Create a new user account"}
        icon={Users}
      />
      <UserForm initialData={emptyUser} roles={roles} />
    </div>
  );
}
