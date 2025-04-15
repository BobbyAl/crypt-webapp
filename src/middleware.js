import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get the pathname of the request and remove the base path
  const path = request.nextUrl.pathname.replace('/crypt-webapp', '')

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                      path === '/login' || 
                      path === '/register'

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || ''

  // Get the base URL for redirects
  const baseUrl = new URL('/crypt-webapp', request.url).toString().replace(/\/$/, '')

  // Redirect authenticated users away from login/register pages
  if (isPublicPath && token) {
    return NextResponse.redirect(`${baseUrl}/dashboard`)
  }

  // Redirect unauthenticated users to login page
  if (!isPublicPath && !token) {
    return NextResponse.redirect(`${baseUrl}/login`)
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