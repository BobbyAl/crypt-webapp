import { NextResponse } from 'next/server'

export function middleware(request) {
  const path = request.nextUrl.pathname

  // Only login and register are public
  const isPublicPath = path === '/crypt-webapp/' || 
                      path === '/crypt-webapp/login' || 
                      path === '/crypt-webapp/register'

  const token = request.cookies.get('token')?.value || ''

  // If logged in, redirect to dashboard from public pages
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/crypt-webapp/dashboard', request.url))
  }

  // If not logged in, redirect to login from private pages
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