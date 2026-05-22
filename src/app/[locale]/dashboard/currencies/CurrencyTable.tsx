"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CurrencyActions } from "./CurrencyActions";

type Currency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isPrimary: boolean;
  rateUnder500: any;
  rate500To1000: any;
  rateOver1000: any;
};

export function CurrencyTable({ data, translations }: { data: Currency[], translations: any }) {
  const columns: ColumnDef<Currency>[] = [
    {
      accessorKey: "code",
      header: translations.code,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-black">{row.original.code}</span>
          {row.original.isPrimary && (
            <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Primary
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: translations.name,
    },
    {
      accessorKey: "rateUnder500",
      header: translations.rateUnder500,
      cell: ({ row }) => Number(row.original.rateUnder500).toFixed(4),
    },
    {
      accessorKey: "rate500To1000",
      header: translations.rate500To1000,
      cell: ({ row }) => Number(row.original.rate500To1000).toFixed(4),
    },
    {
      accessorKey: "rateOver1000",
      header: translations.rateOver1000,
      cell: ({ row }) => Number(row.original.rateOver1000).toFixed(4),
    },
    {
      id: "actions",
      header: translations.actions,
      cell: ({ row }) => <CurrencyActions id={row.original.id} />,
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="code" searchPlaceholder="Filter by currency code..." />;
}
