import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/prisma/prisma'
import {
  UserError,
  ServerError,
  NotFoundError,
  ValidationError,
  formatErrorResponse,
  logError
} from '@/utils/errorHandler'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json(formatErrorResponse(new UserError('Method not allowed')))
  }

  try {
    const { patientId } = req.query

    // Validate patientId parameter
    if (!patientId) {
      throw new ValidationError('Patient ID is required')
    }

    const patientIdNum = Number(patientId)

    if (isNaN(patientIdNum) || patientIdNum <= 0) {
      throw new ValidationError('Invalid patient ID format')
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientIdNum },
      select: { id: true }
    })

    if (!patient) {
      throw new NotFoundError('Patient not found')
    }

    const measurements = await prisma.patient_measurements.findMany({
      where: {
        patient_id: patientIdNum
      },
      orderBy: {
        measured_at: 'asc'
      }
    })

    res.status(200).json({ measurements })
  } catch (error) {
    // Log error for debugging
    logError(error, 'patient-measurements-history API')

    // Handle different error types
    if (error instanceof UserError || error instanceof ValidationError || error instanceof NotFoundError) {
      return res.status(error.status).json(formatErrorResponse(error))
    }

    // Handle database-specific errors
    if (
      error instanceof Error &&
      (error.message.includes('connect') || error.message.includes('database') || error.message.includes('prisma'))
    ) {
      const dbError = new ServerError('Database connection error')

      return res.status(500).json(formatErrorResponse(dbError))
    }

    // Generic server error
    const serverError = new ServerError()

    return res.status(500).json(formatErrorResponse(serverError))
  }
}
