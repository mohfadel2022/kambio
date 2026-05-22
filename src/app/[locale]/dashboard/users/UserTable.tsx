"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./UserActions";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: {
    name: string;
  } | null;
};

export function UserTable({ data, translations, roles }: { data: User[], translations: any, roles: any[] }) {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: translations.name,
      cell: ({ row }) => row.original.name || "—",
    },
    {
      accessorKey: "email",
      header: translations.email,
      cell: ({ row }) => row.original.email || "—",
    },
    {
      accessorKey: "role",
      header: translations.role,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider card-rounded">
          {row.original.role?.name || "No Role"}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        const role = row.original.role;
        return role ? value.includes(role.name) : false;
      },
    },
    {
      id: "actions",
      header: translations.actions,
      cell: ({ row }) => <UserActions id={row.original.id} />,
    },
  ];

  const filterableColumns = [
    {
      id: "role",
      title: translations.role,
      options: roles.map(r => ({ label: r.name, value: r.name })),
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="email" searchPlaceholder={translations.searchPlaceholder} filterableColumns={filterableColumns} />;
}
