import { NextResponse } from 'next/server';

export function proxy() {
  // Pass through to the next proxy/handler
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
