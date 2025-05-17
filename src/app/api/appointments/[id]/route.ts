import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const appointmentId = parseInt(params.id)

    if (isNaN(appointmentId)) {
      return new NextResponse('Invalid appointment ID', { status: 400 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return new NextResponse('Status is required', { status: 400 })
    }

    // Check if appointment exists and belongs to the user's organization
    const appointment = await prisma.patient_appointment.findFirst({
      where: {
        id: appointmentId,
        doctor: {
          organisation_id: session.user.organisationId ? parseInt(session.user.organisationId) : undefined
        }
      },
      include: {
        patient_visits: true
      }
    })

    if (!appointment) {
      return new NextResponse('Appointment not found', { status: 404 })
    }

    // Don't allow cancellation if there's a visit
    if (status === 'Cancelled' && appointment.patient_visits.length > 0) {
      return new NextResponse('Cannot cancel appointment with an associated visit', { status: 400 })
    }

    // Update the appointment
    const updatedAppointment = await prisma.patient_appointment.update({
      where: { id: appointmentId },
      data: { status }
    })

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error('Error updating appointment:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
