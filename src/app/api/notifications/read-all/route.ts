import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

export async function PUT() {
  try {
    const session = await getServerSession(authOptions)

    // Get the user's internal ID from the database using their email
    const user = await prisma.userInternal.findUnique({
      where: { email: session?.user?.email || '' },
      select: { id: true, organisationId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all unread notifications for this user
    const unreadNotifications = await prisma.notification.findMany({
      where: {
        OR: [{ isGlobal: true }, { organisationId: user.organisationId }],
        NOT: {
          readStatus: {
            some: {
              userId: user.id
            }
          }
        }
      },
      select: { id: true }
    })

    // Mark all notifications as read by creating NotificationRead records
    await Promise.all(
      unreadNotifications.map(notification =>
        prisma.notificationRead.create({
          data: {
            notificationId: notification.id,
            userId: user.id
          }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
