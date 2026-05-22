"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({ value: "", onValueChange: () => {} });

const Tabs = ({ 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className 
}: { 
  defaultValue?: string; 
  value?: string; 
  onValueChange?: (value: string) => void; 
  children: React.ReactNode;
  className?: string;
}) => {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "");

  React.useEffect(() => {
    if (value !== undefined) setSelectedValue(value);
  }, [value]);

  const handleValueChange = (val: string) => {
    if (value === undefined) setSelectedValue(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: selectedValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("inline-flex h-12 items-center justify-center card-rounded bg-slate-100 p-1 text-muted-foreground dark:bg-slate-800", className)}>
    {children}
  </div>
);

const TabsTrigger = ({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) => {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap card-rounded px-6 py-2 text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50",
        isSelected 
          ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-950 dark:text-emerald-400" 
          : "hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) => {
  const { value: selectedValue } = React.useContext(TabsContext);
  if (selectedValue !== value) return null;

  return (
    <div className={cn("mt-6 animate-in fade-in-0 zoom-in-95 duration-300", className)}>
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
