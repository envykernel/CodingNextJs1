import type { UserRole, Prisma } from '@prisma/client'
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

// Define role-based access control rules
const ROLE_ACCESS_RULES = {
  doctor: {
    create: ['ADMIN', 'CABINET_MANAGER'] as const,
    update: ['ADMIN', 'CABINET_MANAGER'] as const,
    delete: ['ADMIN', 'CABINET_MANAGER'] as const
  },
  UserInternal: {
    create: ['ADMIN', 'CABINET_MANAGER'] as const,
    update: ['ADMIN', 'CABINET_MANAGER'] as const,
    delete: ['ADMIN', 'CABINET_MANAGER'] as const
  }
} as const

// Helper function to check if a role has permission for an operation
function hasPermission(model: string, operation: Operation, role: Role): boolean {
  // If the model is not in our rules, allow access
  if (!ROLE_ACCESS_RULES[model as keyof typeof ROLE_ACCESS_RULES]) return true

  const rules = ROLE_ACCESS_RULES[model as keyof typeof ROLE_ACCESS_RULES]

  if (!rules) return true
  const allowedRoles = rules[operation]

  if (!allowedRoles) return true

  return allowedRoles.includes(role as any)
}

// Admin role management rules
const adminRoleRules = {
  // Check if user can create a new user with admin role
  canCreateAdminUser: (currentUserRole: Role, newUserRole: UserRole | null | undefined): boolean => {
    if (newUserRole !== 'ADMIN') return true

    return currentUserRole === 'ADMIN'
  },

  // Check if user can modify an existing admin user
  canModifyAdminUser: (currentUserRole: Role, existingUserRole: UserRole | null | undefined): boolean => {
    if (existingUserRole !== 'ADMIN') return true

    return currentUserRole === 'ADMIN'
  },

  // Check if user can delete a user
  canDeleteUser: (currentUserRole: Role, targetUserRole: UserRole | null | undefined): boolean => {
    if (targetUserRole === 'ADMIN') {
      return currentUserRole === 'ADMIN'
    }

    return ['ADMIN', 'CABINET_MANAGER'].includes(currentUserRole)
  },

  // Helper to extract role from update operation
  getRoleFromUpdate: (
    roleUpdate: UserRole | Prisma.NullableEnumUserRoleFieldUpdateOperationsInput | null | undefined
  ): UserRole | null | undefined => {
    if (!roleUpdate) return undefined
    if (typeof roleUpdate === 'string') return roleUpdate as UserRole
    if ('set' in roleUpdate) return roleUpdate.set as UserRole

    return null
  }
}

// Extend PrismaClient to include organization filtering and role-based access control
const prismaClientSingleton = () => {
  const client = new PrismaClient().$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          const session = await getServerSession(authOptions)

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

        async findUnique({ model, args, query }) {
          const session = await getServerSession(authOptions)

          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            if (session?.user?.organisationId) {
              const orgId = parseInt(session.user.organisationId)

              // Add organization check to the where clause
              args.where = {
                ...args.where,
                organisation_id: orgId
              } as any
            }
          }

          const result = await query(args)

          if (result) {
            if (session?.user?.organisationId) {
              const orgId = parseInt(session.user.organisationId)

              if ('organisation_id' in result && result.organisation_id !== orgId) {
                return null
              }
            }
          }

          return result
        },

        async create({ model, args, query }) {
          const session = await getServerSession(authOptions)

          // First check if we have a valid session
          if (!session?.user) {
            throw new Error('User not authenticated')
          }

          // Then check if we have a role
          const userRole = session.user.role as Role | undefined

          if (!userRole) {
            throw new Error('User role not found')
          }

          // Check role-based access
          if (!hasPermission(model, 'create', userRole)) {
            throw new Error(`User with role ${userRole} is not authorized to create ${model} records`)
          }

          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            if (session.user.organisationId) {
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

          // First check if we have a valid session
          if (!session?.user) {
            throw new Error('User not authenticated')
          }

          // Then check if we have a role
          const userRole = session.user.role as Role | undefined

          if (!userRole) {
            throw new Error('User role not found')
          }

          // Check role-based access
          if (!hasPermission(model, 'update', userRole)) {
            throw new Error(`User with role ${userRole} is not authorized to update ${model} records`)
          }

          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            if (session.user.organisationId) {
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

          // First check if we have a valid session
          if (!session?.user) {
            throw new Error('User not authenticated')
          }

          // Then check if we have a role
          const userRole = session.user.role as Role | undefined

          if (!userRole) {
            throw new Error('User role not found')
          }

          // Check role-based access
          if (!hasPermission(model, 'delete', userRole)) {
            throw new Error(`User with role ${userRole} is not authorized to delete ${model} records`)
          }

          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            if (session.user.organisationId) {
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
