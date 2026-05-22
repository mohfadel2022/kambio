import { deleteOrder } from "@/app/actions/orders";
import { DataTableActions } from "@/components/DataTableActions";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function OrderActions({ order }: { order: any }) {
  const t = useTranslations("Orders");
  const tDashboard = useTranslations("Dashboard");

  const handleDelete = async (orderId: string) => {
    await deleteOrder(orderId);
  };

  const handleWhatsapp = async () => {
    if (!order.senderPhone) {
      toast.error("El remitente no tiene un número de teléfono registrado");
      return;
    }

    // Prepare translated status
    const translatedStatus = tDashboard(order.status.toLowerCase());

    // Prepare message with translations
    const message = encodeURIComponent(
      t("whatsappGreeting", { name: order.senderName, number: order.number }) + "\n\n" +
      t("whatsappSent", { 
        symbol: order.currencyFrom.symbol, 
        amount: Number(order.amountFrom).toFixed(2), 
        code: order.currencyFrom.code 
      }) + "\n" +
      t("whatsappReceived", { 
        symbol: order.currencyTo.symbol, 
        amount: Number(order.amountTo).toFixed(2), 
        code: order.currencyTo.code 
      }) + "\n" +
      t("whatsappStatus", { status: translatedStatus }) + "\n\n" +
      t("whatsappThanks")
    );

    // Try to get PDF for attachment
    let pdfFile: File | null = null;
    let blob: Blob | null = null;
    try {
      const pdfRes = await fetch(`/api/orders/${order.id}/pdf`);
      if (pdfRes.ok) {
        blob = await pdfRes.blob();
        // Use a clean filename and the exact blob type
        const fileName = `Factura-Kambio-${order.number}.pdf`;
        pdfFile = new File([blob], fileName, { type: blob.type || "application/pdf" });
      }
    } catch (e) {
      console.error("Failed to fetch PDF for WhatsApp share:", e);
    }

    // Use Web Share API if available (Mobile & HTTPS)
    if (navigator.share && pdfFile) {
      const shareData: ShareData = {
        files: [pdfFile],
        title: `Factura Kambio ${order.number}`,
        text: t("whatsappFileText", { name: order.senderName, number: order.number }),
      };

      // Check if the browser actually supports sharing this specific file
      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return; // Success
        } catch (err) {
          // If user cancels or share fails, we continue to fallback
          console.log("Share failed or cancelled:", err);
        }
      }
    }

    // Fallback: Download + wa.me
    // This happens if navigator.share is not available (Desktop, non-HTTPS) 
    // or if the browser doesn't support sharing files.
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Factura_Kambio_${order.number}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    // Clean phone number (remove +, spaces, etc.)
    const cleanPhone = order.senderPhone.replace(/\D/g, "");

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${t("invoice")} #${order.number} - Kambio`);
    const body = encodeURIComponent(
      t("whatsappGreeting", { name: order.senderName, number: order.number }) + "\n\n" +
      t("whatsappSent", { 
        symbol: order.currencyFrom.symbol, 
        amount: Number(order.amountFrom).toFixed(2), 
        code: order.currencyFrom.code 
      }) + "\n" +
      t("whatsappReceived", { 
        symbol: order.currencyTo.symbol, 
        amount: Number(order.amountTo).toFixed(2), 
        code: order.currencyTo.code 
      }) + "\n\n" +
      t("thankYou")
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const isVerifiable = order.status === "VERIFIED" || order.status === "PAID";
  const availableActions: any[] = ["view", "edit"];
  
  if (isVerifiable) {
    availableActions.push("whatsapp");
    availableActions.push("send");
  }
  
  availableActions.push("delete");

  return (
    <DataTableActions
      id={order.id}
      baseUrl="/dashboard/orders"
      onDelete={handleDelete}
      onWhatsapp={handleWhatsapp}
      onSend={handleEmail}
      actions={availableActions}
      labels={{
        whatsapp: t("sendWhatsApp"),
        send: t("sendEmail")
      }}
    />
  );
}
