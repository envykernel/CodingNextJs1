import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { getPatientStatistics } from '@/app/server/patientStatisticsActions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: 'Please sign in to view statistics' }, { status: 401 })
    }

    const organisationId = session.user?.organisationId ? parseInt(session.user.organisationId) : undefined

    if (!organisationId) {
      return NextResponse.json({ message: 'Unable to identify your organization' }, { status: 400 })
    }

    const statistics = await getPatientStatistics(organisationId)

    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Error in patient-statistics API:', error)

    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { message: 'Unable to connect to the database. Please try again later.' },
        { status: 503 }
      )
    }

    // Check if it's a timeout error
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json({ message: 'The request took too long to complete. Please try again.' }, { status: 504 })
    }

    // Generic error for other cases
    return NextResponse.json(
      { message: 'Unable to retrieve statistics at this time. Please try again later.' },
      { status: 500 }
    )
  }
}
