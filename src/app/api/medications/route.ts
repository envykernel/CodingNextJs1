import { NextResponse } from 'next/server'

import { prisma } from '@/prisma/prisma'

export async function GET() {
  const medications = await prisma.medication.findMany({
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(medications)
}
