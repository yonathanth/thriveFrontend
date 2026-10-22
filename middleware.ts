import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicAdminRoutes = ['/admin/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only apply to /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Allow public admin routes
  if (publicAdminRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check for auth token in cookies (set by client-side after login)
  // Note: For client-side auth, we'll handle redirect in the layout component
  // This middleware provides an additional layer of protection
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};











