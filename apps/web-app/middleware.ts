import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

// Define public routes that don't require authentication
const publicRoutes = [
  '/api/auth',
  '/login',
  '/signup',
  '/landing',
  '/_next',
  '/_vercel',
  '/favicon.ico'
];

// Helper function to check if a route is public
function isPublicRoute(pathname: string): boolean {
  // Check direct matches first
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return true;
  }
  
  // Check with locale removed (e.g., /en/login -> /login)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, '/');
  return publicRoutes.some(route => pathWithoutLocale.startsWith(route));
}

// Helper function to extract locale from pathname
function getLocaleFromPathname(pathname: string): string {
  const localeMatch = pathname.match(/^\/([a-z]{2})\//);
  return localeMatch ? localeMatch[1] : 'en';
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth check for public routes
  if (isPublicRoute(pathname)) {
    return intlMiddleware(request);
  }

  // Handle root redirect (only for exact root paths)
  if (pathname === '/' || pathname.match(/^\/[a-z]{2}$/)) {
    try {
      const token = await getToken({ req: request });
      const locale = pathname.match(/^\/([a-z]{2})$/) ? pathname.slice(1) : 'en';
      
      if (token) {
        // Redirect authenticated users to trips
        const tripsUrl = new URL(`/${locale}/trips`, request.url);
        return NextResponse.redirect(tripsUrl);
      } else {
        // Redirect unauthenticated users to login
        const loginUrl = new URL(`/${locale}/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // If token check fails, redirect to login
      const locale = pathname.match(/^\/([a-z]{2})$/) ? pathname.slice(1) : 'en';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if the route requires authentication (trips and other protected routes)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  const requiresAuth = pathWithoutLocale.startsWith('/trips');
  
  if (requiresAuth) {
    try {
      const token = await getToken({ req: request });
      
      if (!token) {
        const locale = getLocaleFromPathname(pathname);
        const loginUrl = new URL(`/${locale}/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // If token check fails, redirect to login
      const locale = getLocaleFromPathname(pathname);
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
