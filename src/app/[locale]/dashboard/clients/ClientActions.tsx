import { deleteClient } from "@/app/actions/clients";
import { DataTableActions } from "@/components/DataTableActions";
import { useRouter } from "@/i18n/routing";

export function ClientActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const handleDelete = async (clientId: string) => {
    await deleteClient(clientId);
  };

  return (
    <DataTableActions
      id={id}
      baseUrl="/dashboard/clients"
      onDelete={handleDelete}
      onSend={() => router.push(`/dashboard/orders/new?senderName=${name}` as any)}
      actions={["view", "send", "edit", "delete"]}
    />
  );
}
