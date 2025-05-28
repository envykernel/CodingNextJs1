import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const services = await prisma.service.findMany({
      where: {
        organisation_id: session.user.organisationId ? parseInt(session.user.organisationId) : undefined
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        amount: true,
        is_active: true
      }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!session.user.organisationId) {
      return new NextResponse('User must belong to an organization', { status: 400 })
    }

    const body = await request.json()

    // Generate a unique code based on the name
    const code = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 10)
      .padEnd(10, '0')

    // Create the service
    const service = await prisma.service.create({
      data: {
        code,
        name: body.name,
        description: body.description,
        amount: body.amount,
        is_active: body.is_active ?? true,
        organisation_id: parseInt(session.user.organisationId)
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error creating service:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
