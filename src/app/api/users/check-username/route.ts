import { NextResponse } from 'next/server'

import { prisma } from '@/libs/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const organisationId = searchParams.get('organisationId')
    const excludeUserId = searchParams.get('excludeUserId')

    if (!name || !organisationId) {
      return NextResponse.json({ error: 'Name and organisationId parameters are required' }, { status: 400 })
    }

    // Check if user exists in UserInternal table with the same name in the same organization
    const existingUser = await prisma.userInternal.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        },
        organisationId: parseInt(organisationId),
        ...(excludeUserId ? { NOT: { id: parseInt(excludeUserId) } } : {})
      },
      select: { id: true }
    })

    return NextResponse.json({ exists: !!existingUser })
  } catch (error) {
    console.error('Error checking username:', error)

    return NextResponse.json({ error: 'Failed to check username existence' }, { status: 500 })
  }
}
