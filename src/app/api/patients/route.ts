import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { getAllPatients } from '@/app/server/patientActions'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get search parameter from URL
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined

    const patients = await getAllPatients(search)

    return NextResponse.json({ patients })
  } catch (error) {
    console.error('Error fetching patients:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
