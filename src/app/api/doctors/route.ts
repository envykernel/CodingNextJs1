import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/libs/prisma'

// GET /api/doctors
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only admin users can access this endpoint
    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const doctors = await prisma.doctor.findMany({
      where: {
        organisation_id: Number(session.user.organisationId)
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST /api/doctors
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only admin users can access this endpoint
    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await request.json()
    const { name, specialty, email, phone_number, status, organisation_id } = body

    // Validate required fields
    if (!name || !specialty || !organisation_id) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Validate organization_id matches user's organization
    if (Number(organisation_id) !== Number(session.user.organisationId)) {
      return new NextResponse('Invalid organization', { status: 403 })
    }

    // Check for duplicate doctor with same name, email, or phone number in the organization
    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        organisation_id: Number(organisation_id),
        OR: [{ name }, ...(email ? [{ email }] : []), ...(phone_number ? [{ phone_number }] : [])]
      }
    })

    if (existingDoctor) {
      let errorMessage = 'A doctor with '

      if (existingDoctor.name === name) errorMessage += 'this name'
      else if (email && existingDoctor.email === email) errorMessage += 'this email'
      else if (phone_number && existingDoctor.phone_number === phone_number) errorMessage += 'this phone number'
      errorMessage += ' already exists in your organization'

      return new NextResponse(errorMessage, { status: 400 })
    }

    const doctor = await prisma.doctor.create({
      data: {
        name,
        specialty,
        email,
        phone_number,
        status: status || 'enabled',
        organisation_id: Number(organisation_id)
      }
    })

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error creating doctor:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
