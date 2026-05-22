import { notFound } from "next/navigation";
import UserForm from "../../UserForm";
import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getUserForEdit } from "@/app/actions/users";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations("Users");

  const { user, roles } = await getUserForEdit(resolvedParams.id);

  if (!user) {
    notFound();
  }

  // Map the user to match the UserData type expected by UserForm
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    phone: user.phone,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t("editTitle") || "Edit User"}
        subtitle={t("editSubtitle") || "Update user details and role."}
        icon={Users}
      />
      <UserForm initialData={userData} roles={roles} />
    </div>
  );
}
