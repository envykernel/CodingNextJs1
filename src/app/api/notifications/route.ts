import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'
import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'

import { authOptions } from '@/libs/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user

    if (!user?.email || !user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's internal ID from the database
    const dbUser = await prisma.userInternal.findUnique({
      where: { email: user.email },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const orgId = Number(user.organisationId)

    // Create a new query object for each request
    const query: Prisma.NotificationFindManyArgs = {
      where: {
        OR: [{ isGlobal: true }, { organisationId: orgId }],
        NOT: {
          readStatus: {
            some: {
              userId: dbUser.id
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc' as const
      },
      take: 10
    }

    // Create a new query object for execution
    const notifications = await prisma.notification.findMany({
      ...query,
      where: { ...query.where }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  } finally {
    // Clean up the Prisma client
    await prisma.$disconnect()
  }
}
