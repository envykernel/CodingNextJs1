import React, { useState } from 'react'

import { Button, Card, CardContent, Typography, Box } from '@mui/material'

import { useErrorHandler } from '@/hooks/useErrorHandler'
import ErrorDisplay from '@/components/ErrorDisplay'
import { fetchWithErrorHandling, UserError, ServerError, ValidationError } from '@/utils/errorHandler'

const ErrorHandlingExample: React.FC = () => {
  const [data, setData] = useState<any>(null)

  const { error, isLoading, handleError, handleAsyncOperation, clearError } = useErrorHandler({
    context: 'ErrorHandlingExample'
  })

  // Example 1: Simulate a user error (4xx)
  const simulateUserError = async () => {
    await handleAsyncOperation(
      async () => {
        // Simulate API call that returns a 400 error
        const response = await fetch('/api/non-existent-endpoint')

        if (!response.ok) {
          throw new UserError('Invalid request data. Please check your input.')
        }

        return await response.json()
      },
      {
        onSuccess: result => {
          setData(result)
          console.log('Success:', result)
        },
        onError: error => {
          console.log('User error handled:', error)
        }
      }
    )
  }

  // Example 2: Simulate a server error (5xx)
  const simulateServerError = async () => {
    await handleAsyncOperation(
      async () => {
        // Simulate API call that returns a 500 error
        const response = await fetch('/api/server-error')

        if (!response.ok) {
          throw new ServerError('Database connection failed')
        }

        return await response.json()
      },
      {
        onSuccess: result => {
          setData(result)
          console.log('Success:', result)
        },
        onError: error => {
          console.log('Server error handled:', error)
        }
      }
    )
  }

  // Example 3: Simulate a validation error
  const simulateValidationError = async () => {
    await handleAsyncOperation(
      async () => {
        // Simulate validation error
        throw new ValidationError('Email format is invalid', 'email must be a valid email address')
      },
      {
        onError: error => {
          console.log('Validation error handled:', error)
        }
      }
    )
  }

  // Example 4: Using fetchWithErrorHandling utility
  const useFetchUtility = async () => {
    try {
      const result = await fetchWithErrorHandling('/api/some-endpoint')

      setData(result)
      console.log('Success with fetch utility:', result)
    } catch (error) {
      handleError(error)
    }
  }

  // Example 5: Manual error handling
  const manualErrorHandling = () => {
    try {
      // Simulate some operation that might fail
      const random = Math.random()

      if (random < 0.3) {
        throw new UserError('This is a user error - please check your input')
      } else if (random < 0.6) {
        throw new ServerError('This is a server error - please try again later')
      } else {
        setData({ message: 'Operation successful!' })
      }
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant='h5' gutterBottom>
          Error Handling Examples
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          This component demonstrates different error handling scenarios and how to use the error handling system.
        </Typography>

        {/* Error Display */}
        {error && (
          <ErrorDisplay
            error={error}
            onRetry={() => {
              clearError()

              // You could retry the last operation here
            }}
            onDismiss={clearError}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        )}

        {/* Example Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant='outlined'
            onClick={simulateUserError}
            disabled={isLoading}
            sx={{ justifyContent: 'flex-start' }}
          >
            Simulate User Error (4xx)
          </Button>

          <Button
            variant='outlined'
            onClick={simulateServerError}
            disabled={isLoading}
            sx={{ justifyContent: 'flex-start' }}
          >
            Simulate Server Error (5xx)
          </Button>

          <Button
            variant='outlined'
            onClick={simulateValidationError}
            disabled={isLoading}
            sx={{ justifyContent: 'flex-start' }}
          >
            Simulate Validation Error
          </Button>

          <Button
            variant='outlined'
            onClick={useFetchUtility}
            disabled={isLoading}
            sx={{ justifyContent: 'flex-start' }}
          >
            Use Fetch Utility
          </Button>

          <Button
            variant='outlined'
            onClick={manualErrorHandling}
            disabled={isLoading}
            sx={{ justifyContent: 'flex-start' }}
          >
            Manual Error Handling
          </Button>

          <Button variant='outlined' onClick={clearError} disabled={!error} sx={{ justifyContent: 'flex-start' }}>
            Clear Error
          </Button>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              Loading...
            </Typography>
          </Box>
        )}

        {/* Success Data */}
        {data && !error && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant='body2' color='success.contrastText'>
              Success: {JSON.stringify(data, null, 2)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default ErrorHandlingExample
