import type { NextApiRequest, NextApiResponse } from 'next'

import {
  UserError,
  ServerError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  formatErrorResponse,
  logError
} from '@/utils/errorHandler'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json(formatErrorResponse(new UserError('Method not allowed')))
  }

  const { errorType } = req.query

  try {
    // Simulate different error types based on query parameter
    switch (errorType) {
      case 'notfound':
        throw new NotFoundError('Resource not found')

      case 'validation':
        throw new ValidationError('Invalid input data')

      case 'authentication':
        throw new AuthenticationError('Please sign in to continue')

      case 'authorization':
        throw new AuthorizationError('You do not have permission')

      case 'conflict':
        throw new ConflictError('Resource already exists')

      case 'user':
        throw new UserError('Invalid request data')

      case 'server':
        throw new ServerError('Internal server error')

      case 'database':
        throw new Error('connect ECONNREFUSED 127.0.0.1:5432 - Database connection failed')

      default:
        return res.status(200).json({
          message: 'Success - no error',
          availableErrors: [
            'notfound',
            'validation',
            'authentication',
            'authorization',
            'conflict',
            'user',
            'server',
            'database'
          ]
        })
    }
  } catch (error) {
    // Log error for debugging
    logError(error, 'test-all-errors API')

    // Handle different error types
    if (
      error instanceof UserError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError ||
      error instanceof ConflictError
    ) {
      return res.status(error.status).json(formatErrorResponse(error))
    }

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
