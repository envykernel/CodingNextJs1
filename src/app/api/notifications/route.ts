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

    // Fetch notifications that are either:
    // 1. Global (isGlobal = true)
    // 2. For the user's organization (organisationId matches)
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ isGlobal: true }, { organisationId: Number(user.organisationId) }],
        NOT: {
          readStatus: {
            some: {
              userId: dbUser.id
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10
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

    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
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
