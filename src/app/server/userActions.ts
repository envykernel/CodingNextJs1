'use server'

import { getServerSession } from 'next-auth'

import type { Prisma, UserRole } from '@prisma/client'

import { prisma } from '@/libs/prisma'
import { authOptions } from '@/libs/auth'

interface GetUsersListParams {
  page: number
  pageSize: number
  name?: string
  organisationId: string
}

interface CreateUserParams {
  name: string
  email: string
  role: UserRole
  isApproved: boolean
  organisationId: number
}

interface UpdateUserParams extends CreateUserParams {
  id: string
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

    // Check if the user is trying to view users from their own organization
    const userOrgId = Number(session.user.organisationId)

    if (userOrgId !== Number(organisationId)) {
      throw new Error('Not authorized to view users from this organization')
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
        isApproved: true,
        organisationId: true
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
      status: user.isApproved ? 'active' : 'inactive',
      isApproved: user.isApproved,
      organisationId: user.organisationId
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

export async function createUser(data: CreateUserParams) {
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

    // Check if the user is trying to create a user in their own organization
    const userOrgId = Number(session.user.organisationId)

    if (userOrgId !== data.organisationId) {
      throw new Error('Not authorized to create users in this organization')
    }

    // Create the user
    const user = await prisma.userInternal.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isApproved: data.isApproved,
        organisationId: data.organisationId
      }
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function updateUser(data: UpdateUserParams) {
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

    // Get the target user to check their organization
    const targetUser = await prisma.userInternal.findUnique({
      where: { id: Number(data.id) },
      select: { organisationId: true }
    })

    if (!targetUser) {
      throw new Error('User not found')
    }

    // Check if the user is trying to update a user in their own organization
    const userOrgId = Number(session.user.organisationId)

    if (userOrgId !== targetUser.organisationId) {
      throw new Error('Not authorized to update users in this organization')
    }

    // Check if the user is trying to change the organization
    if (userOrgId !== data.organisationId) {
      throw new Error('Not authorized to change user organization')
    }

    // Update the user
    const user = await prisma.userInternal.update({
      where: { id: Number(data.id) },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isApproved: data.isApproved,
        organisationId: data.organisationId
      }
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}
