import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { prisma } from '@/prisma/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status, action } = await req.json()
    const visitId = parseInt(params.id)

    // Get the current visit
    const visit = await prisma.patient_visit.findUnique({
      where: { id: visitId }
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

    // Handle status updates (completed/cancelled)
    if (status) {
      if (!['completed', 'cancelled'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }

      // Prepare update data
      const updateData: any = { status }

      // If completing the visit, update end time to current time
      if (status === 'completed') {
        const now = new Date()

        updateData.end_time = now.toTimeString().slice(0, 5) // HH:mm format
      }

      // Update the visit
      const updatedVisit = await prisma.patient_visit.update({
        where: { id: visitId },
        data: updateData
      })

      return NextResponse.json({ visit: updatedVisit })
    }

    return NextResponse.json({ error: 'Invalid action or status' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params before using them
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
