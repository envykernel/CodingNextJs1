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

// Extend PrismaClient to include organization filtering
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
              } as any // Type assertion needed due to Prisma's complex types
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

                // Check if the result has organisation_id and it matches
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
          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            const session = await getServerSession(authOptions)

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
          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            const session = await getServerSession(authOptions)

            if (session?.user?.organisationId) {
              const orgId = parseInt(session.user.organisationId)

              // Add organization check to the where clause
              args.where = {
                ...args.where,
                organisation_id: orgId
              } as any
            }
          }

          return query(args)
        },

        async delete({ model, args, query }) {
          if (ORGANISATION_MODELS.includes(model as OrganisationModel)) {
            const session = await getServerSession(authOptions)

            if (session?.user?.organisationId) {
              const orgId = parseInt(session.user.organisationId)

              // Add organization check to the where clause
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
