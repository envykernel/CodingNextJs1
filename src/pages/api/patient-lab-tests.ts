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

  const { patientId } = req.query

  try {
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

    // Get all lab test orders for the patient, ordered by date
    const orders = await prisma.lab_test_order.findMany({
      where: {
        patient_id: patientIdNum,
        status: {
          in: ['completed', 'pending'] // Include both completed and pending tests
        }
      },
      include: {
        test_type: true,
        visit: true
      },
      orderBy: {
        ordered_at: 'desc'
      }
    })

    // Group by test type and get the latest result for each
    const latestResults = orders.reduce((acc: any, order) => {
      const testTypeId = order.test_type_id

      // If we haven't seen this test type yet, or if this result is more recent
      if (!acc[testTypeId] || new Date(order.ordered_at!) > new Date(acc[testTypeId].ordered_at)) {
        acc[testTypeId] = {
          id: order.id,
          test_name: order.test_type.name,
          category: order.test_type.category,
          result_value: order.result_value,
          result_unit: order.result_unit || order.test_type.default_unit,
          reference_range: order.reference_range || order.test_type.default_reference_range,
          ordered_at: order.ordered_at,
          visit_date: order.visit?.visit_date,
          status: order.status // Include the status in the response
        }
      }

      return acc
    }, {})

    // Convert to array and sort by test name
    const results = Object.values(latestResults).sort((a: any, b: any) => a.test_name.localeCompare(b.test_name))

    res.status(200).json(results)
  } catch (error) {
    // Log error for debugging
    logError(error, 'patient-lab-tests API')

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
