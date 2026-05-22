"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, Check, ChevronDown, Loader2 } from "lucide-react";

interface Option {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onAddNew?: () => void;
  placeholder?: string;
  name?: string;
  error?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  onAddNew,
  placeholder = "Select...",
  name,
  error
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.name === value || opt.id === value);
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <input type="hidden" name={name} value={value} />
      
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 card-rounded text-sm font-bold bg-slate-50 dark:bg-slate-900 border transition-all cursor-pointer flex items-center justify-between
          ${isOpen ? "ring-4 ring-emerald-500/10 border-emerald-500" : "border-slate-200 dark:border-slate-800"}
          ${error ? "border-destructive ring-destructive/10" : ""}
        `}
      >
        <span className={selectedOption ? "text-foreground" : "text-muted-foreground opacity-50"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 opacity-30 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border card-rounded shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          <div className="p-3 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <input
                autoFocus
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-card border border-border card-rounded text-xs outline-none focus:border-emerald-500"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[250px] overflow-y-auto p-2 space-y-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.name);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`flex items-center justify-between px-4 py-3 card-rounded cursor-pointer transition-colors
                    ${(value === opt.name || value === opt.id) ? "bg-emerald-500/10 text-emerald-600" : "hover:bg-slate-100 dark:hover:bg-slate-800"}
                  `}
                >
                  <span className="text-sm font-bold">{opt.name}</span>
                  {(value === opt.name || value === opt.id) && <Check className="w-4 h-4" />}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-xs font-bold opacity-30 italic">
                No results found
              </div>
            )}
          </div>

          {onAddNew && (
            <div className="p-2 border-t border-border bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => {
                  onAddNew();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 card-rounded bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Client
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
