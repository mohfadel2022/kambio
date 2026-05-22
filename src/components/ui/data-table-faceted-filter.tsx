import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const t = useTranslations("Common");
  const filterValue = column?.getFilterValue() as string;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button 
          variant="outline" 
          size="sm" 
          className="card-rounded gap-2 border-slate-200 dark:border-slate-800 h-10 px-4"
        >
          <Filter className="h-3.5 w-3.5 opacity-50" />
          <span className="text-xs font-bold">{title}</span>
          {filterValue && (
            <Badge 
              variant="secondary" 
              className="ml-1 px-1 font-black text-[9px] bg-emerald-500 text-white border-none"
            >
              {options.find(o => o.value === filterValue)?.label || "1"}
            </Badge>
          )}
        </Button>
      } />
      <DropdownMenuContent align="start" className="w-48 card-rounded p-1">
        <DropdownMenuItem 
          onClick={() => column?.setFilterValue(undefined)} 
          className="font-bold text-xs p-2.5"
        >
          {t("all")}
        </DropdownMenuItem>
        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
        {options.map((option) => (
          <DropdownMenuItem 
            key={option.value} 
            onClick={() => column?.setFilterValue(option.value)}
            className="flex items-center justify-between font-bold text-xs p-2.5 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {option.icon && (
                <option.icon className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{option.label}</span>
            </div>
            {filterValue === option.value && (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
