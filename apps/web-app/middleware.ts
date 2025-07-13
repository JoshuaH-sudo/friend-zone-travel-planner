import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from './lib/auth';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/landing',
  '/api/auth',
] 

// Helper function to check if a route is public
const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(`${route}/`) ||
    // Handle internationalized routes
    pathname.match(new RegExp(`^/(en|de)${route}$`)) ||
    pathname.match(new RegExp(`^/(en|de)${route}/`))
  );
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Check if the current route is public
  if (isPublicRoute(pathname)) {
    // For public routes, just run the internationalization middleware
    return intlMiddleware(req);
  }

  // For protected routes, check if user is authenticated
  if (!isAuthenticated) {
    // Get the current locale from the pathname or use default
    const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] || routing.defaultLocale;
    
    // Create the sign-in URL with the current locale
    const signInUrl = new URL(`/${locale}/login`, req.url);
    
    // Add the current URL as a callback parameter so user can be redirected back after login
    signInUrl.searchParams.set('callbackUrl', req.url);
    
    return NextResponse.redirect(signInUrl);
  }

  // User is authenticated, run the internationalization middleware
  return intlMiddleware(req);
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};