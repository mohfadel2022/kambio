import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getInvoiceT, type InvoiceLocale } from "@/lib/invoiceTranslations";
import { QRCodeSVG } from "qrcode.react";

import { CAIRO_REGULAR } from "@/lib/fonts";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getInvoiceT(locale as InvoiceLocale);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      currencyFrom: true,
      currencyTo: true,
    },
  });

  const company = await (prisma as any).company?.findUnique({
    where: { id: "1" }
  });

  if (!order) {
    notFound();
  }

  const isAr = locale === "ar";
  // En Next.js App Router, el layout.tsx ya asigna el atributo dir="rtl" al tag <html>
  // y también asigna la clase de la fuente (Cairo para árabe, Inter para español).
  
  // URL absoluta para el código QR
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  // En producción, es ideal que process.env.NEXT_PUBLIC_APP_URL esté definido
  const host = process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";
  const verifyUrl = `${protocol}://${host}/verify/${id}`;

  const statusColors: Record<string, string> = {
    PAID: "bg-emerald-50 text-emerald-600 border-emerald-600",
    VERIFIED: "bg-blue-50 text-blue-600 border-blue-600",
    PENDING: "bg-amber-50 text-amber-600 border-amber-600",
    CANCELLED: "bg-red-50 text-red-600 border-red-600",
  };

  const sc = statusColors[order.status] || statusColors.PENDING;
  const date = new Date(order.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "es-ES");

  return (
    <div 
      className="min-h-screen bg-slate-100 flex justify-center py-8 print:bg-white print:py-0 print:block"
      style={{ fontFamily: 'Inter, Cairo, sans-serif' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'Cairo';
          src: url('${CAIRO_REGULAR}') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}} />
      {/* Contenedor de la Factura (A4) */}
      <div className="bg-white w-[210mm] h-[297mm] p-[40px] shadow-lg print:shadow-none print:w-full print:h-full relative flex flex-col overflow-hidden">
        
        {/* Header with Company Logo & Info */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <span className="text-white text-xl font-black">K</span>
              </div>
              <div className="flex flex-col">
                <span className="text-emerald-800 dark:text-emerald-600 text-2xl font-black tracking-tighter leading-none">
                  {company?.name || "KAMBIO"}
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Platform</span>
              </div>
            </div>
            <div className="text-slate-500 text-[10px] font-semibold space-y-1">
              <p>{company?.address || "Madrid, Spain"}</p>
              <p>{company?.phone || "contact@kambio.app"}</p>
              <p>{company?.email || ""}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="p-1.5 bg-white border border-slate-100 rounded-xl mb-3 shadow-sm">
              <QRCodeSVG value={verifyUrl} size={80} level="H" />
            </div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] mb-1">{t.invoiceLabel}</p>
            <p className="text-emerald-600 text-2xl font-black tracking-tighter" dir="ltr">#{order.number}</p>
            <p className="text-slate-400 text-[10px] font-bold mt-1">{date}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-8 flex justify-center">
          <span className={`inline-block px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${sc}`}>
            {t.statuses[order.status as keyof typeof t.statuses] || order.status}
          </span>
        </div>

        {/* Parties - Sender & Recipient */}
        <div className="grid grid-cols-2 gap-8 mb-8 p-6 rounded-[1.5rem] border border-slate-100 bg-slate-50/30">
          <div className="space-y-2">
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] border-b border-slate-100 pb-2 mb-3">{t.sender}</p>
            <p className="text-slate-900 text-lg font-black">{order.senderName}</p>
          </div>
          <div className="space-y-2">
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] border-b border-slate-100 pb-2 mb-3">{t.recipient}</p>
            <p className="text-slate-900 text-lg font-black">{order.recipientName}</p>
          </div>
        </div>

        {/* Financial Details - Modern Listing Style */}
        <div className="flex-1">
          <div className="flex flex-col items-center gap-6 p-8 rounded-[2rem] border border-slate-100 bg-slate-50/50 shadow-inner relative overflow-hidden max-w-2xl mx-auto">
             {/* Decorative Background Pattern */}
             <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -mr-24 -mt-24" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mb-16" />

             {/* Amount FROM */}
             <div className="text-center w-full relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">{locale === 'es' ? 'ENVÍA' : 'SENDS'}</p>
                <p className="font-black text-3xl tracking-tighter text-slate-900">
                  {order.currencyFrom.symbol}{Number(order.amountFrom).toLocaleString(isAr ? "ar-DZ" : "es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] font-black opacity-40 mt-1">{order.currencyFrom.code}</p>
             </div>

             {/* Rate and Flow */}
             <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-lg text-emerald-600">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                   </svg>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                   <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
                     {t.colRate}: {Number(order.rate).toFixed(4)}
                   </p>
                </div>
             </div>

             {/* Amount TO */}
             <div className="text-center w-full relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">{t.totalReceived}</p>
                <p className="font-black text-4xl tracking-tighter text-emerald-600">
                  {order.currencyTo.symbol}{Number(order.amountTo).toLocaleString(isAr ? "ar-DZ" : "es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] font-black opacity-40 mt-1">{order.currencyTo.code}</p>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-end">
          <div>
            <p className="text-slate-900 text-xs font-black uppercase tracking-widest mb-2">{t.thanks}</p>
            <p className="text-slate-400 text-[9px] font-medium max-w-xs leading-relaxed">{t.autoDoc}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
              {t.generatedOn}
            </p>
            <p className="text-slate-900 text-[10px] font-bold">
              {new Date().toLocaleString(isAr ? "ar-DZ" : "es-ES")}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

