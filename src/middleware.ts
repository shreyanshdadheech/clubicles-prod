import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('🔍 Middleware: Processing request to:', pathname)
  
  // Skip protection for public routes
  const isPublicRoute = pathname.startsWith('/auth/') ||
                       pathname.startsWith('/signin') ||
                       pathname.startsWith('/admin') ||
                       pathname.startsWith('/signup') ||
                       pathname.startsWith('/verify-email') ||
                       pathname.startsWith('/reset-password') ||
                       pathname.startsWith('/forgot-password') ||
                       pathname.startsWith('/about') ||
                       pathname.startsWith('/contact') ||
                       pathname.startsWith('/pricing') ||
                       pathname.startsWith('/privacy') ||
                       pathname === '/' ||
                       pathname.startsWith('/_next') ||
                       pathname.startsWith('/api/health') ||
                       pathname.startsWith('/api/spaces') ||
                       pathname.startsWith('/api/search-suggestions') ||
                       pathname.startsWith('/api/auth/') ||
                       pathname.startsWith('/api/email/') ||
                       pathname.startsWith('/api/reviews') ||
                       pathname.startsWith('/api/debug') ||
                       pathname.startsWith('/api/test') ||
                       pathname.startsWith('/api/check') ||
                       pathname.startsWith('/spaces');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check for JWT token in cookies
  const token = request.cookies.get('auth_token')?.value;
  console.log('🔍 Middleware: Cookie value:', token ? token.substring(0, 20) + '...' : 'No token')
  
  if (!token) {
    console.log('🔍 Middleware: No token found, redirecting to signin')
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/signin';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Verify the token and check role-based access
  try {
    console.log('🔍 Middleware: Verifying token:', token.substring(0, 20) + '...')
    
    const secret = new TextEncoder().encode('your-super-secret-jwt-key-change-this-in-production');
    const { payload } = await jwtVerify(token, secret);
    console.log('🔍 Middleware: Decoded token:', payload)
    
    if (!payload) {
      throw new Error('Invalid token');
    }

    // Role-based access control
    const userRole = payload.roles;
    console.log('🔍 Middleware: User role:', userRole)
    
    // Check if user is trying to access owner routes
    if (pathname.startsWith('/owner')) {
      console.log('🔍 Middleware: Checking owner access for role:', userRole)
      console.log('🔍 Middleware: User payload:', payload)
      if (userRole !== 'owner' && userRole !== 'admin') {
        console.log('🔍 Middleware: Access denied, redirecting based on role:', userRole)
        // Redirect to appropriate dashboard based on role
        const redirectUrl = request.nextUrl.clone();
        if (userRole === 'user') {
          redirectUrl.pathname = '/dashboard';
        } else {
          redirectUrl.pathname = '/signin';
          redirectUrl.searchParams.set('error', 'insufficient_permissions');
        }
        console.log('🔍 Middleware: Redirecting to:', redirectUrl.pathname)
        return NextResponse.redirect(redirectUrl);
      } else {
        console.log('🔍 Middleware: Access granted for owner route')
      }
    }
    
    // Admin routes are now public - no access control needed
    
    // Check if user is trying to access user dashboard
    if (pathname.startsWith('/dashboard')) {
      console.log('🔍 Middleware: Checking dashboard access for role:', userRole)
      if (userRole === 'owner' || userRole === 'admin') {
        console.log('🔍 Middleware: Redirecting owner/admin to owner dashboard')
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/owner';
        return NextResponse.redirect(redirectUrl);
      } else {
        console.log('🔍 Middleware: Access granted for dashboard')
      }
    }

    console.log('🔍 Middleware: All checks passed, allowing access')
    return NextResponse.next();

  } catch (error) {
    console.log('🔍 Middleware: JWT verification failed:', error)
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/signin';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};