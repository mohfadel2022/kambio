"use client";

import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { sendOrderEmail } from "@/app/actions/email";
import { useLocale } from "next-intl";

type SendEmailButtonProps = {
  orderId: string;
  order: any;
  translations: {
    sendEmail: string;
  };
};

export function SendEmailButton({ orderId, order, translations }: SendEmailButtonProps) {
  const email = order.sender?.email;
  const locale = useLocale() as "es" | "ar";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSend = async () => {
    if (!email) return;
    setStatus("sending");

    const result = await sendOrderEmail(orderId, {
      id: orderId,
      number: order.number,
      senderName: order.senderName,
      recipientName: order.recipientName,
      amountFrom: Number(order.amountFrom),
      amountTo: Number(order.amountTo),
      rate: Number(order.rate),
      status: order.status,
      notes: order.notes,
      currencyFrom: order.currencyFrom,
      currencyTo: order.currencyTo,
      createdAt: order.createdAt,
      locale,
      email,
    });

    if (result.success) {
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 4000);
    } else {
      console.error("Email error:", result.message);
      alert(`Error al enviar: ${result.message}`);
      setStatus("error");
    }
  };

  const isReady = order.status === "VERIFIED" || order.status === "PAID";
  const isDisabled = !email || status === "sending" || status === "sent" || !isReady;

  return (
    <button
      onClick={handleSend}
      disabled={isDisabled}
      title={!email ? "Este cliente no tiene email registrado" : `Enviar a ${email}`}
      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-black transition-all shadow-sm w-full
        ${!email || !isReady
          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-80"
          : status === "sent"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
          : status === "error"
          ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:scale-95"
          : "bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 active:scale-95"
        }`}
    >
      {status === "sending" && <Loader2 className="w-5 h-5 animate-spin" />}
      {status === "sent" && <CheckCircle2 className="w-5 h-5" />}
      {status === "error" && <AlertCircle className="w-5 h-5" />}
      {status === "idle" && <Mail className={`w-5 h-5 ${!email ? "opacity-30" : ""}`} />}

      {status === "sending" && "Enviando..."}
      {status === "sent" && "¡Email enviado!"}
      {status === "error" && "Error — Reintentar"}
      {status === "idle" && (translations.sendEmail || "Enviar por Email")}
    </button>
  );
}
