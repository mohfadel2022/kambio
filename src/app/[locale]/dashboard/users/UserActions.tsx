import { DataTableActions } from "@/components/DataTableActions";

export function UserActions({ id }: { id: string }) {
  const handleDelete = async (userId: string) => {
    // Logic for delete would go here (need a deleteUser action)
    console.log("Delete user", userId);
  };

  return (
    <DataTableActions
      id={id}
      baseUrl="/dashboard/users"
      onDelete={handleDelete}
      actions={["view", "edit", "permissions", "delete"]}
    />
  );
}
