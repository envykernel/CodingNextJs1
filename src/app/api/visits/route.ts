import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { prisma } from '../../../prisma/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { appointment_id } = body

    if (!appointment_id) {
      return NextResponse.json({ error: 'Missing appointment_id' }, { status: 400 })
    }

    // Fetch the appointment
    const appointment = await prisma.patient_appointment.findUnique({
      where: { id: appointment_id },
      include: { patient: true, doctor: true, organisation: true }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Set start_time to appointment_date, end_time to 30 minutes after
    const startTime = appointment.appointment_date
    const endTime = new Date(new Date(startTime).getTime() + 30 * 60 * 1000)

    const visit = await prisma.patient_visit.create({
      data: {
        appointment: { connect: { id: appointment.id } },
        patient: { connect: { id: appointment.patient_id } },
        doctor: appointment.doctor_id ? { connect: { id: appointment.doctor_id } } : undefined,
        organisation: { connect: { id: appointment.organisation_id } },
        arrival_time: new Date(),
        start_time: startTime,
        end_time: endTime,
        status: 'completed',
        notes: appointment.notes || null
      }
    })

    return NextResponse.json({ visit }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  try {
    const visit = await prisma.patient_visit.findUnique({
      where: { id: Number(id) },
      include: { patient: true, doctor: true }
    })

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    // Serialize all date fields to ISO strings and return relevant patient/doctor fields
    const serializedVisit = {
      ...visit,
      arrival_time: visit.arrival_time ? new Date(visit.arrival_time).toISOString() : null,
      start_time: visit.start_time ? new Date(visit.start_time).toISOString() : null,
      end_time: visit.end_time ? new Date(visit.end_time).toISOString() : null,
      created_at: visit.created_at ? new Date(visit.created_at).toISOString() : null,
      patient: visit.patient
        ? {
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
        : null
    }

    return NextResponse.json({ visit: serializedVisit })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
