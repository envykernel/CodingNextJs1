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
import { useTheme } from '@mui/material/styles'

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
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.main
              }}
            >
              <i className='tabler-cash text-xl' />
            </Box>
            <Box>
              <Typography variant='h5'>This Week&apos;s Payments</Typography>
              <Typography variant='subtitle2' color='text.secondary'>
                Total: {formatAmount(totalAmount)}
              </Typography>
            </Box>
          </Box>
        }
      />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Receipt #</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Method</TableCell>
                <TableCell align='right'>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center'>
                    No payments found for this week
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {payments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.receipt_number}</TableCell>
                      <TableCell>{payment.patient.name}</TableCell>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.payment_method.replace('_', ' ')}
                          color={getPaymentMethodColor(payment.payment_method)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell align='right'>{formatAmount(payment.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} align='right' sx={{ fontWeight: 'bold' }}>
                      Total
                    </TableCell>
                    <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                      {formatAmount(totalAmount)}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default ThisWeekPayments
