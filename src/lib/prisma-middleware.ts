import type { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'

import { authOptions } from '../libs/auth'

// List of models that have organizationId field
const ORGANIZATION_MODELS = [
  'patient',
  'doctor',
  'patient_appointment',
  'patient_visit',
  'clinical_exam',
  'prescription',
  'invoice',
  'invoice_line',
  'payment',
  'payment_application',
  'service',
  'medication',
  'lab_test_order',
  'radiology_order',
  'patient_measurements',
  'patient_medical',
  'patient_medical_history',
  'Notification',
  'Contact',
  'Certificate',
  'CertificateTemplate',
  'Log'
] as const

type OrganizationModel = (typeof ORGANIZATION_MODELS)[number]

// Helper to check if a model has organizationId
function hasOrganizationId(model: string | undefined): model is OrganizationModel {
  return typeof model === 'string' && ORGANIZATION_MODELS.includes(model as OrganizationModel)
}

// Helper to get organizationId from session
async function getOrganizationId(): Promise<number | null> {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organisationId

  return orgId ? parseInt(orgId, 10) : null
}

// Middleware to enforce organization access control
export async function organizationMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  // Skip middleware for models without organizationId
  if (!hasOrganizationId(params.model)) {
    return next(params)
  }

  const organizationId = await getOrganizationId()

  // If no organizationId in session, deny access
  if (!organizationId) {
    throw new Error('Organization ID not found in session')
  }

  // Handle different operation types
  switch (params.action) {
    case 'findUnique':
    case 'findFirst':
      // Add organizationId filter to where clause
      params.args.where = {
        ...params.args.where,
        organisation_id: organizationId
      }
      break

    case 'findMany':
      // Add organizationId filter to where clause
      params.args.where = {
        ...params.args.where,
        organisation_id: organizationId
      }
      break

    case 'create':
      // Ensure organizationId is set to user's organization
      params.args.data = {
        ...params.args.data,
        organisation_id: organizationId
      }
      break

    case 'createMany':
      // Ensure all records have the correct organizationId
      params.args.data = params.args.data.map((item: any) => ({
        ...item,
        organisation_id: organizationId
      }))
      break

    case 'update':
    case 'updateMany':
      // Add organizationId filter to where clause
      params.args.where = {
        ...params.args.where,
        organisation_id: organizationId
      }
      break

    case 'delete':
    case 'deleteMany':
      // Add organizationId filter to where clause
      params.args.where = {
        ...params.args.where,
        organisation_id: organizationId
      }
      break

    case 'upsert':
      // Add organizationId filter to where clause and ensure it's set in create/update
      params.args.where = {
        ...params.args.where,
        organisation_id: organizationId
      }
      params.args.create = {
        ...params.args.create,
        organisation_id: organizationId
      }
      params.args.update = {
        ...params.args.update,
        organisation_id: organizationId
      }
      break

    case 'aggregate':
    case 'count':
    case 'groupBy':
      // Add organizationId filter to where clause
      if (params.args.where) {
        params.args.where = {
          ...params.args.where,
          organisation_id: organizationId
        }
      } else {
        params.args.where = {
          organisation_id: organizationId
        }
      }

      break
  }

  return next(params)
}
