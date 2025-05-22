'use server'

import { getServerSession } from 'next-auth'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/libs/prisma'
import { authOptions } from '@/libs/auth'

interface GetUsersListParams {
  page: number
  pageSize: number
  name?: string
  organisationId: string
}

export async function getUsersList({ page, pageSize, name, organisationId }: GetUsersListParams) {
  try {
    // Get the current session to check user permissions
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error('Not authenticated')
    }

    // Check if the user is an admin
    if ((session.user as any).role !== 'ADMIN') {
      throw new Error('Not authorized')
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * pageSize

    // Build the where clause
    const where: Prisma.UserInternalWhereInput = {
      organisationId: Number(organisationId),
      ...(name
        ? {
            OR: [
              { name: { contains: name, mode: 'insensitive' as const } },
              { email: { contains: name, mode: 'insensitive' as const } }
            ]
          }
        : {})
    }

    // Get total count for pagination
    const total = await prisma.userInternal.count({ where })

    // Get users with pagination
    const users = await prisma.userInternal.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organisation: {
          select: {
            name: true
          }
        },
        createdAt: true,
        isApproved: true
      },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const transformedUsers = users.map(user => ({
      id: user.id.toString(),
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'USER',
      organisationName: user.organisation?.name || '',
      createdAt: user.createdAt.toISOString(),
      status: user.isApproved ? 'active' : 'inactive'
    }))

    return {
      users: transformedUsers,
      page,
      pageSize,
      total
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}
