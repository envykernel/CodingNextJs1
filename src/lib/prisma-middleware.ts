import type { Prisma, PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

import { encryptData, decryptData } from './encryption'

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
  try {
    const session = await getServerSession()
    const orgId = session?.user?.organisationId

    return orgId ? parseInt(orgId, 10) : null
  } catch (error) {
    return null
  }
}

// Middleware to enforce organization access control
export const organizationMiddleware: Prisma.Middleware = async (params, next) => {
  // Skip middleware for models without organizationId
  if (!hasOrganizationId(params.model)) {
    return next(params)
  }

  const organizationId = await getOrganizationId()

  // If no organizationId in session, skip organization filtering
  // This allows the middleware to work during SSR or when there's no session
  if (!organizationId) {
    return next(params)
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

// Fields that need to be encrypted
const ENCRYPTED_FIELDS = [
  'name',
  'email',
  'phone_number',
  'emergency_contact_name',
  'emergency_contact_phone',
  'emergency_contact_email'
] as const

// Get the master key from environment variables
const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY || ''

if (!MASTER_KEY) {
  throw new Error('ENCRYPTION_MASTER_KEY environment variable is not set')
}

// Encryption middleware for sensitive data
export const encryptionMiddleware: Prisma.Middleware = async (params, next) => {
  if (params.model === 'patient') {
    // Handle encryption for create and update operations
    if (params.action === 'create' || params.action === 'update') {
      const data = params.args.data
      const organizationId = data.organisation_id

      // Skip encryption if no organization ID is available
      if (!organizationId) {
        return next(params)
      }

      // For create operations, always encrypt if there are sensitive fields
      if (params.action === 'create') {
        let hasSensitiveData = false

        for (const field of ENCRYPTED_FIELDS) {
          if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            hasSensitiveData = true
            data[field] = encryptData(data[field], organizationId, MASTER_KEY)
          }
        }

        if (hasSensitiveData) {
          data.is_encrypted = true
        }
      }

      // For update operations, encrypt only if sensitive fields are being updated
      if (params.action === 'update') {
        let hasSensitiveData = false

        for (const field of ENCRYPTED_FIELDS) {
          if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
            hasSensitiveData = true
            data[field] = encryptData(data[field], organizationId, MASTER_KEY)
          }
        }

        if (hasSensitiveData) {
          data.is_encrypted = true
        }
      }
    }

    // Handle decryption for read operations
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      const result = await next(params)

      if (result && result.is_encrypted && result.organisation_id) {
        return decryptPatientData(result)
      }

      return result
    }

    if (params.action === 'findMany') {
      const results = await next(params)

      return results.map((patient: any) => {
        if (patient && patient.is_encrypted && patient.organisation_id) {
          return decryptPatientData(patient)
        }

        return patient
      })
    }
  }

  return next(params)
}

function isProbablyEncrypted(value: string) {
  // Encrypted values are base64 and should be at least (IV + tag + some data) in length
  // IV = 16 bytes, tag = 16 bytes, so minimum 32 bytes (base64: ~44 chars)
  return typeof value === 'string' && value.length > 40 && /^[A-Za-z0-9+/=]+$/.test(value)
}

function decryptPatientData(patient: any) {
  if (!patient || !patient.organisation_id) return patient

  const organizationId = patient.organisation_id

  for (const field of ENCRYPTED_FIELDS) {
    if (patient[field] && isProbablyEncrypted(patient[field])) {
      try {
        patient[field] = decryptData(patient[field], organizationId, MASTER_KEY)
      } catch (error) {
        // Keep the encrypted value if decryption fails
        continue
      }
    }
  }

  return patient
}

// Add the encryption middleware to the Prisma client
export function addEncryptionMiddleware(prisma: PrismaClient) {
  prisma.$use(encryptionMiddleware)
}
