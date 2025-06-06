import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

// Default shortcuts to use when database is unavailable
const defaultShortcuts = [
  {
    id: 1,
    url: '/apps/patients/list',
    icon: 'tabler-users',
    title: 'List of Patients',
    subtitle: 'View all patients',
    isActive: true
  },
  {
    id: 2,
    url: '/apps/appointments/list',
    icon: 'tabler-calendar',
    title: 'List of Appointments',
    subtitle: 'View all appointments',
    isActive: true
  },
  {
    id: 3,
    url: '/apps/appointments/add',
    icon: 'tabler-calendar-plus',
    title: 'Add New Appointment',
    subtitle: 'Schedule new appointment',
    isActive: true
  },
  {
    id: 4,
    url: '/apps/patients/add',
    icon: 'tabler-user-plus',
    title: 'Add New Patient',
    subtitle: 'Register new patient',
    isActive: true
  },
  {
    id: 5,
    url: '/apps/invoice/list',
    icon: 'tabler-file-dollar',
    title: 'List of Invoices',
    subtitle: 'Manage invoices',
    isActive: true
  },
  {
    id: 6,
    url: '/pages/account-settings',
    icon: 'tabler-settings',
    title: 'Settings',
    subtitle: 'Account Settings',
    isActive: true
  }
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Get all active shortcut references
      const shortcuts = await prisma.shortcutReference.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          title: 'asc'
        }
      })

      // If no shortcuts found in database, return default shortcuts
      if (shortcuts.length === 0) {
        return NextResponse.json(defaultShortcuts)
      }

      return NextResponse.json(shortcuts)
    } catch (dbError) {
      console.error('Database error:', dbError)

      return NextResponse.json(defaultShortcuts)
    }
  } catch (error) {
    console.error('Error fetching shortcuts:', error)

    return NextResponse.json(defaultShortcuts)
  }
}
