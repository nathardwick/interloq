import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookieHeader, verifyToken } from '@/lib/jwt';

const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API auth routes, static assets, and Next.js internals
  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    /\.(?:svg|ico|png|jpg|jpeg|css|js|woff2?|ttf|eot|webp|gif)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Allow public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Check JWT
  const token = getTokenFromCookieHeader(request.headers.get('cookie'));
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|ico|png|jpg|jpeg|css|js|woff2?|ttf|eot|webp|gif)$).*)'],
};
