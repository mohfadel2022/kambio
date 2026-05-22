"use client";

import { Download, Loader2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";

type OrderInvoiceProps = {
  order: any;
  translations: any;
};

export function OrderInvoice({ order, translations }: OrderInvoiceProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePreview = () => {
    window.open(`/api/orders/${order.id}/pdf?locale=${locale}`, "_blank");
  };

  const colors = {
    emerald: "#059669",
    emeraldLight: "#ecfdf5",
    slate900: "#0f172a",
    slate600: "#475569",
    slate400: "#94a3b8",
    slate100: "#f1f5f9",
    slate50: "#f8fafc",
    white: "#ffffff",
  };

  const isRtl = translations.invoice === "فاتورة" || translations.invoice.includes("فاتورة");
  const verifyUrl = mounted ? `${window.location.origin}/verify/${order.id}` : "";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 no-print mb-6">
        <button
          onClick={handlePreview}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-slate-900 text-white transition-all hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          {isGenerating ? translations.generating : (translations.previewInvoice || "Vista Previa")}
        </button>
      </div>

      <div 
        id="invoice-capture-area"
        dir={isRtl ? "rtl" : "ltr"}
        style={{ 
          width: "210mm", 
          padding: "40px",
          backgroundColor: colors.white, 
          position: "fixed",
          left: "-9999px",
          top: "0",
          fontFamily: isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif"
        }}
      >
        <div style={{ display: "flex", flexDirection: isRtl ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          <div style={{ textAlign: isRtl ? "right" : "left" }}>
            <div style={{ display: "flex", flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
               <div style={{ backgroundColor: colors.emerald, width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: colors.white, fontWeight: "bold", fontSize: "18px" }}>K</span>
               </div>
               <span style={{ color: colors.emerald, fontSize: "24px", fontWeight: "900", letterSpacing: "-1px" }}>KAMBIO</span>
            </div>
            <div style={{ color: colors.slate600, fontSize: "11px", fontWeight: "600", lineHeight: "1.5" }}>
              <p>Kambio Money Transfer Ltd.</p>
              <p>Madrid, Spain</p>
              <p>contact@kambio.com</p>
            </div>
          </div>
          <div style={{ textAlign: isRtl ? "left" : "right" }}>
            <h1 style={{ color: colors.slate900, fontSize: "32px", fontWeight: "900", margin: "0 0 10px 0" }}>{translations.invoice}</h1>
            <div id="qr-placeholder" style={{ marginTop: "15px", marginBottom: "15px", padding: "10px", backgroundColor: colors.white, border: `1px solid ${colors.slate100}`, borderRadius: "10px", display: "inline-block" }}>
              {mounted && <QRCodeCanvas value={verifyUrl} size={90} level="H" />}
            </div>
            <p style={{ color: colors.slate400, fontSize: "9px", fontWeight: "900", textTransform: "uppercase", margin: "0" }}>{translations.reference}</p>
            <p style={{ color: colors.emerald, fontSize: "20px", fontWeight: "900", margin: "4px 0" }} dir="ltr">#{order.number}</p>
            <p style={{ color: colors.slate600, fontSize: "11px", fontWeight: "600" }}>{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div style={{ 
          backgroundColor: order.status === 'PAID' ? colors.emeraldLight : "#fffbeb",
          border: `1px solid ${order.status === 'PAID' ? colors.emerald : "#d97706"}`,
          color: order.status === 'PAID' ? colors.emerald : "#d97706",
          padding: "10px 20px",
          borderRadius: "10px",
          marginBottom: "40px",
          display: "flex",
          flexDirection: isRtl ? "row-reverse" : "row",
          justifyContent: "space-between",
          fontSize: "11px",
          fontWeight: "900"
        }}>
          <span style={{ textTransform: "uppercase" }}>{translations.status}</span>
          <span>{translations.statusLabel}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "40px", textAlign: isRtl ? "right" : "left" }}>
          <div>
             <p style={{ color: colors.slate400, fontSize: "9px", fontWeight: "900", textTransform: "uppercase", borderBottom: `1px solid ${colors.slate100}`, paddingBottom: "6px", marginBottom: "12px" }}>{translations.sender}</p>
             <p style={{ color: colors.slate900, fontSize: "16px", fontWeight: "900" }}>{order.senderName}</p>
          </div>
          <div>
             <p style={{ color: colors.slate400, fontSize: "9px", fontWeight: "900", textTransform: "uppercase", borderBottom: `1px solid ${colors.slate100}`, paddingBottom: "6px", marginBottom: "12px" }}>{translations.recipient}</p>
             <p style={{ color: colors.slate900, fontSize: "16px", fontWeight: "900" }}>{order.recipientName}</p>
          </div>
        </div>

        <div style={{ border: `1px solid ${colors.slate100}`, borderRadius: "12px", overflow: "hidden", marginBottom: "40px" }}>
           <table style={{ width: "100%", textAlign: isRtl ? "right" : "left", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: colors.slate50, color: colors.slate400, fontSize: "9px", fontWeight: "900", textTransform: "uppercase" }}>
                 <tr>
                    <th style={{ padding: "12px 24px" }}>{translations.description}</th>
                    <th style={{ padding: "12px 24px", textAlign: "center" }}>{translations.rate}</th>
                    <th style={{ padding: "12px 24px", textAlign: isRtl ? "left" : "right" }}>{translations.amount}</th>
                 </tr>
              </thead>
              <tbody style={{ color: colors.slate600, fontSize: "13px", fontWeight: "600" }}>
                 <tr style={{ borderTop: `1px solid ${colors.slate100}` }}>
                    <td style={{ padding: "20px 24px" }}>
                       <p style={{ color: colors.slate900, margin: "0" }}>{translations.moneyTransfer}</p>
                       <p style={{ color: colors.slate400, fontSize: "9px", marginTop: "4px" }}>{order.currencyFrom.code} → {order.currencyTo.code}</p>
                    </td>
                    <td style={{ padding: "20px 24px", textAlign: "center" }}>{Number(order.rate).toFixed(4)}</td>
                    <td style={{ padding: "20px 24px", textAlign: isRtl ? "left" : "right" }}>{order.currencyFrom.symbol}{Number(order.amountFrom).toLocaleString()}</td>
                 </tr>
              </tbody>
              <tfoot style={{ backgroundColor: colors.emerald, color: colors.white }}>
                 <tr>
                    <td colSpan={2} style={{ padding: "20px 24px", fontSize: "13px", fontWeight: "900", textTransform: "uppercase" }}>{translations.totalToReceive}</td>
                    <td style={{ padding: "20px 24px", textAlign: isRtl ? "left" : "right", fontSize: "20px", fontWeight: "900" }}>{order.currencyTo.symbol}{Number(order.amountTo).toLocaleString()}</td>
                 </tr>
              </tfoot>
           </table>
        </div>

        <div style={{ borderTop: `1px solid ${colors.slate100}`, paddingTop: "24px", display: "flex", flexDirection: isRtl ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "flex-end" }}>
           <div style={{ textAlign: isRtl ? "right" : "left" }}>
              <p style={{ color: colors.slate900, fontSize: "10px", fontWeight: "900", textTransform: "uppercase", margin: "0 0 4px 0" }}>{translations.thankYou}</p>
              <p style={{ color: colors.slate400, fontSize: "9px" }}>{translations.systemGenerated}</p>
           </div>
           <p style={{ color: colors.slate400, fontSize: "9px", fontWeight: "bold" }}>{translations.generatedOn} {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </>
  );
}
