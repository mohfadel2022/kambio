import { Wallet, TrendingUp } from "lucide-react";
import { Prisma } from "@prisma/client";

interface BalanceCardProps {
  item: {
    walletName: string;
    walletBranch: string | null;
    balance: {
      id: string | number;
      amount: prisma.Decimal | number | string;
      currency: {
        code: string;
        name: string;
      };
    };
  };
  idx: number;
  mainOfficeText: string;
}

export function BalanceCard({ item, idx, mainOfficeText }: BalanceCardProps) {
  const getGradient = (idx: number) => {
    const gradients = [
      "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))",
      "linear-gradient(135deg, hsl(222, 47%, 11%), hsl(222, 47%, 25%))",
      "linear-gradient(135deg, hsl(200, 70%, 30%), hsl(200, 70%, 45%))",
      "linear-gradient(135deg, hsl(280, 60%, 25%), hsl(280, 60%, 40%))",
      "linear-gradient(135deg, hsl(20, 80%, 30%), hsl(20, 80%, 45%))",
    ];
    return gradients[idx % gradients.length];
  };

  return (
    <div 
      className="relative overflow-hidden card-rounded p-7 text-white card-shadow transition-all hover:scale-[1.02] group"
      style={{ background: getGradient(idx) }}
    >
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="w-9 h-9 shrink-0 card-rounded bg-white/20 flex items-center justify-center backdrop-blur-sm transition-transform group-hover:rotate-6">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 text-right line-clamp-2">
            {item.walletName}
          </span>
        </div>
        
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black tracking-tighter">
              {Number(item.balance.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-bold opacity-60">{item.balance.currency.code}</span>
          </div>
          <p className="text-[10px] font-bold opacity-40">{item.balance.currency.name}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-3 h-3 opacity-60 shrink-0" />
            <span className="text-[9px] font-bold opacity-60 line-clamp-1">
              {item.walletBranch || mainOfficeText}
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-10 -end-10 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -start-8 w-24 h-24 bg-black/10 rounded-full blur-2xl" />
    </div>
  );
}
