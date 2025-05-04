import { prisma } from '@/prisma/prisma'

export async function getAllDoctors() {
  const doctors = await prisma.doctor.findMany({
    select: { id: true, name: true }
  })

  return doctors
}
