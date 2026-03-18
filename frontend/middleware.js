import { NextResponse } from 'next/server';

// Role → home dashboard path
const ROLE_HOME = {
  L0: '/dashboard/admin/main',
  L1: '/dashboard/admin/state',
  L2: '/zone-monitor',
  L3: '/district-admin',
  L4: '/dashboard/constituency',
  L5: '/warriors-node',
  L6: '/warriors-node',
  L7: '/jan-sampark/voter-intelligence',
  admin: '/admin',
  'super-admin': '/dashboard/admin/main',
};

// Protected routes and their allowed roles (higher roles can access lower routes too)
const PROTECTED_ROUTES = [
  { path: '/dashboard/admin/main',   roles: ['L0', 'super-admin'] },
  { path: '/dashboard/admin/state',  roles: ['L0', 'L1', 'super-admin'] },
  { path: '/dashboard/admin/zone',   roles: ['L0', 'L1', 'L2', 'super-admin'] },
  { path: '/dashboard/constituency', roles: ['L0', 'L1', 'L2', 'L3', 'L4', 'super-admin'] },
  { path: '/dashboard/search-booth', roles: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'super-admin'] },
  { path: '/zone-monitor',           roles: ['L0', 'L1', 'L2', 'super-admin'] },
  { path: '/district-admin',         roles: ['L0', 'L1', 'L2', 'L3', 'super-admin'] },
  { path: '/warriors-node',          roles: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'super-admin'] },
  { path: '/jan-sampark',            roles: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'super-admin'] },
  { path: '/war-room',               roles: ['L0', 'L1', 'super-admin'] },
  { path: '/chat',                   roles: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'super-admin', 'admin'] },
  { path: '/tracking',               roles: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'super-admin', 'admin'] },
  { path: '/voters',                 roles: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'super-admin', 'admin'] },
  { path: '/admin',                  roles: ['L0', 'super-admin', 'admin'] },
];

export function middleware(request) {
  const userRole = request.cookies.get('userRole')?.value;
  const url = request.nextUrl.pathname;

  // Already logged in → skip login page, go to dashboard
  if (url === '/login' && userRole && ROLE_HOME[userRole]) {
    return NextResponse.redirect(new URL(ROLE_HOME[userRole], request.url));
  }

  // Check protected routes
  for (const route of PROTECTED_ROUTES) {
    if (url.startsWith(route.path)) {
      // Not logged in → redirect to login
      if (!userRole) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // Wrong role → redirect to own dashboard
      if (!route.roles.includes(userRole)) {
        const homePath = ROLE_HOME[userRole] || '/login';
        return NextResponse.redirect(new URL(homePath, request.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/zone-monitor',
    '/zone-monitor/:path*',
    '/district-admin',
    '/district-admin/:path*',
    '/warriors-node',
    '/warriors-node/:path*',
    '/jan-sampark/:path*',
    '/war-room',
    '/war-room/:path*',
    '/chat',
    '/chat/:path*',
    '/tracking',
    '/tracking/:path*',
    '/voters',
    '/voters/:path*',
    '/admin',
    '/admin/:path*',
  ],
};