import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const organisationId = session.user?.organisationId ? parseInt(session.user.organisationId) : undefined

    if (!organisationId) {
      return new NextResponse('Organisation ID not found', { status: 400 })
    }

    // Get the search query from the URL
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json([])
    }

    // Search patients in the database
    const patients = await prisma.patient.findMany({
      where: {
        organisation_id: organisationId,
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            phone_number: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phone_number: true
      },
      take: 10, // Limit results to 10 patients
      orderBy: {
        name: 'asc'
      }
    })

    // Format the response
    const formattedPatients = patients.map(patient => ({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      avatar: patient.avatar,
      phone_number: patient.phone_number
    }))

    return NextResponse.json(formattedPatients)
  } catch (error) {
    console.error('Error in patient search API:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
