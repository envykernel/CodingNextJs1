import type { NextApiRequest, NextApiResponse } from 'next'

import { ServerError, formatErrorResponse, logError } from '@/utils/errorHandler'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json(formatErrorResponse(new ServerError('Method not allowed')))
  }

  try {
    // Simulate a database connection error
    const simulateDatabaseError = () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:5432 - Database connection failed')
    }

    // This will throw a database connection error
    simulateDatabaseError()

    res.status(200).json({ message: 'Success' })
  } catch (error) {
    // Log error for debugging
    logError(error, 'test-database-error API')

    // Handle database-specific errors
    if (
      error instanceof Error &&
      (error.message.includes('connect') ||
        error.message.includes('database') ||
        error.message.includes('ECONNREFUSED'))
    ) {
      const dbError = new ServerError('Database connection error')

      return res.status(500).json(formatErrorResponse(dbError))
    }

    // Generic server error
    const serverError = new ServerError()

    return res.status(500).json(formatErrorResponse(serverError))
  }
}
