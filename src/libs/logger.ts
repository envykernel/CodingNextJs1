import type { NextRequest } from 'next/server'

import { getServerSession } from 'next-auth'

import type { LogActionType } from '@prisma/client'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

interface LogActionParams {
  actionType: LogActionType
  entityType: string
  entityId?: number
  description: string
  metadata?: Record<string, any>
  request: NextRequest
}

/**
 * Utility function to log actions across the application
 * @param params LogActionParams object containing all necessary information for logging
 * @throws Error if logging fails
 */
export async function logAction({
  actionType,
  entityType,
  entityId,
  description,
  metadata = {},
  request
}: LogActionParams): Promise<void> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || !session?.user?.organisationId) {
    throw new Error('No session, email, or organisation ID found for logging')
  }

  // Get user ID from email
  const user = await prisma.userInternal.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!user) {
    throw new Error(`User not found for email: ${session.user.email}`)
  }

  const organisationId = parseInt(session.user.organisationId)

  await prisma.log.create({
    data: {
      organisationId,
      userId: user.id,
      actionType,
      entityType,
      entityId,
      description,
      metadata,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent')
    }
  })
}
