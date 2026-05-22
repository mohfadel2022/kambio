import { deleteCurrency } from "@/app/actions/currencies";
import { DataTableActions } from "@/components/DataTableActions";

export function CurrencyActions({ id }: { id: string }) {
  const handleDelete = async (currencyId: string) => {
    await deleteCurrency(currencyId);
  };

  return (
    <DataTableActions
      id={id}
      baseUrl="/dashboard/currencies"
      onDelete={handleDelete}
      actions={["edit", "delete"]}
    />
  );
}
