'use client'

import React, { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'

import { useTranslation } from '@/contexts/translationContext'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import ErrorDisplay from '@/components/ErrorDisplay'
import { UserError, ServerError, NotFoundError } from '@/utils/errorHandler'

interface LabTestResult {
  id: number
  test_name: string
  category: string | null
  result_value: string | null
  result_unit: string | null
  reference_range: string | null
  ordered_at: string
  visit_date: string | null
  status: string
}

interface PatientLabTestsProps {
  patientId: number
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)

  // Use ISO format (YYYY-MM-DD) for consistent server/client rendering
  return date.toISOString().split('T')[0]
}

const getStatusColor = (status: string): 'default' | 'info' | 'success' | 'error' | 'warning' => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'error'
    default:
      return 'default'
  }
}

const PatientLabTests: React.FC<PatientLabTestsProps> = ({ patientId }) => {
  const [results, setResults] = useState<LabTestResult[]>([])
  const theme = useTheme()
  const { t } = useTranslation()

  const { error, isLoading, handleAsyncOperation, clearError } = useErrorHandler({
    context: 'PatientLabTests',
    showUserErrors: true,
    showServerErrors: true
  })

  useEffect(() => {
    const fetchLabTests = async () => {
      await handleAsyncOperation(
        async () => {
          const res = await fetch(`/api/patient-lab-tests?patientId=${patientId}`)

          if (!res.ok) {
            // Handle different error scenarios
            if (res.status === 404) {
              throw new NotFoundError(t('errors.notFound.patientNotFound'))
            } else if (res.status >= 400 && res.status < 500) {
              throw new UserError(t('errors.fetchFailed'))
            } else {
              throw new ServerError()
            }
          }

          const data = await res.json()

          if (!Array.isArray(data)) {
            throw new ServerError('Invalid data format received')
          }

          setResults(data)
          return data
        },
        {
          onSuccess: data => {
            console.log('Lab tests loaded successfully:', data.length, 'results')
          },
          onError: error => {
            console.error('Failed to load lab tests:', error)
          }
        }
      )
    }

    fetchLabTests()
  }, [patientId, handleAsyncOperation, t])

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent>
          <div className='flex items-center gap-3 mb-4'>
            <i className='tabler-test-pipe text-xl text-primary' />
            <Typography variant='h6'>{t('labTests.title')}</Typography>
          </div>
          <Divider className='mb-4' />
          <ErrorDisplay
            error={error}
            onRetry={() => {
              clearError()
              // Re-fetch data
              handleAsyncOperation(async () => {
                const res = await fetch(`/api/patient-lab-tests?patientId=${patientId}`)
                if (!res.ok) {
                  if (res.status === 404) {
                    throw new NotFoundError(t('errors.notFound.patientNotFound'))
                  } else if (res.status >= 400 && res.status < 500) {
                    throw new UserError(t('errors.fetchFailed'))
                  } else {
                    throw new ServerError()
                  }
                }
                const data = await res.json()
                setResults(data)
                return data
              })
            }}
            onDismiss={clearError}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        </CardContent>
      </Card>
    )
  }

  // Show empty state
  if (results.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className='flex items-center gap-3 mb-4'>
            <i className='tabler-test-pipe text-xl text-primary' />
            <Typography variant='h6'>{t('labTests.title')}</Typography>
          </div>
          <Divider className='mb-4' />
          <Typography color='text.secondary'>{t('labTests.noResults')}</Typography>
        </CardContent>
      </Card>
    )
  }

  // Show data
  return (
    <Card>
      <CardContent>
        <div className='flex items-center gap-3 mb-4'>
          <i className='tabler-test-pipe text-xl text-primary' />
          <Typography variant='h6'>{t('labTests.title')}</Typography>
        </div>
        <Divider className='mb-4' />
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 3,
            borderRadius: 0,
            background: theme.palette.background.paper
          }}
        >
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ background: theme.palette.action.hover }}>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  {t('labTests.testName')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  {t('labTests.status')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  {t('labTests.result')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  {t('labTests.unit')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  {t('labTests.referenceRange')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  {t('labTests.date')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map(result => (
                <TableRow
                  key={result.id}
                  sx={{
                    opacity: result.status === 'pending' ? 0.7 : 1,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <TableCell>{result.test_name}</TableCell>
                  <TableCell>
                    <Chip label={result.status} size='small' color={getStatusColor(result.status)} />
                  </TableCell>
                  <TableCell>
                    {result.status === 'pending' ? (
                      <Typography color='text.secondary' sx={{ fontStyle: 'italic' }}>
                        {t('labTests.pendingResult')}
                      </Typography>
                    ) : (
                      result.result_value || '-'
                    )}
                  </TableCell>
                  <TableCell>{result.result_unit || '-'}</TableCell>
                  <TableCell>{result.reference_range || '-'}</TableCell>
                  <TableCell>{formatDate(result.visit_date || result.ordered_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default PatientLabTests
