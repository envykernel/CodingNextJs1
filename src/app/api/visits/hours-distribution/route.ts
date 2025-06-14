import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.organisationId) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const thirtyDaysAgo = new Date()

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    try {
      // Get visits for the last 30 days, grouped by hour
      const visits = (await prisma.$queryRaw`
        SELECT 
          start_time,
          COUNT(*) as count
        FROM patient_visit
        WHERE 
          organisation_id = ${Number(session.user.organisationId)}
          AND visit_date >= ${thirtyDaysAgo}
        GROUP BY start_time
        ORDER BY start_time
      `) as { start_time: string; count: number }[]

      // Transform the data to group by hour
      const hourDistribution = visits.reduce<Record<string, number>>((acc, visit) => {
        const hour = visit.start_time.split(':')[0].padStart(2, '0')

        acc[hour] = (acc[hour] || 0) + Number(visit.count)

        return acc
      }, {})

      // Convert to array format and ensure all hours are represented
      const result = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0')

        return {
          hour,
          count: hourDistribution[hour] || 0
        }
      })

      return NextResponse.json(result)
    } catch (dbError) {
      // Handle all errors with a generic user-friendly message
      return new NextResponse(
        JSON.stringify({
          error: 'Service temporarily unavailable',
          message: 'Please try again later'
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: 'Service temporarily unavailable',
        message: 'Please try again later'
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
