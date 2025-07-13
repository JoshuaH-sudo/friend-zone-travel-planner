import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth check for auth-related routes and API routes
  if (
    pathname.includes('/api/auth') ||
    pathname.includes('/login') ||
    pathname.includes('/signup') ||
    pathname.includes('/_next') ||
    pathname.includes('/_vercel') ||
    pathname.includes('/favicon.ico')
  ) {
    return intlMiddleware(request);
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
