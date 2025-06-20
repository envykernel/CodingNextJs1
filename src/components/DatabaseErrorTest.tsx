import React from 'react'

import { Button, Card, CardContent, Typography, Box } from '@mui/material'

import { useErrorHandler } from '@/hooks/useErrorHandler'
import ErrorDisplay from '@/components/ErrorDisplay'

const DatabaseErrorTest: React.FC = () => {
  const { error, isLoading, handleAsyncOperation, clearError } = useErrorHandler({
    context: 'DatabaseErrorTest',
    showUserErrors: true,
    showServerErrors: true
  })

  const testDatabaseError = async () => {
    await handleAsyncOperation(
      async () => {
        const res = await fetch('/api/test-database-error')

        if (!res.ok) {
          // This will be a 500 error with database connection error
          throw new Error('Database connection failed')
        }

        return await res.json()
      },
      {
        onSuccess: data => {
          console.log('Success:', data)
        },
        onError: error => {
          console.log('Database error handled:', error)
        }
      }
    )
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant='h5' gutterBottom>
          Database Error Test
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          This component demonstrates what happens when a database connection error occurs.
        </Typography>

        {/* Error Display */}
        {error && (
          <ErrorDisplay
            error={error}
            onRetry={testDatabaseError}
            onDismiss={clearError}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        )}

        {/* Test Button */}
        <Box sx={{ mt: 2 }}>
          <Button
            variant='outlined'
            onClick={testDatabaseError}
            disabled={isLoading}
            sx={{ justifyContent: 'flex-start' }}
          >
            {isLoading ? 'Testing Database Error...' : 'Simulate Database Connection Error'}
          </Button>
        </Box>

        {/* Instructions */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant='body2' color='info.contrastText'>
            <strong>What you&apos;ll see:</strong>
            <br />• <strong>Production:</strong> Generic &quot;Service Temporarily Unavailable&quot; message
            <br />• <strong>Development:</strong> Technical details about the database error
            <br />• <strong>Retry:</strong> Users can retry the operation
            <br />• <strong>Dismiss:</strong> Users can dismiss the error message
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default DatabaseErrorTest
