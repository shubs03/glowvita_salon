import { NextResponse } from 'next/server';
import { verifyJwt } from '@repo/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (pathname.startsWith('/login')) {
     if (token) {
        const payload = await verifyJwt(token);
        if (payload && payload.role === 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const payload = await verifyJwt(token);
    if (!payload || payload.role !== 'ADMIN') {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        const response = NextResponse.redirect(url);
        response.cookies.delete('token');
        return response;
    }
  } catch (err) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
