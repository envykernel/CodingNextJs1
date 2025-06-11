import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { LogActionType } from '@prisma/client'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

// POST /api/logs - Create a new log entry
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { actionType, entityType, entityId, description, metadata, ipAddress, userAgent } = body

    // Validate required fields
    if (!actionType || !entityType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: actionType, entityType, and description are required' },
        { status: 400 }
      )
    }

    // Validate actionType is a valid enum value
    if (!Object.values(LogActionType).includes(actionType)) {
      return NextResponse.json(
        { error: 'Invalid actionType. Must be one of: ' + Object.values(LogActionType).join(', ') },
        { status: 400 }
      )
    }

    const organisationId = session.user.organisationId ? parseInt(session.user.organisationId) : undefined
    const userId = (session.user as any).id ? parseInt((session.user as any).id) : undefined

    if (!organisationId) {
      return NextResponse.json({ error: 'Organisation ID not found' }, { status: 400 })
    }

    // Create the log entry
    const log = await prisma.log.create({
      data: {
        organisationId,
        userId,
        actionType,
        entityType,
        entityId,
        description,
        metadata: metadata || {},
        ipAddress,
        userAgent
      }
    })

    return NextResponse.json(log)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create log' },
      { status: 500 }
    )
  }
}

// GET /api/logs - Get logs for the current organisation or specific user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const actionType = searchParams.get('actionType') as LogActionType | null
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const organisationId = session.user.organisationId ? parseInt(session.user.organisationId) : undefined

    if (!organisationId) {
      return NextResponse.json({ error: 'Organisation ID not found' }, { status: 400 })
    }

    // Build the where clause
    const where: any = {
      organisationId
    }

    if (userId) {
      where.userId = parseInt(userId)
    }

    if (actionType) {
      where.actionType = actionType
    }

    if (entityType) {
      where.entityType = entityType
    }

    if (entityId) {
      where.entityId = parseInt(entityId)
    }

    if (startDate || endDate) {
      where.createdAt = {}

      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }

      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Get total count for pagination
    const total = await prisma.log.count({ where })

    // Get logs with pagination
    const logs = await prisma.log.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
