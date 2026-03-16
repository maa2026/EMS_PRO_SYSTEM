import { NextResponse } from 'next/server';

export function middleware(request) {
  // User ka role nikalne ke liye (Login ke waqt set hota hai)
  const userRole = request.cookies.get('userRole')?.value; 
  const url = request.nextUrl.pathname;

  // Security: Agar State User (L1) VIP (L2) ke area mein ghusne ki koshish kare
  if (url.startsWith('/portal/vip') && userRole === 'L1') {
    return NextResponse.redirect(new URL('/portal/unauthorized', request.url));
  }

  // Security: Jan Sampark Sathi (L7) sirf apna dashboard dekh sake
  if (url.startsWith('/portal/state') && userRole === 'L7') {
    return NextResponse.redirect(new URL('/portal/jan-sampark/dashboard', request.url));
  }

  return NextResponse.next();
}