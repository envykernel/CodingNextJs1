import { useState, useCallback } from 'react'

import { useTranslation } from '@/contexts/translationContext'
import {
  AppError,
  isUserError,
  isServerError,
  isNetworkError,
  isDatabaseError,
  isTimeoutError,
  logError
} from '@/utils/errorHandler'

export interface ErrorState {
  hasError: boolean
  message: string
  title: string
  isUserError: boolean
  isServerError: boolean
  details?: string
}

export interface ErrorHandlerOptions {
  showUserErrors?: boolean
  showServerErrors?: boolean
  logErrors?: boolean
  context?: string
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { t } = useTranslation()
  const [error, setError] = useState<ErrorState | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { showUserErrors = true, showServerErrors = true, logErrors = true, context = 'Component' } = options

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback(
    (error: AppError | Error | any, customMessage?: string) => {
      // Log error for debugging
      if (logErrors) {
        logError(error, context)
      }

      let errorState: ErrorState

      if (error instanceof AppError) {
        const isUserErr = isUserError(error.status)
        const isServerErr = isServerError(error.status)

        // For user errors, show the specific message
        if (isUserErr && showUserErrors) {
          errorState = {
            hasError: true,
            message: customMessage || error.message,
            title: t('errors.userError.title'),
            isUserError: true,
            isServerError: false,
            details: error.details
          }
        }

        // For server errors, show generic message
        else if (isServerErr && showServerErrors) {
          errorState = {
            hasError: true,
            message: t('errors.serverError.message'),
            title: t('errors.serverError.title'),
            isUserError: false,
            isServerError: true
          }
        }

        // Fallback
        else {
          errorState = {
            hasError: true,
            message: t('errors.generic.message'),
            title: t('errors.generic.title'),
            isUserError: false,
            isServerError: true
          }
        }
      } else {
        // Handle non-AppError errors
        if (isNetworkError(error)) {
          errorState = {
            hasError: true,
            message: t('errors.network.message'),
            title: t('errors.network.title'),
            isUserError: false,
            isServerError: true
          }
        } else if (isDatabaseError(error)) {
          errorState = {
            hasError: true,
            message: t('errors.database.message'),
            title: t('errors.database.title'),
            isUserError: false,
            isServerError: true
          }
        } else if (isTimeoutError(error)) {
          errorState = {
            hasError: true,
            message: t('errors.timeout.message'),
            title: t('errors.timeout.title'),
            isUserError: false,
            isServerError: true
          }
        } else {
          errorState = {
            hasError: true,
            message: t('errors.generic.message'),
            title: t('errors.generic.title'),
            isUserError: false,
            isServerError: true
          }
        }
      }

      setError(errorState)
    },
    [t, showUserErrors, showServerErrors, logErrors, context]
  )

  const handleAsyncOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options?: {
        onSuccess?: (result: T) => void
        onError?: (error: AppError | Error | any) => void
        customErrorMessage?: string
      }
    ): Promise<T | null> => {
      setIsLoading(true)
      clearError()

      try {
        const result = await operation()

        options?.onSuccess?.(result)

        return result
      } catch (error) {
        handleError(error, options?.customErrorMessage)
        options?.onError?.(error)

        return null
      } finally {
        setIsLoading(false)
      }
    },
    [handleError, clearError]
  )

  return {
    error,
    isLoading,
    handleError,
    handleAsyncOperation,
    clearError
  }
}
