import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/routing";
import { CheckCircle2, XCircle, FileText, Calendar, User, Calculator, ArrowLeftRight, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function VerifyInvoicePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("Verify");
  const dash = await getTranslations("Dashboard");
  const session = await auth();
  const role = (session?.user as any)?.role?.toLowerCase() || '';
  const canEdit = role === 'admin' || role === 'cash';

  let order = null;
  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: {
        currencyFrom: true,
        currencyTo: true,
      },
    });
  } catch (error) {
    console.error("Verification Error:", error);
  }

  // The isRtl logic relies on the locale
  const isAr = locale === "ar";
  
  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl p-10 max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t("invalid")}</h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
            {t("notFound")}
          </p>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; bg: string }> = {
    PENDING: { color: "hsl(38,92%,50%)", bg: "rgba(245,158,11,0.1)" },
    VERIFIED: { color: "hsl(217,91%,60%)", bg: "rgba(59,130,246,0.1)" },
    PAID: { color: "hsl(142,71%,45%)", bg: "rgba(34,197,94,0.1)" },
    CANCELLED: { color: "hsl(0,72%,51%)", bg: "rgba(239,68,68,0.1)" },
  };
  const sc = statusConfig[order.status] || statusConfig.PENDING;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Verification Badge */}
        <div className="flex flex-col items-center justify-center mb-8 text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("validInvoice")}
            </h1>
            <p className="text-emerald-600 dark:text-emerald-500 font-bold text-sm mt-1">
              Kambio Money Transfer Ltd.
            </p>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden relative">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="text-center sm:text-start">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{t("title")}</p>
              <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tighter" dir="ltr">#{order.number}</p>
            </div>
            <Badge
              variant="outline"
              className="font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full"
              style={{ background: sc.bg, color: sc.color, borderColor: "transparent" }}
            >
              {dash(order.status.toLowerCase())}
            </Badge>
          </div>

          <div className="p-8 space-y-8">
            {/* Amount Summary */}
            <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Calculator className="w-32 h-32" />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 z-10">{t("amount")}</p>
              <div className="flex items-end justify-center gap-2 z-10" dir="ltr">
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter">
                  {order.currencyTo.symbol}{Number(order.amountTo).toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-500 mb-2">{order.currencyTo.code}</span>
              </div>
            </div>

            {/* Grid Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-4 h-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t("sender")}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{order.senderName}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-4 h-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t("recipient")}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{order.recipientName}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <ArrowLeftRight className="w-4 h-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t("amountSent")}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white" dir="ltr">
                  {order.currencyFrom.symbol}{Number(order.amountFrom).toLocaleString()} {order.currencyFrom.code}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t("date")}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "es-ES")}
                </p>
              </div>
            </div>

          </div>

          {/* Footer Logo */}
          <div className="bg-slate-900 text-white p-6 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 w-6 h-6 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold font-[family-name:var(--font-inter)]">K</span>
              </div>
              <span className="text-emerald-500 text-lg font-bold tracking-tight font-[family-name:var(--font-inter)]">KAMBIO</span>
            </div>
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Verified Secure</p>
          </div>

        </div>

        {/* Admin/Cash Action */}
        {canEdit && (
          <div className="mt-8 flex justify-center no-print">
            <Link
              href={`/dashboard/orders/${order.id}/edit`}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20 text-white"
              style={{
                background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))",
              }}
            >
              <Edit2 className="w-5 h-5" />
              {t("payOrEdit")}
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
