import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getToken } from 'next-auth/jwt'

import { patientProtectionMiddleware } from './middleware/patientProtection'

// Paths that don't require authentication
const publicPaths = [
  '/fr/login',
  '/en/login',
  '/ar/login',
  '/fr/reset-password',
  '/en/reset-password',
  '/ar/reset-password',
  '/no-organisation',
  '/api/auth', // NextAuth.js API routes
  '/_next', // Next.js system files
  '/images', // Public images
  '/favicon.ico' // Favicon
]

// Paths that require specific roles
const roleProtectedPaths = {
  '/api/admin': ['ADMIN'],
  '/api/cabinet-manager': ['ADMIN', 'CABINET_MANAGER'],
  '/api/medications': ['ADMIN', 'CABINET_MANAGER'],
  '/api/services': ['ADMIN', 'CABINET_MANAGER'],
  '/api/users': ['ADMIN', 'CABINET_MANAGER']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Get the session token
  const token = await getToken({ req: request })

  // If no token and not a public path, redirect to login
  if (!token) {
    const url = new URL('/fr/login', request.url)

    url.searchParams.set('callbackUrl', pathname)

    return NextResponse.redirect(url)
  }

  // If user is authenticated but has no organization, redirect to no-organisation page
  if (!token.organisationId) {
    return NextResponse.redirect(new URL('/no-organisation', request.url))
  }

  // Handle root path - only after confirming user has an organization
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/fr/dashboards/organization', request.url))
  }

  // Check role-based access for API routes
  if (pathname.startsWith('/api/')) {
    // Apply Arcjet protection for patient routes
    if (pathname.startsWith('/api/patient')) {
      const protectionResult = await patientProtectionMiddleware(request)

      if (protectionResult) {
        return protectionResult
      }
    }

    // Check role-based access
    for (const [path, allowedRoles] of Object.entries(roleProtectedPaths)) {
      if (pathname.startsWith(path)) {
        const userRole = token.role as string

        if (!allowedRoles.includes(userRole)) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'You do not have permission to access this resource' },
            { status: 403 }
          )
        }

        break
      }
    }
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
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|public/).*)'
  ]
}
