import React from 'react'

import { Alert, AlertTitle, Button, Box, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import RefreshIcon from '@mui/icons-material/Refresh'
import CloseIcon from '@mui/icons-material/Close'

import type { ErrorState } from '@/hooks/useErrorHandler'

interface ErrorDisplayProps {
  error: ErrorState
  onRetry?: () => void
  onDismiss?: () => void
  showDetails?: boolean
  className?: string
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  className = ''
}) => {
  if (!error.hasError) {
    return null
  }

  const getSeverity = () => {
    if (error.isUserError) return 'warning' as const
    if (error.isServerError) return 'error' as const

    return 'info' as const
  }

  const getIcon = () => {
    if (error.isUserError) return <WarningIcon />
    if (error.isServerError) return <WarningIcon />

    return <WarningIcon />
  }

  return (
    <Box className={`error-display ${className}`} sx={{ mb: 2 }}>
      <Alert
        severity={getSeverity()}
        icon={getIcon()}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {onRetry && (
              <Button size='small' onClick={onRetry} startIcon={<RefreshIcon />} sx={{ minWidth: 'auto', p: 0.5 }}>
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button size='small' onClick={onDismiss} startIcon={<CloseIcon />} sx={{ minWidth: 'auto', p: 0.5 }}>
                Dismiss
              </Button>
            )}
          </Box>
        }
        sx={{
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>{error.title}</AlertTitle>

        <Typography variant='body2' sx={{ mb: showDetails && error.details ? 1 : 0 }}>
          {error.message}
        </Typography>

        {showDetails && error.details && (
          <Box
            sx={{
              mt: 1,
              p: 1,
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: 1,
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {error.details}
          </Box>
        )}
      </Alert>
    </Box>
  )
}

export default ErrorDisplay
