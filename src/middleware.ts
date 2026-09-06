import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Rewrite /uploads/* to /api/uploads/* so uploaded files are served via API route
  if (url.pathname.startsWith('/uploads/')) {
    url.pathname = url.pathname.replace(/^\/uploads\//, '/api/uploads/');
    return NextResponse.rewrite(url);
  }

  // Security headers for all responses
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: blob: https: http:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    '/uploads/:path*',
    // Apply security headers to all routes except api, _next/static, _next/image
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};