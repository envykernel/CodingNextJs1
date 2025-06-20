export interface ApiError {
  status: number
  message: string
  details?: string
  code?: string
}

export interface ErrorResponse {
  error: string
  details?: string
  code?: string
}

export class AppError extends Error {
  public status: number
  public code?: string
  public details?: string

  constructor(message: string, status: number = 500, code?: string, details?: string) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export class UserError extends AppError {
  constructor(message: string, code?: string, details?: string) {
    super(message, 400, code, details)
    this.name = 'UserError'
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error', code?: string, details?: string) {
    super(message, 500, code, details)
    this.name = 'ServerError'
  }
}

export class ValidationError extends UserError {
  constructor(message: string, details?: string) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code?: string, details?: string) {
    super(message, 409, code, details)
    this.name = 'ConflictError'
  }
}

export class DatabaseError extends ServerError {
  constructor(message: string = 'Database error occurred', details?: string) {
    super(message, 'DATABASE_ERROR', details)
    this.name = 'DatabaseError'
  }
}

export class NetworkError extends ServerError {
  constructor(message: string = 'Network error occurred', details?: string) {
    super(message, 'NETWORK_ERROR', details)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends ServerError {
  constructor(message: string = 'Request timeout', details?: string) {
    super(message, 504, 'TIMEOUT_ERROR', details)
    this.name = 'TimeoutError'
  }
}

// Error classification functions
export const isUserError = (status: number): boolean => {
  return status >= 400 && status < 500
}

export const isServerError = (status: number): boolean => {
  return status >= 500
}

export const isClientError = (status: number): boolean => {
  return status >= 400 && status < 500
}

export const isNetworkError = (error: any): boolean => {
  return (
    error instanceof NetworkError ||
    error.name === 'NetworkError' ||
    error.message?.includes('network') ||
    error.message?.includes('fetch') ||
    error.message?.includes('connection')
  )
}

export const isDatabaseError = (error: any): boolean => {
  return (
    error instanceof DatabaseError ||
    error.name === 'DatabaseError' ||
    error.message?.includes('database') ||
    error.message?.includes('prisma') ||
    error.message?.includes('connect')
  )
}

export const isTimeoutError = (error: any): boolean => {
  return (
    error instanceof TimeoutError ||
    error.name === 'TimeoutError' ||
    error.message?.includes('timeout') ||
    error.message?.includes('timed out')
  )
}

// Error response formatting
export const formatErrorResponse = (error: AppError | Error | any): ErrorResponse => {
  if (error instanceof AppError) {
    return {
      error: error.message,
      details: error.details,
      code: error.code
    }
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }

  return {
    error: typeof error === 'string' ? error : 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? JSON.stringify(error) : undefined
  }
}

// API error handling
export const handleApiError = async (response: Response): Promise<never> => {
  let errorData: any = {}

  try {
    errorData = await response.json()
  } catch {
    // If response is not JSON, use status text
    errorData = { error: response.statusText || 'Unknown error' }
  }

  const status = response.status
  const message = errorData.error || errorData.message || 'An error occurred'

  if (isUserError(status)) {
    throw new UserError(message, errorData.code, errorData.details)
  } else if (isServerError(status)) {
    throw new ServerError(message, errorData.code, errorData.details)
  } else {
    throw new AppError(message, status, errorData.code, errorData.details)
  }
}

// Fetch wrapper with error handling
export const fetchWithErrorHandling = async (url: string, options: RequestInit = {}): Promise<any> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      await handleApiError(response)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    if (isNetworkError(error)) {
      throw new NetworkError('Unable to connect to the server. Please check your internet connection.')
    }

    if (isTimeoutError(error)) {
      throw new TimeoutError('The request took too long to complete. Please try again.')
    }

    throw new ServerError('An unexpected error occurred. Please try again later.')
  }
}

// Error logging (for development/debugging)
export const logError = (error: AppError | Error | any, context?: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]`, {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
      stack: error.stack
    })
  }
}
