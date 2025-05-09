import { NextResponse } from 'next/server'

import { prisma } from '@/prisma/prisma'

export async function GET() {
  const services = await prisma.service.findMany({
    where: { is_active: true },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      amount: true
    }
  })

  return NextResponse.json(services)
}
