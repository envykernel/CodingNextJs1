import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

// Helper function to generate code from name
const generateCode = (name: string): string => {
  // Remove special characters and convert to uppercase
  const baseCode = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8) // Limit to 8 characters

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString().slice(-4)

  return `${baseCode}-${timestamp}`
}

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
      return new NextResponse(JSON.stringify({ error: 'services.error.unauthorized' }), { status: 401 })
    }

    if (!session.user.organisationId) {
      return new NextResponse(JSON.stringify({ error: 'services.error.noOrganization' }), { status: 400 })
    }

    const body = await request.json()
    const organisationId = parseInt(session.user.organisationId)

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return new NextResponse(JSON.stringify({ error: 'services.error.nameRequired' }), { status: 400 })
    }

    // Validate amount is greater than zero
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return new NextResponse(JSON.stringify({ error: 'services.error.invalidAmount' }), { status: 400 })
    }

    // Check if service name already exists in the organization
    const existingService = await prisma.service.findFirst({
      where: {
        organisation_id: organisationId,
        name: body.name.trim()
      }
    })

    if (existingService) {
      return new NextResponse(JSON.stringify({ error: 'services.error.nameExists' }), { status: 400 })
    }

    // Generate a unique code based on the name
    const code = generateCode(body.name)

    // Create the service
    const service = await prisma.service.create({
      data: {
        code,
        name: body.name.trim(),
        description: body.description?.trim() || '',
        amount: body.amount || 0,
        is_active: body.is_active ?? true,
        organisation_id: organisationId
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error creating service:', error)

    return new NextResponse(JSON.stringify({ error: 'services.error.create' }), { status: 500 })
  }
}
