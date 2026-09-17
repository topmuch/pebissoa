import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Serve uploaded files through /api/serve-image/[filename] — a single-segment
  // route that is reliable in Next.js standalone builds (Docker/Coolify).
  // The catch-all /api/uploads/[...path] stays as a fallback but has proven
  // unreliable in standalone mode, so both public URLs are rewritten here:
  //   /uploads/<file>      (historical URLs, seed data)
  //   /api/uploads/<file>  (URLs returned by POST /api/upload)
  if (url.pathname.startsWith('/uploads/') || url.pathname.startsWith('/api/uploads/')) {
    const filename = url.pathname.replace(/^\/(api\/)?uploads\//, '');
    if (filename && !filename.includes('/')) {
      url.pathname = `/api/serve-image/${filename}`;
      return NextResponse.rewrite(url);
    }
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
    '/api/uploads/:path*',
    // Apply security headers to all routes except api, _next/static, _next/image
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
