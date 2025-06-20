import { z } from 'zod'

import { prisma } from '@/prisma/prisma'
import {
  UserError,
  ServerError,
  ValidationError,
  NotFoundError,
  formatErrorResponse,
  logError
} from '@/utils/errorHandler'

const patientSchema = z.object({
  name: z.string().min(1),
  phone_number: z.string().min(1),
  gender: z.string().min(1),
  status: z.string().min(1),
  birthdate: z.string().min(1),
  doctor: z.string().optional(),
  avatar: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  email: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_email: z.string().optional(),
  organisation_id: z.number()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = patientSchema.safeParse(body)

    if (!parsed.success) {
      const validationError = new ValidationError('Invalid patient data')

      validationError.details = JSON.stringify(parsed.error.flatten().fieldErrors)

      return new Response(JSON.stringify(formatErrorResponse(validationError)), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const {
      name,
      birthdate,
      gender,
      status,
      phone_number,
      doctor,
      avatar,
      address,
      city,
      email,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_email,
      organisation_id
    } = parsed.data

    // Find the doctor by name if provided
    let doctorId: number | undefined

    if (doctor) {
      const doctorRecord = await prisma.doctor.findFirst({
        where: {
          name: doctor,
          organisation_id
        }
      })

      if (!doctorRecord) {
        throw new NotFoundError('Doctor not found')
      }

      doctorId = doctorRecord.id
    }

    const data: any = {
      name,
      birthdate: new Date(birthdate),
      gender,
      status,
      phone_number,
      organisation_id,
      doctor_id: doctorId
    }

    if (avatar !== undefined) data.avatar = avatar
    if (address !== undefined) data.address = address
    if (city !== undefined) data.city = city
    if (email !== undefined) data.email = email
    if (emergency_contact_name !== undefined) data.emergency_contact_name = emergency_contact_name
    if (emergency_contact_phone !== undefined) data.emergency_contact_phone = emergency_contact_phone
    if (emergency_contact_email !== undefined) data.emergency_contact_email = emergency_contact_email

    const patient = await prisma.patient.create({
      data,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            email: true,
            phone_number: true
          }
        }
      }
    })

    return new Response(JSON.stringify({ success: true, patient }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // Log error for debugging
    logError(error, 'patient API')

    // Handle different error types
    if (error instanceof UserError || error instanceof ValidationError || error instanceof NotFoundError) {
      return new Response(JSON.stringify(formatErrorResponse(error)), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Handle database-specific errors
    if (
      error instanceof Error &&
      (error.message.includes('connect') ||
        error.message.includes('database') ||
        error.message.includes('prisma') ||
        error.message.includes('Unique constraint'))
    ) {
      const dbError = new ServerError('Database operation failed')

      return new Response(JSON.stringify(formatErrorResponse(dbError)), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Generic server error
    const serverError = new ServerError()

    return new Response(JSON.stringify(formatErrorResponse(serverError)), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
