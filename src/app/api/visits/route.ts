import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { prisma } from '../../../prisma/prisma'
import { authOptions } from '@/libs/auth'
import {
  UserError,
  ServerError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  formatErrorResponse,
  logError
} from '@/utils/errorHandler'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.organisationId) {
      throw new AuthenticationError('Please sign in to continue')
    }

    const organisationId = parseInt(session.user.organisationId)
    const body = await req.json()
    const { appointment_id } = body

    if (!appointment_id) {
      throw new ValidationError('Appointment ID is required')
    }

    // Fetch the appointment
    const appointment = await prisma.patient_appointment.findFirst({
      where: {
        id: appointment_id,
        organisation_id: organisationId
      },
      include: { patient: true, doctor: true, organisation: true }
    })

    if (!appointment) {
      throw new NotFoundError('Appointment not found')
    }

    // Extract date and time from appointment_date
    const appointmentDate = appointment.appointment_date
    const visitDate = appointmentDate.toISOString().split('T')[0] // YYYY-MM-DD
    const startTime = appointmentDate.toTimeString().slice(0, 5) // HH:mm

    // Calculate end time by adding 30 minutes to start time
    const endTime = new Date(new Date(appointmentDate).getTime() + 30 * 60 * 1000).toTimeString().slice(0, 5) // HH:mm

    // Create visit and update appointment status in a transaction
    const [visit, updatedAppointment] = await prisma.$transaction([
      // Create the visit
      prisma.patient_visit.create({
        data: {
          appointment: { connect: { id: appointment.id } },
          patient: { connect: { id: appointment.patient_id } },
          doctor: appointment.doctor_id ? { connect: { id: appointment.doctor_id } } : undefined,
          organisation: { connect: { id: appointment.organisation_id } },
          visit_date: new Date(visitDate),
          start_time: startTime,
          end_time: endTime,
          status: 'scheduled',
          notes: appointment.notes || null
        }
      }),

      // Update the appointment status
      prisma.patient_appointment.update({
        where: { id: appointment_id },
        data: { status: 'in_progress' }
      })
    ])

    return NextResponse.json({ visit, appointment: updatedAppointment }, { status: 201 })
  } catch (error) {
    // Log error for debugging
    logError(error, 'visits POST API')

    // Handle different error types
    if (
      error instanceof UserError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof AuthenticationError
    ) {
      return NextResponse.json(formatErrorResponse(error), { status: error.status })
    }

    // Handle database-specific errors
    if (
      error instanceof Error &&
      (error.message.includes('connect') || error.message.includes('database') || error.message.includes('prisma'))
    ) {
      const dbError = new ServerError('Database operation failed')

      return NextResponse.json(formatErrorResponse(dbError), { status: 500 })
    }

    // Generic server error
    const serverError = new ServerError()

    return NextResponse.json(formatErrorResponse(serverError), { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      throw new ValidationError('Visit ID is required')
    }

    const visit = await prisma.patient_visit.findUnique({
      where: { id: Number(id) },
      include: { patient: true, doctor: true, organisation: true }
    })

    if (!visit) {
      throw new NotFoundError('Visit not found')
    }

    // Serialize all date fields to ISO strings and return relevant patient/doctor fields
    const serializedVisit = {
      ...visit,
      visit_date: visit.visit_date ? visit.visit_date.toISOString().split('T')[0] : null,
      start_time: visit.start_time, // Already a string in HH:mm format
      end_time: visit.end_time, // Already a string in HH:mm format
      created_at: visit.created_at ? visit.created_at.toISOString() : null,
      patient: visit.patient
        ? {
            id: visit.patient.id,
            name: visit.patient.name,
            birthdate: visit.patient.birthdate,
            gender: visit.patient.gender,
            phone: visit.patient.phone_number,
            email: visit.patient.email,
            address: visit.patient.address,
            city: visit.patient.city
          }
        : null,
      doctor: visit.doctor
        ? {
            name: visit.doctor.name,
            email: visit.doctor.email,
            phone: visit.doctor.phone_number
          }
        : null,
      organisation: visit.organisation
        ? {
            id: visit.organisation.id,
            name: visit.organisation.name,
            address: visit.organisation.address,
            city: visit.organisation.city,
            phone_number: visit.organisation.phone_number,
            email: visit.organisation.email,
            currency: visit.organisation.currency
          }
        : null
    }

    return NextResponse.json({ visit: serializedVisit })
  } catch (error) {
    // Log error for debugging
    logError(error, 'visits GET API')

    // Handle different error types
    if (error instanceof UserError || error instanceof ValidationError || error instanceof NotFoundError) {
      return NextResponse.json(formatErrorResponse(error), { status: error.status })
    }

    // Handle database-specific errors
    if (
      error instanceof Error &&
      (error.message.includes('connect') || error.message.includes('database') || error.message.includes('prisma'))
    ) {
      const dbError = new ServerError('Database operation failed')

      return NextResponse.json(formatErrorResponse(dbError), { status: 500 })
    }

    // Generic server error
    const serverError = new ServerError()

    return NextResponse.json(formatErrorResponse(serverError), { status: 500 })
  }
}
