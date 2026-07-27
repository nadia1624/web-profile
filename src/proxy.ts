import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all routes starting with /admin
  const isAdminPath = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  if (isAdminPath) {
    const sessionCookie = request.cookies.get('nadia_session')?.value;
    const verifiedToken = sessionCookie ? await verifyJWT(sessionCookie) : null;

    if (!verifiedToken) {
      if (!isLoginPage) {
        // Redirect unauthenticated user to login screen
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    } else {
      if (isLoginPage) {
        // Redirect authenticated user back to the admin dashboard
        const dashboardUrl = new URL('/admin', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  return NextResponse.next();
}

// Default export compatibility
export default proxy;

export const config = {
  matcher: ['/admin/:path*'],
};
