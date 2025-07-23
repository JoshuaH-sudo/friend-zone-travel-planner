import { auth } from './lib/auth';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/signin',
  '/signup',
  '/landing',
  '/api/auth',
] 

// Helper function to check if a route is public
const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(`${route}/`)
  );
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Check if the current route is public
  if (isPublicRoute(pathname)) {
    // For public routes, allow access
    return NextResponse.next();
  }

  // For protected routes, check if user is authenticated
  if (!isAuthenticated) {
    // Create the sign-in URL without locale
    const signInUrl = new URL('/signin', req.url);
    
    // Add the current URL as a callback parameter so user can be redirected back after login
    signInUrl.searchParams.set('callbackUrl', req.url);
    
    return NextResponse.redirect(signInUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
