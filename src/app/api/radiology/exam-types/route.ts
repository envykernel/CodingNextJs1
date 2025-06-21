import { NextResponse } from 'next/server'

import { getRadiologyExamTypes } from '@/app/server/radiologyActions'

export async function GET() {
  try {
    console.log('Fetching radiology exam types...')

    const examTypes = await getRadiologyExamTypes()

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
