"use client";

import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

type OrderQRCodeProps = {
  orderId: string;
  orderNumber: string;
  translations: {
    verification: string;
    qrDesc: string;
  };
};

export function OrderQRCode({ orderId, orderNumber, translations }: OrderQRCodeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="card-rounded p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 card-shadow flex flex-col items-center text-center no-print">
        <div className="w-[150px] h-[150px] bg-slate-50 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const verifyUrl = `${window.location.origin}/verify/${orderId}`;

  return (
    <div className="card-rounded p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 card-shadow flex flex-col items-center text-center no-print">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50">{translations.verification}</h3>
      </div>
      
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-inner">
        <QRCodeSVG 
          value={verifyUrl}
          size={140}
          level="H"
          includeMargin={false}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold leading-relaxed text-muted-foreground max-w-[200px]">
          {translations.qrDesc}
        </p>
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
          #{orderNumber}
        </p>
      </div>
    </div>
  );
}
