
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Bypassing all authentication checks for development
  return NextResponse.next();
}

export const config = {
  // We still match all paths to ensure this middleware runs, but it will do nothing
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
