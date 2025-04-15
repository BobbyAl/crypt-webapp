import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/crypt-webapp/' || 
                      path === '/crypt-webapp/login' || 
                      path === '/crypt-webapp/register'

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || ''

  // Redirect authenticated users away from login/register pages
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/crypt-webapp/dashboard', request.url))
  }

  // Redirect unauthenticated users to login page
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/crypt-webapp/login', request.url))
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/crypt-webapp',
    '/crypt-webapp/login',
    '/crypt-webapp/register',
    '/crypt-webapp/dashboard',
    '/crypt-webapp/encrypt',
    '/crypt-webapp/decrypt',
    '/crypt-webapp/hash',
    '/crypt-webapp/keygen',
    '/crypt-webapp/steg',
    '/crypt-webapp/account',
  ]
} 