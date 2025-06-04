import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

// Get all medications
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with organization info
    const user = await prisma.userInternal.findUnique({
      where: { email: session.user?.email ?? '' },
      include: { organisation: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user is admin, return all medications
    // If user is cabinet manager, return medications for their organization and medications with no organization
    // Otherwise, return only medications for user's organization
    const medications = await prisma.medication.findMany({
      where:
        user.role === 'ADMIN'
          ? {}
          : user.role === 'CABINET_MANAGER'
            ? {
                OR: [{ organisation_id: user.organisationId }, { organisation_id: null }]
              }
            : { organisation_id: user.organisationId },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(medications)
  } catch (error) {
    console.error('Error fetching medications:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new medication
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or cabinet manager
    const user = await prisma.userInternal.findUnique({
      where: { email: session.user?.email ?? '' },
      include: { organisation: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'CABINET_MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()

    // Check if medication with same name already exists
    const existingMedication = await prisma.medication.findUnique({
      where: { name: data.name }
    })

    if (existingMedication) {
      return NextResponse.json({ error: 'Medication with this name already exists' }, { status: 400 })
    }

    // Create new medication
    const newMedication = await prisma.medication.create({
      data: {
        name: data.name,
        category: data.category,
        dosages: data.dosages,
        organisation_id: user.organisationId
      }
    })

    return NextResponse.json(newMedication)
  } catch (error) {
    console.error('Error creating medication:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
