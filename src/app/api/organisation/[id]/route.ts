import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const organisationId = parseInt(params.id)

    if (!organisationId) {
      return new NextResponse('Invalid organisation ID', { status: 400 })
    }

    // Verify that the user has access to this organization
    if (session.user.organisationId !== params.id) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
      select: {
        id: true,
        name: true,
        address: true,
        phone_number: true,
        email: true,
        status: true
      }
    })

    if (!organisation) {
      return new NextResponse('Organisation not found', { status: 404 })
    }

    return NextResponse.json({ organisation })
  } catch (error) {
    console.error('Error fetching organisation:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
