import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { getPatientStatistics } from '@/app/server/patientStatisticsActions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const organisationId = session.user?.organisationId ? parseInt(session.user.organisationId) : undefined

    if (!organisationId) {
      return new NextResponse('Organisation ID not found', { status: 400 })
    }

    const statistics = await getPatientStatistics(organisationId)

    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Error in patient-statistics API:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
