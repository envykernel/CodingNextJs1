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
    const { visit_id, orders } = body

    if (!visit_id || typeof visit_id !== 'number') {
      return NextResponse.json({ error: 'Valid visit ID is required' }, { status: 400 })
    }

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: 'At least one order is required' }, { status: 400 })
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

    // Create all orders in a transaction
    const createdOrders = await prisma.$transaction(
      orders.map(order =>
        prisma.radiology_order.create({
          data: {
            visit_id,
            exam_type_id: order.exam_type_id,
            notes: order.notes,
            status: order.status || 'pending',
            patient_id: visit.patient_id,
            organisation_id: visit.organisation_id,
            ordered_at: formatDateToDDMMYYYY(new Date()),
            doctor_id: visit.doctor_id || undefined,
            result: order.result || null,
            result_date: order.result_date || null
          },
          include: {
            exam_type: true
          }
        })
      )
    )

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

    return NextResponse.json({ orders: createdOrders, visit: updatedVisit })
  } catch (error) {
    console.error('Error creating radiology orders:', error)

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const orderId = parseInt(id)

    // Get the order to find the visit_id for updating the visit data
    const order = await prisma.radiology_order.findUnique({
      where: { id: orderId },
      select: { visit_id: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Delete the order
    await prisma.radiology_order.delete({
      where: { id: orderId }
    })

    // If the order was associated with a visit, fetch the updated visit data
    if (order.visit_id) {
      const updatedVisit = await prisma.patient_visit.findUnique({
        where: { id: order.visit_id },
        include: {
          radiology_orders: {
            include: {
              exam_type: true
            }
          }
        }
      })

      return NextResponse.json({ success: true, visit: updatedVisit })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting radiology order:', error)

    return NextResponse.json({ error: 'Failed to delete radiology order' }, { status: 500 })
  }
}
