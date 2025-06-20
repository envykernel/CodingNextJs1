import React from 'react'

import { Button, Card, CardContent, Typography, Box, Grid } from '@mui/material'

import { useErrorHandler } from '@/hooks/useErrorHandler'
import ErrorDisplay from '@/components/ErrorDisplay'

const AllErrorsTest: React.FC = () => {
  const { error, isLoading, handleAsyncOperation, clearError } = useErrorHandler({
    context: 'AllErrorsTest',
    showUserErrors: true,
    showServerErrors: true
  })

  const testError = async (errorType: string) => {
    await handleAsyncOperation(
      async () => {
        const res = await fetch(`/api/test-all-errors?errorType=${errorType}`)

        if (!res.ok) {
          // Handle different error scenarios based on status
          if (res.status === 404) {
            throw new Error('Resource not found')
          } else if (res.status === 400) {
            throw new Error('Invalid request data')
          } else if (res.status === 401) {
            throw new Error('Authentication required')
          } else if (res.status === 403) {
            throw new Error('Access denied')
          } else if (res.status === 409) {
            throw new Error('Resource conflict')
          } else if (res.status >= 500) {
            throw new Error('Server error')
          }
        }

        return await res.json()
      },
      {
        onSuccess: data => {
          console.log('Success:', data)
        },
        onError: error => {
          console.log(`${errorType} error handled:`, error)
        }
      }
    )
  }

  const errorTypes = [
    { type: 'notfound', label: '404 - Not Found', description: 'Resource not found' },
    { type: 'validation', label: '400 - Validation', description: 'Invalid input data' },
    { type: 'authentication', label: '401 - Authentication', description: 'Please sign in' },
    { type: 'authorization', label: '403 - Authorization', description: 'Access denied' },
    { type: 'conflict', label: '409 - Conflict', description: 'Resource already exists' },
    { type: 'user', label: '400 - User Error', description: 'Invalid request' },
    { type: 'server', label: '500 - Server Error', description: 'Internal server error' },
    { type: 'database', label: '500 - Database', description: 'Database connection error' }
  ]

  return (
    <Card sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant='h5' gutterBottom>
          All Error Types Test
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          This component demonstrates how different error types are handled and displayed.
        </Typography>

        {/* Error Display */}
        {error && (
          <Box sx={{ mb: 3 }}>
            <ErrorDisplay
              error={error}
              onRetry={() => {
                clearError()

                // You could retry the last operation here
              }}
              onDismiss={clearError}
              showDetails={process.env.NODE_ENV === 'development'}
            />
          </Box>
        )}

        {/* Error Type Buttons */}
        <Grid container spacing={2}>
          {errorTypes.map(errorType => (
            <Grid item xs={12} sm={6} md={4} key={errorType.type}>
              <Button
                variant='outlined'
                onClick={() => testError(errorType.type)}
                disabled={isLoading}
                sx={{
                  justifyContent: 'flex-start',
                  width: '100%',
                  textAlign: 'left',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 2,
                  height: 'auto'
                }}
              >
                <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
                  {errorType.label}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {errorType.description}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Instructions */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant='body2' color='info.contrastText'>
            <strong>What happens for each error type:</strong>
            <br />
            <br />
            <strong>User Errors (4xx) - 🟡 Yellow Warning:</strong>
            <br />
            • Show specific, actionable messages
            <br />
            • Tell users exactly what to fix
            <br />
            • Use warning styling (yellow)
            <br />
            <br />
            <strong>Server Errors (5xx) - 🔴 Red Error:</strong>
            <br />
            • Show generic, friendly messages
            <br />
            • Hide technical details from users
            <br />
            • Use error styling (red)
            <br />
            <br />
            <strong>Development Mode:</strong>
            <br />
            • Shows technical details for debugging
            <br />• Includes error codes and stack traces
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default AllErrorsTest
