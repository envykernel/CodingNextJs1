import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

// Define the models that have organisation_id
const ORGANISATION_MODELS = [
  'patient',
  'patient_medical',
  'patient_medical_history',
  'patient_measurements',
  'patient_visit',
  'patient_appointment',
  'doctor',
  'prescription',
  'invoice',
  'payment',
  'service',
  'lab_test_order',
  'radiology_order',
  'clinical_exam',
  'medication',
  'contact',
  'certificate',
  'log'
] as const

// Create a type for the models that have organisation_id
type OrganisationModel = (typeof ORGANISATION_MODELS)[number]

// Define allowed roles
const ALLOWED_ROLES = ['ADMIN', 'CABINET_MANAGER', 'DOCTOR', 'SECRETARY'] as const

type Role = (typeof ALLOWED_ROLES)[number]
type Operation = 'create' | 'update' | 'delete'

// Define role-based access control rules - only for doctor model for now
const ROLE_ACCESS_RULES = {
  doctor: {
    create: ['ADMIN', 'CABINET_MANAGER'] as const,
    update: ['ADMIN', 'CABINET_MANAGER'] as const,
    delete: ['ADMIN', 'CABINET_MANAGER'] as const
  }
} as const

// Helper function to check if a role has permission for an operation
function hasPermission(model: string, operation: Operation, role: Role): boolean {
  // If the model is not doctor, allow access (we'll add more models later)
  if (model !== 'doctor') return true

  const rules = ROLE_ACCESS_RULES[model as keyof typeof ROLE_ACCESS_RULES]

  if (!rules) return true
  const allowedRoles = rules[operation]

  if (!allowedRoles) return true

  return allowedRoles.includes(role as any)
}

// Extend PrismaClient to include organization filtering and role-based access control
const prismaClientSingleton = () => {
  const client = new PrismaClient().$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            const session = await getServerSession(authOptions)

            if (session?.user?.organisationId) {
              const orgId = parseInt(session.user.organisationId)

              args.where = {
                ...args.where,
                organisation_id: orgId
              } as any
            }
          }

          return query(args)
        },

        async findFirst({ model, args, query }) {
          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            const session = await getServerSession(authOptions)

            if (session?.user?.organisationId) {
              const orgId = parseInt(session.user.organisationId)

              args.where = {
                ...args.where,
                organisation_id: orgId
              } as any
            }
          }

          return query(args)
        },

        async findUnique({ model, args, query }) {
          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            const result = await query(args)

            if (result) {
              const session = await getServerSession(authOptions)

              if (session?.user?.organisationId) {
                const orgId = parseInt(session.user.organisationId)

                if ('organisation_id' in result && result.organisation_id !== orgId) {
                  return null
                }
              }
            }

            return result
          }

          return query(args)
        },

        async create({ model, args, query }) {
          const session = await getServerSession(authOptions)

          if (!session?.user?.role) {
            throw new Error('User role not found')
          }

          // Check role-based access
          if (!hasPermission(model, 'create', session.user.role as Role)) {
            throw new Error(`User with role ${session.user.role} is not authorized to create ${model} records`)
          }

          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            if (session?.user?.organisationId) {
              const orgId = parseInt(session.user.organisationId)

              args.data = {
                ...args.data,
                organisation_id: orgId
              } as any
            }
          }

          return query(args)
        },

        async update({ model, args, query }) {
          const session = await getServerSession(authOptions)

          if (!session?.user?.role) {
            throw new Error('User role not found')
          }

          // Check role-based access
          if (!hasPermission(model, 'update', session.user.role as Role)) {
            throw new Error(`User with role ${session.user.role} is not authorized to update ${model} records`)
          }

          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            if (session?.user?.organisationId) {
              const orgId = parseInt(session.user.organisationId)

              args.where = {
                ...args.where,
                organisation_id: orgId
              } as any
            }
          }

          return query(args)
        },

        async delete({ model, args, query }) {
          const session = await getServerSession(authOptions)

          if (!session?.user?.role) {
            throw new Error('User role not found')
          }

          // Check role-based access
          if (!hasPermission(model, 'delete', session.user.role as Role)) {
            throw new Error(`User with role ${session.user.role} is not authorized to delete ${model} records`)
          }

          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            if (session?.user?.organisationId) {
              const orgId = parseInt(session.user.organisationId)

              args.where = {
                ...args.where,
                organisation_id: orgId
              } as any
            }
          }

          return query(args)
        }
      }
    }
  })

  return client
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
