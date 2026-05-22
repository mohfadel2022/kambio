import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div
      className="group relative card-rounded p-8 transition-all hover:-translate-y-1 card-shadow"
      style={{ 
        background: "hsl(var(--card))", 
        border: "1px solid hsl(var(--border))",
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-3xl font-black tracking-tight">{value}</p>
      </div>
      <div 
        className="absolute top-6 end-6 w-12 h-12 card-rounded flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3"
        style={{ background: `${color}12`, color: color }}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
