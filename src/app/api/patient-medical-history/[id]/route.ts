import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const idNum = parseInt(id)

    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { history_type, description, date_occurred } = body

    console.log('Updating medical history:', {
      id: idNum,
      history_type,
      description: description?.substring(0, 50) + '...', // Log only first 50 chars
      date_occurred
    })

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const medicalHistory = await prisma.patient_medical_history.update({
      where: { id: idNum },
      data: {
        history_type,
        description,
        date_occurred: date_occurred ? new Date(date_occurred) : null
      }
    })

    console.log('Updated medical history record:', medicalHistory.id)

    return NextResponse.json(medicalHistory)
  } catch (error) {
    console.error('Error updating medical history:', error)

    return NextResponse.json({ error: 'Failed to update medical history' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const idNum = parseInt(id)

    if (isNaN(idNum)) {
      console.error('Invalid ID:', id)

      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    console.log('Deleting medical history record:', idNum)

    await prisma.patient_medical_history.delete({
      where: { id: idNum }
    })

    console.log('Successfully deleted medical history record:', idNum)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting medical history:', error)

    return NextResponse.json({ error: 'Failed to delete medical history' }, { status: 500 })
  }
}
