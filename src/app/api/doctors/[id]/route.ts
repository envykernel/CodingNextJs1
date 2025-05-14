import { NextResponse } from 'next/server'

import { prisma } from '@/prisma/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const doctorId = params.id

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: Number(doctorId)
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error fetching doctor:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
