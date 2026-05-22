import puppeteer from "puppeteer";

export async function generatePdfBuffer(url: string): Promise<Uint8Array> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    
    // Configuramos el viewport al tamaño de un A4 para asegurar buen renderizado
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    
    // Navegamos y esperamos a que carguen las fuentes (networkidle2 tolera WebSockets de dev)
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
