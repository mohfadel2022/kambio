"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { OrderActions } from "./OrderActions";
import { ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Order = {
  id: string;
  number: string;
  senderName: string;
  recipientName: string;
  amountFrom: any;
  currencyFrom: { code: string; symbol: string };
  amountTo: any;
  currencyTo: { code: string; symbol: string };
  rate: any;
  status: string;
  createdAt: Date;
};

const statusVariants: any = {
  PENDING: "secondary",
  VERIFIED: "default",
  PAID: "default",
  CANCELLED: "destructive",
};

export function OrderTable({ data, translations }: { data: Order[], translations: any }) {
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "number",
      header: translations.orderNum,
      cell: ({ row }) => (
        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
          #{row.original.number}
        </span>
      ),
    },
    {
      accessorKey: "senderName",
      header: translations.sender,
    },
    {
      accessorKey: "recipientName",
      header: translations.recipient,
    },
    {
      id: "amount",
      header: translations.amount,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-black">
              {row.original.currencyFrom.symbol}{Number(row.original.amountFrom).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <ArrowLeftRight className="w-3 h-3 opacity-30" />
            <span className="font-black">
              {row.original.currencyTo.symbol}{Number(row.original.amountTo).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-[9px] font-bold text-muted-foreground">
            {row.original.currencyFrom.code} → {row.original.currencyTo.code}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "rate",
      header: translations.rate,
      cell: ({ row }) => Number(row.original.rate).toFixed(4),
    },
    {
      accessorKey: "status",
      header: translations.status,
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = statusVariants[status] || "outline";
        
        const customStyle: any = {};
        if (status === "PENDING") {
          customStyle.backgroundColor = "rgba(245,158,11,0.1)";
          customStyle.color = "hsl(38,92%,50%)";
        }
        if (status === "PAID") {
          customStyle.backgroundColor = "rgba(34,197,94,0.1)";
          customStyle.color = "hsl(142,71%,45%)";
        }
        if (status === "VERIFIED") {
          customStyle.backgroundColor = "rgba(59,130,246,0.1)";
          customStyle.color = "hsl(217,91%,60%)";
        }

        return (
          <Badge
            variant={variant}
            className="font-black uppercase tracking-widest text-[9px] px-2 h-6"
            style={customStyle}
          >
            {translations.statusMap[status.toLowerCase()] || status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: translations.date,
      cell: ({ row }) => (
        <span className="text-[10px] font-bold opacity-60">
          {new Date(row.original.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: translations.actions,
      cell: ({ row }) => <OrderActions order={row.original as any} />,
    },
  ];

  const filterableColumns = [
    {
      id: "status",
      title: translations.status,
      options: [
        { label: translations.statusMap.pending, value: "PENDING" },
        { label: translations.statusMap.verified, value: "VERIFIED" },
        { label: translations.statusMap.paid, value: "PAID" },
        { label: translations.statusMap.cancelled, value: "CANCELLED" },
      ],
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="number" searchPlaceholder={translations.searchPlaceholder} filterableColumns={filterableColumns} />;
}
