import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const idNum = parseInt(id)

    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { history_type, description, date_occurred } = body

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

    return NextResponse.json(medicalHistory)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update medical history' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const idNum = parseInt(id)

    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.patient_medical_history.delete({
      where: { id: idNum }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete medical history' }, { status: 500 })
  }
}
