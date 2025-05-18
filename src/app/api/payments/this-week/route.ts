import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'
import { startOfWeek, endOfWeek } from 'date-fns'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'

export async function GET() {
  try {
    // Get the session and verify authentication
    const session = await getServerSession(authOptions)

    console.log('Session:', {
      user: session?.user,
      expires: session?.expires,
      hasUser: !!session?.user
    })

    if (!session?.user) {
      console.log('Authentication failed: No session or user found')

      return new NextResponse(
        JSON.stringify({
          error: 'Authentication required',
          details: 'Please sign in to access this resource'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Get the organization ID from the session
    const organisationId = session.user.organisationId

    console.log('Organisation details:', {
      id: organisationId,
      type: typeof organisationId,
      hasId: !!organisationId
    })

    if (!organisationId) {
      console.log('Authorization failed: No organisation ID found in session')

      return new NextResponse(
        JSON.stringify({
          error: 'Organization ID required',
          details: 'Your account is not associated with an organization'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Get the start and end of the current week (Monday to Sunday)
    const now = new Date()
    const startDate = startOfWeek(now, { weekStartsOn: 1 }) // Start from Monday
    const endDate = endOfWeek(now, { weekStartsOn: 1 }) // End on Sunday

    console.log('Query parameters:', {
      organisationId: Number(organisationId),
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    })

    // Fetch payments for this week
    const payments = await prisma.payment.findMany({
      where: {
        organisation_id: Number(organisationId),
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
        },
        applications: {
          include: {
            invoice: {
              select: {
                id: true,
                total_amount: true,
                status: true
              }
            },
            invoice_line: {
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                    amount: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        payment_date: 'desc'
      }
    })

    console.log('Query results:', {
      paymentCount: payments.length,
      firstPayment: payments[0]
        ? {
            id: payments[0].id,
            date: payments[0].payment_date,
            amount: payments[0].amount,
            hasApplications: payments[0].applications.length > 0
          }
        : null
    })

    return NextResponse.json(payments)
  } catch (error) {
    // Log the full error for debugging
    console.error('Error in /api/payments/this-week:', {
      name: error instanceof Error ? error.name : 'Unknown error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })

    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'

    return new NextResponse(
      JSON.stringify({
        error: errorMessage,
        details: "Failed to fetch this week's payments",
        timestamp: new Date().toISOString()
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
