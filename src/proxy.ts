import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {auth} from "@/auth-edge";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const session = await auth();
  const isAuth = !!session;
  
  // Extract locale and path
  const pathname = request.nextUrl.pathname;
  
  // Define public/auth routes
  const isLoginPage = pathname.includes("/login");
  const isApiAuth = pathname.includes("/api/auth");
  const isInvoicePage = pathname.includes("/invoice/");
  const isVerifyPage = pathname.includes("/verify/");
  const isPublicAsset = pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/);

  if (isApiAuth || isPublicAsset) {
    return NextResponse.next();
  }

  // If not authenticated and trying to access protected route, redirect to login
  // Note: next-intl will add the locale prefix automatically if we use its redirect
  if (!isAuth && !isLoginPage && !isInvoicePage && !isVerifyPage) {
    // If we're at root, the intlMiddleware will redirect to /[locale]/dashboard
    // but here we need to force login
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // If authenticated and on login page, go to dashboard
  if (isAuth && isLoginPage) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Handle internationalization
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_static (inside /public)
    // - all root files inside /public (e.g. /favicon.ico)
    '/((?!api|_next|_static|_vercel|.*\\..*).*)',
    // However, we want to match the root and locale-prefixed routes
    '/',
    '/(ar|es)/:path*'
  ],
};
