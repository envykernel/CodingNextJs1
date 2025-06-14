import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getToken } from 'next-auth/jwt'

import { patientProtectionMiddleware } from './middleware/patientProtection'

// Paths that don't require organization check
const publicPaths = [
  '/fr/login',
  '/en/login',
  '/ar/login',
  '/fr/register',
  '/en/register',
  '/ar/register',
  '/fr/forgot-password',
  '/en/forgot-password',
  '/ar/forgot-password',
  '/fr/reset-password',
  '/en/reset-password',
  '/ar/reset-password',
  '/no-organisation'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply Arcjet protection for patient routes
  if (pathname.startsWith('/api/')) {
    const protectionResult = await patientProtectionMiddleware(request)

    if (protectionResult) {
      return protectionResult
    }
  }

  const token = await getToken({ req: request })

  // Handle root path
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/fr/login', request.url))
    }

    return NextResponse.redirect(new URL('/fr/dashboards/organization', request.url))
  }

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // If user is not authenticated, redirect to login
  if (!token) {
    const url = new URL('/fr/login', request.url)

    url.searchParams.set('callbackUrl', pathname)

    return NextResponse.redirect(url)
  }

  // If user is authenticated but has no organization, redirect to no-organisation page
  if (!token.organisationId) {
    return NextResponse.redirect(new URL('/no-organisation', request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (including images)
     * - api/auth (NextAuth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|public/|api/auth).*)'
  ]
}
