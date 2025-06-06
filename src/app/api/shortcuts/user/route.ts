import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'

// GET: Fetch user's shortcuts
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

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

      // Get user's shortcuts
      const userShortcuts = await prisma.userShortcut.findMany({
        where: {
          userId: internalUser.id
        },
        orderBy: {
          displayOrder: 'asc'
        }
      })

      return NextResponse.json(userShortcuts)
    } catch (dbError) {
      console.error('Database error:', dbError)

      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error fetching user shortcuts:', error)

    return NextResponse.json([])
  }
}

// PUT: Update user's shortcuts
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

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

      // Get the updated shortcuts from request body
      const updatedShortcuts = await request.json()

      // Start a transaction to update all shortcuts
      const result = await prisma.$transaction(async tx => {
        // Delete all existing shortcuts for the user
        await tx.userShortcut.deleteMany({
          where: { userId: internalUser.id }
        })

        // Insert the new shortcuts
        const newShortcuts = await Promise.all(
          updatedShortcuts.map((shortcut: any) =>
            tx.userShortcut.create({
              data: {
                userId: internalUser.id,
                shortcutId: shortcut.shortcutId,
                displayOrder: shortcut.displayOrder,
                isActive: shortcut.isActive
              }
            })
          )
        )

        return newShortcuts
      })

      return NextResponse.json(result)
    } catch (dbError) {
      console.error('Database error:', dbError)

      return NextResponse.json({ error: 'Failed to update shortcuts' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating user shortcuts:', error)

    return NextResponse.json({ error: 'Failed to update shortcuts' }, { status: 500 })
  }
}
