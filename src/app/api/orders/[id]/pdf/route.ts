import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { InvoiceLocale } from "@/lib/invoiceTranslations";
import { generatePdfBuffer } from "@/lib/pdfGenerator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const locale = (request.nextUrl.searchParams.get("locale") || "es") as InvoiceLocale;

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, number: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const origin = request.nextUrl.origin;
    const url = `${origin}/${locale}/invoice/${id}`;

    const pdfBuffer = await generatePdfBuffer(url);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Kambio_Factura_${order.number}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}
