import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_URL } from '@/config/constants';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/', '/about', '/contact', '/unauthorized'];

// Routes that handle their own auth (like API routes)
const bypassRoutes = ['/api/auth/login', '/api/auth/logout'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path exactly matches or starts with any public route
  if (publicRoutes.some(route => path === route || path.startsWith(`${route}/`))) {
    return NextResponse.next();
  }
  
  // Check if the path matches any bypass route
  if (bypassRoutes.some(route => path === route)) {
    return NextResponse.next();
  }
  
  // Check for API routes - let them handle their own auth
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // For protected routes, check for token
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Define role-based access patterns
  const rolePatterns = {
    '/admin': 3,    // Admin routes require user_type 3
    '/doctor': 2,   // Doctor routes require user_type 2
    '/patient': 1,  // Patient routes require user_type 1
  };

  // Check if this is a role-protected route
  const matchedPattern = Object.keys(rolePatterns).find(pattern => 
    path.startsWith(pattern)
  );

  if (matchedPattern) {
    try {
      const response = await fetch(`${API_URL}/api/auth/user/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      if (!response.ok) {
        // Token is invalid or expired
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      const userData = await response.json();
      const userType = userData.data.user_type;
      const requiredType = rolePatterns[matchedPattern];

      // Check if user has required role for this path
      if (userType !== requiredType) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};