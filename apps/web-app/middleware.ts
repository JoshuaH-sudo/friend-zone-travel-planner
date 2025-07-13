import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

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

function isPublicRoute(pathname: string): boolean {
  // Remove locale prefix if present (e.g., /en/login -> /login)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  
  return publicRoutes.some(route => 
    pathWithoutLocale.startsWith(route) || pathname.includes(route)
  );
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth check for public routes
  if (isPublicRoute(pathname)) {
    return intlMiddleware(request);
  }

  // Handle root path redirects based on authentication
  if (pathname === '/' || pathname.match(/^\/[a-z]{2}\/?$/)) {
    const session = await auth();
    const localeMatch = pathname.match(/^\/([a-z]{2})/);
    const locale = localeMatch ? localeMatch[1] : 'en';
    
    if (session) {
      // Redirect authenticated users to trips
      const tripsUrl = new URL(`/${locale}/trips`, request.url);
      return NextResponse.redirect(tripsUrl);
    } else {
      // Redirect unauthenticated users to login
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if the route is under /trips (including nested routes)
  const isTripsRoute = pathname.includes('/trips');
  
  if (isTripsRoute) {
    const session = await auth();
    
    if (!session) {
      // Extract locale from pathname if present
      const localeMatch = pathname.match(/^\/([a-z]{2})\//);
      const locale = localeMatch ? localeMatch[1] : 'en';
      
      // Redirect to login page with locale
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
