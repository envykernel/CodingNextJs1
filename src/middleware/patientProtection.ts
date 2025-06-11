import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { protectWithArcjet } from '@/libs/arcjet'

// List of patient-related API routes that need protection
const PROTECTED_ROUTES = [
  '/api/patient',
  '/api/patients',
  '/api/patient-visits',
  '/api/patient-medical-history',
  '/api/patient-measurements',
  '/api/patient-statistics',
  '/api/prescriptions/patient',
  '/api/invoices/patient'
]

// Higher token cost for sensitive operations
const TOKEN_COSTS = {
  GET: 1, // Reading patient data
  POST: 2, // Creating new records
  PUT: 2, // Updating records
  DELETE: 3 // Deleting records
}

export async function patientProtectionMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Check if the route needs protection
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get token cost based on HTTP method
  const tokenCost = TOKEN_COSTS[method as keyof typeof TOKEN_COSTS] || 1

  // Apply Arcjet protection
  const protectionResult = await protectWithArcjet(request, tokenCost)

  if (protectionResult) {
    return NextResponse.json(
      { error: protectionResult.error, reason: protectionResult.reason },
      { status: protectionResult.status }
    )
  }

  return NextResponse.next()
}
