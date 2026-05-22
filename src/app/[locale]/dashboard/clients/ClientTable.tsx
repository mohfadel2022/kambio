"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { ClientActions } from "./ClientActions";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  documentId: string | null;
  phone: string | null;
  email: string | null;
};

export function ClientTable({ data, translations }: { data: Client[], translations: any }) {
  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "firstName",
      header: translations.firstName,
    },
    {
      accessorKey: "lastName",
      header: translations.lastName,
    },
    {
      accessorKey: "documentId",
      header: translations.documentId,
      cell: ({ row }) => row.original.documentId || "—",
      filterFn: (row, id, value) => {
        const val = row.getValue(id);
        if (value.includes("HAS_DOC") && val) return true;
        if (value.includes("NO_DOC") && !val) return true;
        return false;
      },
    },
    {
      accessorKey: "phone",
      header: translations.phone,
      cell: ({ row }) => row.original.phone || "—",
    },
    {
      accessorKey: "email",
      header: translations.email,
      cell: ({ row }) => row.original.email || "—",
    },
    {
      id: "actions",
      header: translations.actions,
      cell: ({ row }) => <ClientActions id={row.original.id} name={`${row.original.firstName} ${row.original.lastName}`} />,
    },
  ];

  const filterableColumns = [
    {
      id: "documentId",
      title: translations.documentId,
      options: [
        { label: translations.hasDocument || "Con Documento", value: "HAS_DOC" },
        { label: translations.noDocument || "Sin Documento", value: "NO_DOC" },
      ],
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="firstName" searchPlaceholder={translations.searchPlaceholder} filterableColumns={filterableColumns} />;
}
