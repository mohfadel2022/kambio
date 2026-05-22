import { ReactNode, ElementType } from "react";
import { Link } from "@/i18n/routing";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  icon?: ElementType;
  action?: {
    label: string;
    href: string;
    icon?: ElementType;
  };
}

export function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 card-rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          {Icon && <Icon className="w-8 h-8 text-emerald-600 shrink-0" />}
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm mt-1 font-medium text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-2 px-6 py-3 card-rounded text-sm font-black text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20 shrink-0"
          style={{
            background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))",
          }}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </Link>
      )}
    </div>
  );
}
