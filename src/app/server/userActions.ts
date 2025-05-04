import { prisma } from '@/prisma/prisma'

export async function getUserWithOrganisation(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { organisation: true }
  })
}
