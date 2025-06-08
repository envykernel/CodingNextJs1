import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

// GET /api/certificates/templates
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organisationId = parseInt(session.user.organisationId)

    // Fetch templates that are either shared (organisationId is null) or specific to this organization
    const templates = await prisma.certificateTemplate.findMany({
      where: {
        isActive: true,
        OR: [
          { organisationId: null }, // Shared templates
          { organisationId } // Organization-specific templates
        ]
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        category: true,
        contentTemplate: true,
        variablesSchema: true
      },
      orderBy: {
        category: 'asc'
      }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching certificate templates:', error)

    return NextResponse.json({ error: 'Failed to fetch certificate templates' }, { status: 500 })
  }
}
