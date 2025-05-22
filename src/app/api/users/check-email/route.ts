import { NextResponse } from 'next/server'

import { prisma } from '@/libs/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const excludeUserId = searchParams.get('excludeUserId')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Check if user exists in UserInternal table
    const existingUser = await prisma.userInternal.findFirst({
      where: {
        email: {
          equals: email.toLowerCase().trim(),
          mode: 'insensitive'
        },
        ...(excludeUserId ? { NOT: { id: parseInt(excludeUserId) } } : {})
      },
      select: { id: true }
    })

    return NextResponse.json({ exists: !!existingUser })
  } catch (error) {
    console.error('Error checking email:', error)

    return NextResponse.json({ error: 'Failed to check email existence' }, { status: 500 })
  }
}
