import { PrismaClient } from '@prisma/client'

import { organizationMiddleware } from './prisma-middleware'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

// Add middleware to enforce organization access control
prisma.$use(organizationMiddleware)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
