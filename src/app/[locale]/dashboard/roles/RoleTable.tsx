"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Shield, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = {
  id: string;
  name: string;
  description: string | null;
  _count: {
    users: number;
  };
};

import { useTranslations } from "next-intl";

export function RoleTable({ data, translations }: { data: Role[], translations: any }) {
  const router = useRouter();
  const t = useTranslations("Roles");
  const common = useTranslations("Common");

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: translations.name,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Shield className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold capitalize">{row.original.name}</span>
            <span className="text-[10px] text-muted-foreground">{row.original.description}</span>
          </div>
        </div>
      ),
    },
    {
      id: "usersCount",
      header: translations.users,
      cell: ({ row }) => (
        <span className="font-medium">{row.original._count.users} {t("moduleNames.users")}</span>
      ),
    },
    {
      id: "actions",
      header: translations.actions,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none">
            <MoreVertical className="w-4 h-4 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem 
              onClick={() => router.push(`/dashboard/roles/${row.original.id}`)} 
              className="flex items-center gap-2 cursor-pointer font-bold p-2"
            >
              <Pencil className="w-4 h-4 opacity-50 text-amber-600" />
              <span>{t("actionLabels.edit")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30 cursor-pointer font-bold p-2"
            >
              <Trash2 className="w-4 h-4 opacity-50" />
              <span>{t("actionLabels.delete")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder={common("search")} />;
}
