'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme, alpha } from '@mui/material/styles'
import TableFooter from '@mui/material/TableFooter'
import Paper from '@mui/material/Paper'

// Type Imports
import type { PaymentMethod } from '@prisma/client'

interface Payment {
  id: number
  receipt_number: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  transaction_id: string | null
  patient: {
    name: string
  }
}

const ThisWeekPayments = () => {
  const theme = useTheme()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments/this-week')

        if (!response.ok) {
          throw new Error('Failed to fetch payments')
        }

        const data = await response.json()

        setPayments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getPaymentMethodColor = (method: PaymentMethod) => {
    const colors: Record<PaymentMethod, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
      CASH: 'success',
      CARD: 'info',
      BANK_TRANSFER: 'warning',
      MOBILE_MONEY: 'error',
      INSURANCE: 'default',
      CHEQUE: 'default',
      OTHER: 'default'
    }

    return colors[method] || 'default'
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color='error' align='center'>
            {error}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '& .MuiCardContent-root': {
          flex: 1,
          p: 0
        }
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 42,
                height: 42,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  transform: 'scale(1.05)'
                }
              }}
            >
              <i className='tabler-cash text-2xl' />
            </Box>
            <Box>
              <Typography variant='h5' sx={{ mb: 0.5, fontWeight: 500 }}>
                This Week&apos;s Payments
              </Typography>
              <Typography
                variant='subtitle2'
                sx={{
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <i className='tabler-currency-dollar text-lg' />
                Total: {formatAmount(totalAmount)}
              </Typography>
            </Box>
          </Box>
        }
        sx={{
          pb: 2,
          '& .MuiCardHeader-content': {
            overflow: 'hidden'
          }
        }}
      />
      <CardContent>
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            '& .MuiTable-root': {
              borderCollapse: 'separate',
              borderSpacing: 0
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.04),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 2.5
                  }}
                >
                  Receipt #
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.04),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 2.5
                  }}
                >
                  Patient
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.04),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 2.5
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.04),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 2.5
                  }}
                >
                  Method
                </TableCell>
                <TableCell
                  align='right'
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.04),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 2.5
                  }}
                >
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <i className='tabler-cash-off text-4xl' style={{ color: theme.palette.text.disabled }} />
                      <Typography color='text.secondary'>No payments found for this week</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {payments.map(payment => (
                    <TableRow
                      key={payment.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.04)
                        },
                        '&:last-child td': { borderBottom: 0 }
                      }}
                    >
                      <TableCell sx={{ py: 2.5 }}>{payment.receipt_number}</TableCell>
                      <TableCell sx={{ py: 2.5 }}>{payment.patient.name}</TableCell>
                      <TableCell sx={{ py: 2.5 }}>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Chip
                          label={payment.payment_method.replace('_', ' ')}
                          color={getPaymentMethodColor(payment.payment_method)}
                          size='small'
                          sx={{
                            fontWeight: 500,
                            '& .MuiChip-label': { px: 1.5 }
                          }}
                        />
                      </TableCell>
                      <TableCell align='right' sx={{ py: 2.5, fontWeight: 500 }}>
                        {formatAmount(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell
                  colSpan={4}
                  align='right'
                  sx={{
                    py: 2.5,
                    fontWeight: 600,
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.04),
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  Total
                </TableCell>
                <TableCell
                  align='right'
                  sx={{
                    py: 2.5,
                    fontWeight: 600,
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.04),
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    color: 'primary.main'
                  }}
                >
                  {formatAmount(totalAmount)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default ThisWeekPayments
