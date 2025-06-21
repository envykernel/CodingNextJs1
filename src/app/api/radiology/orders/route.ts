import { NextResponse } from 'next/server'

import {
  getRadiologyOrdersByVisit,
  createRadiologyOrders,
  updateRadiologyOrder,
  deleteRadiologyOrder
} from '@/app/server/radiologyActions'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const visitId = searchParams.get('visitId')

    if (!visitId) {
      return NextResponse.json({ error: 'Visit ID is required' }, { status: 400 })
    }

    const orders = await getRadiologyOrdersByVisit(parseInt(visitId))

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

    const result = await createRadiologyOrders(visit_id, orders)

    return NextResponse.json(result)
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

    const result_data = await updateRadiologyOrder(id, {
      exam_type_id,
      notes,
      status,
      result,
      result_date
    })

    return NextResponse.json(result_data)
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
    const result = await deleteRadiologyOrder(orderId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting radiology order:', error)

    return NextResponse.json({ error: 'Failed to delete radiology order' }, { status: 500 })
  }
}
