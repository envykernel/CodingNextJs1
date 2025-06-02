import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { prisma } from '@/prisma/prisma'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
  category: z.enum(['GENERAL', 'TECHNICAL', 'BILLING', 'FEEDBACK', 'OTHER']).default('GENERAL')
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = contactSchema.parse(body)

    const user = await prisma.userInternal.findUnique({
      where: { email: session.user.email! },
      select: { id: true, organisationId: true }
    })

    if (!user?.organisationId) {
      return NextResponse.json({ error: 'User must be associated with an organisation' }, { status: 400 })
    }

    const contact = await prisma.contact.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        category: validatedData.category,
        organisation_id: user.organisationId,
        user_id: user.id
      }
    })

    return NextResponse.json(contact)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error('Error creating contact:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.userInternal.findUnique({
      where: { email: session.user.email! },
      select: { organisationId: true }
    })

    if (!user?.organisationId) {
      return NextResponse.json({ error: 'User must be associated with an organisation' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where: { organisation_id: user.organisationId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.contact.count({
        where: { organisation_id: user.organisationId }
      })
    ])

    return NextResponse.json({
      contacts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const { id, status } = z
      .object({
        id: z.number(),
        status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
      })
      .parse(body)

    const user = await prisma.userInternal.findUnique({
      where: { email: session.user.email! },
      select: { organisationId: true }
    })

    if (!user?.organisationId) {
      return NextResponse.json({ error: 'User must be associated with an organisation' }, { status: 400 })
    }

    const contact = await prisma.contact.update({
      where: {
        id,
        organisation_id: user.organisationId
      },
      data: { status }
    })

    return NextResponse.json(contact)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error('Error updating contact:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
