import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { formatDistanceToNow } from 'date-fns'

import { fr } from 'date-fns/locale'

import type { Notification } from '@prisma/client'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/libs/prisma'

export async function GET() {
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

    // Fetch notifications that are either:
    // 1. Global (isGlobal = true)
    // 2. For the user's organization (organisationId matches)
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ isGlobal: true }, { organisationId: user.organisationId }],

        // Only get notifications that haven't been read by this user
        NOT: {
          readStatus: {
            some: {
              userId: user.id
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10 // Limit to 10 most recent notifications
    })

    // Transform notifications to match the component's expected format
    const formattedNotifications = notifications.map((notification: Notification) => ({
      id: notification.id,
      title: notification.title,
      subtitle: notification.message,
      time: formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr }),
      read: false,
      avatarIcon: getNotificationIcon(notification.type),
      avatarColor: getNotificationColor(notification.priority)
    }))

    return NextResponse.json(formattedNotifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to get icon based on notification type
function getNotificationIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'appointment':
      return 'tabler-calendar'
    case 'payment':
      return 'tabler-cash'
    case 'system':
      return 'tabler-bell'
    case 'prescription':
      return 'tabler-pill'
    case 'lab_test':
      return 'tabler-microscope'
    case 'radiology':
      return 'tabler-x-ray'
    default:
      return 'tabler-bell'
  }
}

// Helper function to get color based on notification priority
function getNotificationColor(priority: string): 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    case 'low':
      return 'info'
    default:
      return 'primary'
  }
}
