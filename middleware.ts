import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Keep old staff sign-in links working; all roles now share /login.
// Portal layouts and the backend guards enforce role access.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
