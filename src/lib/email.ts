import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { getInvoiceT, type InvoiceLocale } from "@/lib/invoiceTranslations";
import { generatePdfBuffer } from "@/lib/pdfGenerator";

// Gmail App Passwords are displayed with spaces (e.g. "xxxx xxxx xxxx xxxx")
// but the actual password used by SMTP has no spaces.
const appPassword = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s/g, "");

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: appPassword,
  },
});

export type InvoiceEmailOrder = {
  id: string;
  number: string;
  senderName: string;
  recipientName: string;
  amountFrom: number;
  amountTo: number;
  rate: number;
  status: string;
  notes?: string | null;
  currencyFrom: { code: string; symbol: string };
  currencyTo: { code: string; symbol: string };
  createdAt: string | Date;
};

export async function sendInvoiceEmail({
  to,
  order,
  verifyUrl,
  locale = "es",
}: {
  to: string;
  order: InvoiceEmailOrder;
  verifyUrl: string;
  locale?: InvoiceLocale;
}) {
  const t = getInvoiceT(locale);
  const fromLabel = `${process.env.GMAIL_FROM_NAME || "Kambio"} <${process.env.GMAIL_USER}>`;
  const isRtl = locale === "ar";
  const dir = isRtl ? 'dir="rtl"' : "";

  // Generate QR code as base64 PNG for the PDF
  console.log("[EMAIL] Generating QR code...");
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  console.log("[EMAIL] QR code generated.");

  // URL para acceder al HTML que puppeteer va a imprimir
  // En producción usamos la URL real. En local usamos localhost:3000
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";
  const invoiceHtmlUrl = `${protocol}://${host}/${locale}/invoice/${order.id}`;

  console.log("[EMAIL] Rendering PDF via Puppeteer...");
  const pdfBuffer = await generatePdfBuffer(invoiceHtmlUrl);
  console.log("[EMAIL] PDF generated successfully.");

  const numLocale = locale === "ar" ? "ar-DZ" : "es-ES";
  const alignEnd = isRtl ? "left" : "right";

  const html = `<!DOCTYPE html>
<html lang="${locale}" ${dir}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
  <title>${t.emailSubject(order.number)}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:${isRtl ? "'Cairo', sans-serif" : "'Inter', 'Arial', sans-serif"};" ${dir}>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#064e3b,#059669);padding:40px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <span style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 18px;color:#ffffff;font-size:22px;font-weight:900;">KAMBIO</span>
                <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:8px 0 0;">Kambio Money Transfer</p>
              </td>
              <td align="${alignEnd}">
                <p style="color:rgba(255,255,255,0.6);font-size:10px;margin:0;text-transform:uppercase;letter-spacing:2px;">${t.invoiceLabel}</p>
                <p style="color:#ffffff;font-size:24px;font-weight:900;margin:4px 0 0;">#${order.number}</p>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:48px;">
            <p style="color:#0f172a;font-size:16px;font-weight:700;margin:0 0 8px;">${t.emailGreeting(order.senderName)}</p>
            <p style="color:#64748b;font-size:14px;margin:0 0 32px;">${t.emailBody}</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:32px;">
              <tr style="background:#e2e8f0;">
                <td style="padding:12px 24px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;">${t.emailDetail}</td>
                <td style="padding:12px 24px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;text-align:${alignEnd};">${t.emailValue}</td>
              </tr>
              <tr>
                <td style="padding:16px 24px;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;">${t.emailOrderRef}</td>
                <td style="padding:16px 24px;font-size:13px;color:#0f172a;font-weight:900;text-align:${alignEnd};border-bottom:1px solid #e2e8f0;">#${order.number}</td>
              </tr>
              <tr>
                <td style="padding:16px 24px;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;">${t.emailAmountSent}</td>
                <td style="padding:16px 24px;font-size:13px;color:#0f172a;font-weight:900;text-align:${alignEnd};border-bottom:1px solid #e2e8f0;">${Number(order.amountFrom).toFixed(2)} ${order.currencyFrom.code}</td>
              </tr>
              <tr>
                <td style="padding:16px 24px;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;">${t.emailRecipient}</td>
                <td style="padding:16px 24px;font-size:13px;color:#0f172a;font-weight:900;text-align:${alignEnd};border-bottom:1px solid #e2e8f0;">${order.recipientName}</td>
              </tr>
              <tr style="background:#ecfdf5;">
                <td style="padding:20px 24px;font-size:14px;color:#059669;font-weight:900;">${t.emailTotal}</td>
                <td style="padding:20px 24px;font-size:20px;color:#059669;font-weight:900;text-align:${alignEnd};">${Number(order.amountTo).toLocaleString(numLocale)} ${order.currencyTo.code}</td>
              </tr>
            </table>

            <p style="color:#94a3b8;font-size:11px;text-align:center;margin:0;">${t.emailAttachNote}</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f1f5f9;padding:24px 48px;text-align:center;">
            <p style="color:#94a3b8;font-size:10px;margin:0;">${t.emailFooter}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: fromLabel,
    to,
    subject: t.emailSubject(order.number),
    html,
    attachments: [
      {
        filename: `Kambio_Factura_${order.number}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
