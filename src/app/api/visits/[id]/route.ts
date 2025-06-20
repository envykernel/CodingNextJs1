import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { prisma } from '@/prisma/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status, action, doctor_id } = await req.json()
    const { id } = await params
    const visitId = parseInt(id)

    // Get the current visit with its appointment
    const visit = await prisma.patient_visit.findUnique({
      where: { id: visitId },
      include: {
        appointment: true
      }
    })

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    // Handle starting the visit
    if (action === 'start') {
      const now = new Date()
      const startTime = now.toTimeString().slice(0, 5) // HH:mm format

      // Calculate end time (current time + 30 minutes)
      const endTime = new Date(now.getTime() + 30 * 60000).toTimeString().slice(0, 5) // HH:mm format

      const updatedVisit = await prisma.patient_visit.update({
        where: { id: visitId },
        data: {
          start_time: startTime,
          end_time: endTime,
          status: 'in_progress'
        }
      })

      return NextResponse.json({ visit: updatedVisit })
    }

    // Handle doctor assignment
    if (doctor_id !== undefined) {
      const updatedVisit = await prisma.patient_visit.update({
        where: { id: visitId },
        data: {
          doctor_id: doctor_id || null // Allow null to unassign doctor
        },
        include: {
          doctor: true // Include doctor data in response
        }
      })

      return NextResponse.json({ visit: updatedVisit })
    }

    // Handle status updates (completed/cancelled)
    if (status) {
      if (!['completed', 'cancelled'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }

      // Prepare update data for visit
      const visitUpdateData: any = { status }

      // If completing the visit, update end time to current time
      if (status === 'completed') {
        const now = new Date()

        visitUpdateData.end_time = now.toTimeString().slice(0, 5) // HH:mm format
      }

      // Update both visit and appointment in a transaction
      const [updatedVisit, updatedAppointment] = await prisma.$transaction([
        // Update the visit
        prisma.patient_visit.update({
          where: { id: visitId },
          data: visitUpdateData
        }),

        // Update the appointment status to match the visit status
        prisma.patient_appointment.update({
          where: { id: visit.appointment_id! },
          data: { status }
        })
      ])

      return NextResponse.json({ visit: updatedVisit, appointment: updatedAppointment })
    }

    return NextResponse.json({ error: 'Invalid action, status, or doctor_id' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const visitId = parseInt(id)

    const visit = await prisma.patient_visit.findUnique({
      where: { id: visitId },
      include: {
        patient: true,
        doctor: true,
        patient_measurement: true,
        clinical_exams: true,
        prescriptions: {
          include: {
            lines: true,
            doctor: true
          }
        },
        lab_test_orders: {
          include: {
            test_type: true
          }
        },
        radiology_orders: {
          include: {
            exam_type: true
          }
        }
      }
    })

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    // Serialize the visit data to handle BigInt and Date objects
    const serializedVisit = JSON.parse(
      JSON.stringify(visit, (key, value) => {
        if (typeof value === 'bigint') return value.toString()
        if (value instanceof Date) return value.toISOString()

        return value
      })
    )

    return NextResponse.json({ visit: serializedVisit })
  } catch (error) {
    console.error('Error fetching visit:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
