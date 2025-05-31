import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

// Update medication
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.userInternal.findUnique({
      where: { email: session.user?.email ?? '' },
      include: { organisation: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const medicationId = parseInt(id)
    const data = await request.json()

    // Check if medication exists and belongs to user's organization
    const existingMedication = await prisma.medication.findUnique({
      where: { id: medicationId }
    })

    if (!existingMedication) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 })
    }

    if (existingMedication.organisation_id !== user.organisationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update medication
    const updatedMedication = await prisma.medication.update({
      where: { id: medicationId },
      data: {
        name: data.name,
        category: data.category,
        dosages: data.dosages,
        organisation_id: user.organisationId
      }
    })

    return NextResponse.json(updatedMedication)
  } catch (error) {
    console.error('Error updating medication:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete medication
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.userInternal.findUnique({
      where: { email: session.user?.email ?? '' },
      include: { organisation: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const medicationId = parseInt(params.id)

    // Check if medication exists and belongs to user's organization
    const existingMedication = await prisma.medication.findUnique({
      where: { id: medicationId }
    })

    if (!existingMedication) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 })
    }

    if (existingMedication.organisation_id !== user.organisationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete medication
    await prisma.medication.delete({
      where: { id: medicationId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting medication:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
