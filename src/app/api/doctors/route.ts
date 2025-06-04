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

    // Only admin or cabinet manager users can access this endpoint
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CABINET_MANAGER') {
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

    // Only admin or cabinet manager users can access this endpoint
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CABINET_MANAGER') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await request.json()

    console.log('Received doctor creation request with body:', body)
    const { name, specialty, email, phone_number, status, organisation_id } = body

    // Validate required fields
    if (!name || !specialty || !organisation_id) {
      console.log('Missing required fields:', { name, specialty, organisation_id })

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
      console.log('Found existing doctor:', existingDoctor)
      let errorKey = 'doctors.error.'

      if (existingDoctor.name === name) errorKey += 'nameExists'
      else if (email && existingDoctor.email === email) errorKey += 'emailExists'
      else if (phone_number && existingDoctor.phone_number === phone_number) errorKey += 'phoneExists'

      return new NextResponse(JSON.stringify({ errorKey }), { status: 400 })
    }

    try {
      console.log('Attempting to create doctor with data:', {
        name: `Dr. ${name.trim()}`,
        specialty,
        email,
        phone_number,
        status: status || 'enabled',
        organisation_id: Number(organisation_id)
      })

      const doctor = await prisma.doctor.create({
        data: {
          name: `Dr. ${name.trim()}`,
          specialty,
          email,
          phone_number,
          status: status || 'enabled',
          organisation_id: Number(organisation_id)
        }
      })

      console.log('Successfully created doctor:', doctor)

      return NextResponse.json(doctor)
    } catch (error) {
      console.error('Error creating doctor:', error)

      // Log the full error object to see more details
      console.error('Full error object:', JSON.stringify(error, null, 2))

      return new NextResponse('Internal Server Error', { status: 500 })
    }
  } catch (error) {
    console.error('Error creating doctor:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
