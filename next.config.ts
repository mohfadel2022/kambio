import createNextIntlPlugin from 'next-intl/plugin';
import os from 'os';
 
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Detect local IP addresses to allow them in development
const localIPs = Object.values(os.networkInterfaces())
  .flat()
  .filter((iface) => iface?.family === 'IPv4' && !iface.internal)
  .map((iface) => iface?.address)
  .filter(Boolean) as string[];
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [...localIPs, "localhost", "127.0.0.1"],
  serverExternalPackages: ["nodemailer", "@react-pdf/renderer", "qrcode"],
};
 
export default withNextIntl(nextConfig);
// Trigger reload 2026-05-09T23:30:00
