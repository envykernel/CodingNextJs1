import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getServerSession } from 'next-auth'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const limit = searchParams.get('limit')
    const status = searchParams.get('status')

    if (!patientId) {
      return NextResponse.json({ error: 'Missing patientId parameter' }, { status: 400 })
    }

    const organisationId = parseInt(session.user.organisationId)
    const patientIdNum = parseInt(patientId)

    if (isNaN(patientIdNum)) {
      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 })
    }

    // Build the where clause
    const where: any = {
      patient_id: patientIdNum,
      organisation_id: organisationId
    }

    // Add status filter if provided
    if (status) {
      where.status = status
    }

    // Get visits for the patient
    const visits = await prisma.patient_visit.findMany({
      where,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        },
        appointment: {
          select: {
            id: true,
            appointment_date: true,
            appointment_type: true
          }
        }
      },
      orderBy: {
        visit_date: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    })

    // Format the response
    const formattedVisits = visits.map(visit => ({
      id: visit.id,
      visit_date: visit.visit_date?.toISOString().split('T')[0],
      start_time: visit.start_time,
      end_time: visit.end_time,
      status: visit.status,
      doctor: visit.doctor
        ? {
            id: visit.doctor.id,
            name: visit.doctor.name,
            specialty: visit.doctor.specialty
          }
        : null,
      appointment: visit.appointment
        ? {
            id: visit.appointment.id,
            date: visit.appointment.appointment_date.toISOString(),
            type: visit.appointment.appointment_type
          }
        : null
    }))

    return NextResponse.json(formattedVisits)
  } catch (error) {
    console.error('Error fetching patient visits:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
