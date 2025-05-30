import { NextResponse } from 'next/server'

import { prisma } from '@/prisma/prisma'
import { formatDateToDDMMYYYY } from '@/utils/date'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const visitId = searchParams.get('visitId')

    if (!visitId) {
      return NextResponse.json({ error: 'Visit ID is required' }, { status: 400 })
    }

    const orders = await prisma.radiology_order.findMany({
      where: {
        visit_id: parseInt(visitId)
      },
      include: {
        exam_type: true
      },
      orderBy: {
        ordered_at: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching radiology orders:', error)

    return NextResponse.json({ error: 'Failed to fetch radiology orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { visit_id, exam_type_id, notes, status, ordered_at } = body

    if (!visit_id || typeof visit_id !== 'number') {
      return NextResponse.json({ error: 'Valid visit ID is required' }, { status: 400 })
    }

    const visit = await prisma.patient_visit.findUnique({
      where: { id: visit_id },
      select: {
        organisation_id: true,
        patient_id: true,
        doctor_id: true
      }
    })

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    const order = await prisma.radiology_order.create({
      data: {
        visit_id,
        exam_type_id,
        notes,
        status: status || 'pending',
        patient_id: visit.patient_id,
        organisation_id: visit.organisation_id,
        ordered_at: ordered_at || formatDateToDDMMYYYY(new Date()),
        doctor_id: visit.doctor_id || undefined
      },
      include: {
        exam_type: true
      }
    })

    const updatedVisit = await prisma.patient_visit.findUnique({
      where: { id: visit_id },
      include: {
        radiology_orders: {
          include: {
            exam_type: true
          }
        }
      }
    })

    return NextResponse.json({ order, visit: updatedVisit })
  } catch (error) {
    console.error('Error creating radiology order:', error)

    return NextResponse.json({ error: 'Failed to create radiology order' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, exam_type_id, notes, status, result, result_date } = body

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'Valid order ID is required' }, { status: 400 })
    }

    // Only update result_date if result is provided
    const updateData: any = {
      exam_type_id,
      notes,
      status,
      result
    }

    if (result) {
      // Convert YYYY-MM-DD to DD/MM/YYYY if result_date is provided, otherwise use current date
      const [year, month, day] = (result_date || '').split('-')

      updateData.result_date = result_date ? `${day}/${month}/${year}` : formatDateToDDMMYYYY(new Date())
    }

    const order = await prisma.radiology_order.update({
      where: { id },
      data: updateData,
      include: {
        exam_type: true
      }
    })

    if (!order.visit_id) {
      return NextResponse.json({ error: 'Visit ID not found' }, { status: 404 })
    }

    const visit = await prisma.patient_visit.findUnique({
      where: { id: order.visit_id },
      include: {
        radiology_orders: {
          include: {
            exam_type: true
          }
        }
      }
    })

    return NextResponse.json({ order, visit })
  } catch (error) {
    console.error('Error updating radiology order:', error)

    return NextResponse.json({ error: 'Failed to update radiology order' }, { status: 500 })
  }
}
