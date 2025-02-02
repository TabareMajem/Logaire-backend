//src/middleware.ts -->

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// export async function middleware(request: NextRequest) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req: request, res });

//   // Refresh session if expired
//   await supabase.auth.getSession();

//   // Auth routes - redirect to dashboard if logged in
//   if (request.nextUrl.pathname.startsWith('/auth')) {
//     const { data: { session } } = await supabase.auth.getSession();
//     if (session) {
//       return NextResponse.redirect(new URL('/app/dashboard', request.url));
//     }
//     return res;
//   }

//   // Protected routes
//   if (request.nextUrl.pathname.startsWith('/app')) {
//     const { data: { session } } = await supabase.auth.getSession();
//     if (!session) {
//       return NextResponse.redirect(new URL('/auth/login', request.url));
//     }

//     // Admin routes protection
//     if (request.nextUrl.pathname.startsWith('/app/admin') && 
//         session.user.user_metadata.role !== 'admin') {
//       return NextResponse.redirect(new URL('/app/dashboard', request.url));
//     }
//   }

//   return res;
// }


export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // Auth routes - redirect to dashboard if logged in
  if (request.nextUrl.pathname.startsWith('/auth')) {
    if (session) {
      return NextResponse.redirect(new URL('/app/dashboard', request.url));
    }
    return res;
  }

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/app')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Admin routes protection
    if (
      request.nextUrl.pathname.startsWith('/app/admin') &&
      session.user.user_metadata.role !== 'admin'
    ) {
      return NextResponse.redirect(new URL('/app/dashboard', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/auth/:path*', '/app/:path*']
};