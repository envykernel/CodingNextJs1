import { getServerSession } from 'next-auth'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'

export async function getAllDoctors() {
  try {
    // Get the current session to check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error('Not authenticated')
    }

    // Get organization ID from session
    const organisationId = session.user.organisationId ? parseInt(session.user.organisationId) : undefined

    if (!organisationId) {
      throw new Error('Organization ID not found')
    }

    // Get doctors with organization filter
    const doctors = await prisma.doctor.findMany({
      where: {
        organisation_id: organisationId,
        status: 'enabled' // Only return enabled doctors by default
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        status: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return doctors
  } catch (error) {
    console.error('Error fetching doctors:', error)
    throw error
  }
}
