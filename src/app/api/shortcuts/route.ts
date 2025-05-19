import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default shortcuts to use when database is unavailable
const defaultShortcuts = [
  {
    url: '/apps/patients/list',
    icon: 'tabler-users',
    title: 'List of Patients',
    subtitle: 'View all patients'
  },
  {
    url: '/apps/appointments/list',
    icon: 'tabler-calendar',
    title: 'List of Appointments',
    subtitle: 'View all appointments'
  },
  {
    url: '/apps/appointments/add',
    icon: 'tabler-calendar-plus',
    title: 'Add New Appointment',
    subtitle: 'Schedule new appointment'
  },
  {
    url: '/apps/patients/add',
    icon: 'tabler-user-plus',
    title: 'Add New Patient',
    subtitle: 'Register new patient'
  },
  {
    url: '/apps/invoice/list',
    icon: 'tabler-file-dollar',
    title: 'List of Invoices',
    subtitle: 'Manage invoices'
  },
  {
    url: '/pages/account-settings',
    icon: 'tabler-settings',
    title: 'Settings',
    subtitle: 'Account Settings'
  }
]

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Get the user's ID from UserInternal table
      const internalUser = await prisma.userInternal.findUnique({
        where: { email: session.user.email }
      })

      if (!internalUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const userShortcuts = await prisma.userShortcut.findMany({
        where: {
          userId: internalUser.id,
          isActive: true
        },
        include: {
          shortcutReference: true
        },
        orderBy: {
          displayOrder: 'asc'
        }
      })

      // Transform the data to match the ShortcutsType format
      const shortcuts = userShortcuts.map((us: any) => ({
        url: us.shortcutReference.url,
        icon: us.shortcutReference.icon,
        title: us.shortcutReference.title,
        subtitle: us.shortcutReference.subtitle
      }))

      return NextResponse.json(shortcuts)
    } catch (dbError) {
      return NextResponse.json(defaultShortcuts)
    }
  } catch (error) {
    return NextResponse.json(defaultShortcuts)
  }
}
