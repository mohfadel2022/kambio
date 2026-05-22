"use server";

import { sendInvoiceEmail, type InvoiceEmailOrder } from "@/lib/email";
import { headers } from "next/headers";
import type { InvoiceLocale } from "@/lib/invoiceTranslations";

export async function sendOrderEmail(orderId: string, order: InvoiceEmailOrder & { email: string; locale?: InvoiceLocale }) {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const verifyUrl = `${protocol}://${host}/verify/${orderId}`;
    console.log("[ACTION] Sending email for order:", orderId, "Verify URL:", verifyUrl);
    
    await sendInvoiceEmail({
      to: order.email,
      order,
      verifyUrl,
      locale: order.locale ?? "es",
    });

    return { success: true };
  } catch (error: any) {
    const msg = error?.message || "Unknown error";
    console.error("Email send error:", msg);
    return { success: false, message: msg };
  }
}
