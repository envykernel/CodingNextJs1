import { NextResponse } from 'next/server'

import { prisma } from '@/prisma/prisma'

export async function GET() {
  try {
    console.log('Fetching radiology exam types...')

    const examTypes = await prisma.radiology_exam_type.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    console.log('Found exam types:', examTypes.length)

    return NextResponse.json(examTypes)
  } catch (error) {
    console.error('Detailed error fetching radiology exam types:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        error: 'Failed to fetch radiology exam types',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
