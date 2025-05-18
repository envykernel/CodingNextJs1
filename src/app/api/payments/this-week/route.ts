import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'
import { startOfWeek, endOfWeek } from 'date-fns'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'

export async function GET() {
  try {
    // Get the session and verify authentication
    const session = await getServerSession(authOptions)

    console.log('Session:', session?.user) // Debug log

    if (!session?.user) {
      console.log('No session found') // Debug log

      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the organization ID from the session
    const organisationId = session.user.organisationId

    console.log('Organisation ID:', organisationId) // Debug log

    if (!organisationId) {
      console.log('No organisation ID found in session') // Debug log

      return new NextResponse('Organization ID not found', { status: 400 })
    }

    // Get the start and end of the current week (Monday to Sunday)
    const now = new Date()
    const startDate = startOfWeek(now, { weekStartsOn: 1 }) // Start from Monday
    const endDate = endOfWeek(now, { weekStartsOn: 1 }) // End on Sunday

    console.log('Date range:', { startDate, endDate }) // Debug log

    // Fetch payments for this week
    const payments = await prisma.payment.findMany({
      where: {
        organisation_id: Number(organisationId), // Convert to number since it's stored as string in session
        payment_date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        patient: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        payment_date: 'desc'
      }
    })

    console.log('Found payments:', payments.length) // Debug log

    return NextResponse.json(payments)
  } catch (error) {
    // Log the full error for debugging
    console.error('Error in /api/payments/this-week:', error)

    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'

    return new NextResponse(
      JSON.stringify({
        error: errorMessage,
        details: 'Failed to fetch this week&apos;s payments'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
