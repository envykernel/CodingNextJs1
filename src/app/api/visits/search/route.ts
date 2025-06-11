import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import type { patient_visit } from '@prisma/client'
import { Prisma } from '@prisma/client'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

type VisitWithRelations = patient_visit & {
  patient: {
    id: number
    name: string
    phone_number: string
  }
  doctor?: {
    id: number
    name: string
  }
  appointment?: {
    id: number
    appointment_type: string
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organisationId = session.user.organisationId

    if (!organisationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const patientIdsParam = searchParams.get('patientIds')

    if (!patientIdsParam) {
      return NextResponse.json({ error: 'Patient IDs are required' }, { status: 400 })
    }

    const patientIds = patientIdsParam.split(',').map(id => parseInt(id, 10))

    if (patientIds.some(isNaN)) {
      return NextResponse.json({ error: 'Invalid patient IDs' }, { status: 400 })
    }

    const visits = (await prisma.patient_visit.findMany({
      where: {
        patient_id: { in: patientIds },
        organisation_id: parseInt(organisationId)
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone_number: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true
          }
        },
        appointment: {
          select: {
            id: true,
            appointment_type: true
          }
        }
      },
      orderBy: {
        visit_date: 'desc'
      }
    })) as VisitWithRelations[]

    // Format the response
    const formattedVisits = visits.map((visit: VisitWithRelations) => ({
      id: visit.id.toString(),
      visit_date: visit.visit_date.toISOString().split('T')[0],
      start_time: visit.start_time,
      end_time: visit.end_time,
      status: visit.status,
      patient: {
        id: visit.patient.id.toString(),
        name: visit.patient.name,
        phone_number: visit.patient.phone_number
      },
      doctor: visit.doctor
        ? {
            id: visit.doctor.id.toString(),
            name: visit.doctor.name
          }
        : undefined,
      appointment: visit.appointment
        ? {
            id: visit.appointment.id.toString(),
            appointment_type: visit.appointment.appointment_type
          }
        : undefined
    }))

    return NextResponse.json(formattedVisits)
  } catch (error) {
    console.error('Error searching visits:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
