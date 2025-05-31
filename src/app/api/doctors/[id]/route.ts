import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/libs/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const doctorId = params.id

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: Number(doctorId)
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error fetching doctor:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/doctors/[id]
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only admin users can access this endpoint
    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { name, specialty, email, phone_number, status, organisation_id } = body

    // Validate required fields
    if (!name || !specialty || !organisation_id) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Validate organization_id matches user's organization
    if (Number(organisation_id) !== Number(session.user.organisationId)) {
      return new NextResponse('Invalid organization', { status: 403 })
    }

    // Check if doctor exists and belongs to user's organization
    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        id: Number(id),
        organisation_id: Number(session.user.organisationId)
      }
    })

    if (!existingDoctor) {
      return new NextResponse('Doctor not found', { status: 404 })
    }

    const doctor = await prisma.doctor.update({
      where: {
        id: Number(id)
      },
      data: {
        name,
        specialty,
        email,
        phone_number,
        status,
        organisation_id: Number(organisation_id)
      }
    })

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error updating doctor:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/doctors/[id]
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only admin users can access this endpoint
    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { id } = params

    // Check if doctor exists and belongs to user's organization
    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        id: Number(id),
        organisation_id: Number(session.user.organisationId)
      }
    })

    if (!existingDoctor) {
      return new NextResponse('Doctor not found', { status: 404 })
    }

    // Check if doctor has any associated records
    const hasPatients = await prisma.patient.findFirst({
      where: {
        doctor_id: Number(id)
      }
    })

    if (hasPatients) {
      return new NextResponse(
        'Cannot delete doctor because they have associated patients. Please reassign or delete the patients first.',
        { status: 400 }
      )
    }

    const hasAppointments = await prisma.patient_appointment.findFirst({
      where: {
        doctor_id: Number(id)
      }
    })

    if (hasAppointments) {
      return new NextResponse(
        'Cannot delete doctor because they have associated appointments. Please delete the appointments first.',
        { status: 400 }
      )
    }

    const hasVisits = await prisma.patient_visit.findFirst({
      where: {
        doctor_id: Number(id)
      }
    })

    if (hasVisits) {
      return new NextResponse(
        'Cannot delete doctor because they have associated visits. Please delete the visits first.',
        { status: 400 }
      )
    }

    await prisma.doctor.delete({
      where: {
        id: Number(id)
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting doctor:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
