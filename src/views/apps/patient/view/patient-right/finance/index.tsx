'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/contexts/translationContext'
import { useParams } from 'next/navigation'

import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Stack,
  Divider,
  LinearProgress
} from '@mui/material'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DownloadIcon from '@mui/icons-material/Download'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PaymentIcon from '@mui/icons-material/Payment'
import PendingActionsIcon from '@mui/icons-material/PendingActions'

interface Invoice {
  id: number
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL'
  recordStatus: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
  notes?: string
}

interface FinanceStats {
  totalInvoiced: number
  totalPaid: number
  totalPending: number
  totalPartial: number
  paidPercentage: number
  pendingPercentage: number
  partialPercentage: number
}

interface FinanceTabProps {
  patientId: number
  patientData: any
}

const FinanceTab = ({ patientId, patientData }: FinanceTabProps) => {
  const { t } = useTranslation()
  const params = useParams()
  const locale = (params as any)?.lang || 'en'
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<FinanceStats>({
    totalInvoiced: 0,
    totalPaid: 0,
    totalPending: 0,
    totalPartial: 0,
    paidPercentage: 0,
    pendingPercentage: 0,
    partialPercentage: 0
  })

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`/api/invoices/patient/${patientId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch invoices')
        }
        const data = await response.json()
        setInvoices(data)

        // Calculate statistics
        const totalInvoiced = data.reduce((sum: number, invoice: Invoice) => sum + invoice.totalAmount, 0)
        const totalPaid = data
          .filter((invoice: Invoice) => invoice.paymentStatus === 'PAID')
          .reduce((sum: number, invoice: Invoice) => sum + invoice.totalAmount, 0)
        const totalPending = data
          .filter((invoice: Invoice) => invoice.paymentStatus === 'PENDING')
          .reduce((sum: number, invoice: Invoice) => sum + invoice.totalAmount, 0)
        const totalPartial = data
          .filter((invoice: Invoice) => invoice.paymentStatus === 'PARTIAL')
          .reduce((sum: number, invoice: Invoice) => sum + invoice.totalAmount, 0)

        setStats({
          totalInvoiced,
          totalPaid,
          totalPending,
          totalPartial,
          paidPercentage: totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0,
          pendingPercentage: totalInvoiced > 0 ? (totalPending / totalInvoiced) * 100 : 0,
          partialPercentage: totalInvoiced > 0 ? (totalPartial / totalInvoiced) * 100 : 0
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [patientId])

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success'
      case 'PARTIAL':
        return 'warning'
      case 'PENDING':
        return 'error'
      default:
        return 'default'
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return t('finance.paymentStatus.paid') || 'Paid'
      case 'PARTIAL':
        return t('finance.paymentStatus.partial') || 'Partial'
      case 'PENDING':
        return t('finance.paymentStatus.pending') || 'Pending'
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <PaymentIcon color='success' />
      case 'PARTIAL':
        return <AccountBalanceWalletIcon color='warning' />
      case 'PENDING':
        return <PendingActionsIcon color='error' />
      default:
        return <ReceiptIcon />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title={t('patientView.tabs.finance') || 'Finance'} avatar={<AttachMoneyIcon color='primary' />} />
      <CardContent>
        {/* Global Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <TrendingUpIcon color='primary' sx={{ mr: 1 }} />
                <Typography variant='h6' color='primary'>
                  {t('finance.totalInvoiced') || 'Total Invoiced'}
                </Typography>
              </Box>
              <Typography variant='h4' fontWeight='bold' color='primary'>
                {formatCurrency(stats.totalInvoiced)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {invoices.length} {t('finance.invoices') || 'invoices'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <PaymentIcon color='success' sx={{ mr: 1 }} />
                <Typography variant='h6' color='success.main'>
                  {t('finance.totalPaid') || 'Total Paid'}
                </Typography>
              </Box>
              <Typography variant='h4' fontWeight='bold' color='success.main'>
                {formatCurrency(stats.totalPaid)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {stats.paidPercentage.toFixed(1)}% {t('finance.ofTotal') || 'of total'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <PendingActionsIcon color='error' sx={{ mr: 1 }} />
                <Typography variant='h6' color='error.main'>
                  {t('finance.totalPending') || 'Total Pending'}
                </Typography>
              </Box>
              <Typography variant='h4' fontWeight='bold' color='error.main'>
                {formatCurrency(stats.totalPending)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {stats.pendingPercentage.toFixed(1)}% {t('finance.ofTotal') || 'of total'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <AccountBalanceWalletIcon color='warning' sx={{ mr: 1 }} />
                <Typography variant='h6' color='warning.main'>
                  {t('finance.totalPartial') || 'Partial Payments'}
                </Typography>
              </Box>
              <Typography variant='h4' fontWeight='bold' color='warning.main'>
                {formatCurrency(stats.totalPartial)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {stats.partialPercentage.toFixed(1)}% {t('finance.ofTotal') || 'of total'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Payment Progress Bar */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            {t('finance.paymentProgress') || 'Payment Progress'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <LinearProgress
                variant='determinate'
                value={stats.paidPercentage}
                color='success'
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography variant='body2' color='text.secondary'>
              {stats.paidPercentage.toFixed(1)}%
            </Typography>
          </Box>
          <Typography variant='body2' color='text.secondary'>
            {t('finance.paidAmount') || 'Paid'}: {formatCurrency(stats.totalPaid)} /{' '}
            {formatCurrency(stats.totalInvoiced)}
          </Typography>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Invoices Table */}
        <Typography variant='h6' gutterBottom>
          {t('finance.invoiceDetails') || 'Invoice Details'}
        </Typography>

        {invoices.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant='h6' color='text.secondary' gutterBottom>
              {t('finance.noInvoices') || 'No invoices found'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('finance.noInvoicesDescription') || 'This patient has no invoices yet.'}
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{t('finance.invoiceNumber') || 'Invoice #'}</TableCell>
                  <TableCell>{t('finance.invoiceDate') || 'Date'}</TableCell>
                  <TableCell>{t('finance.dueDate') || 'Due Date'}</TableCell>
                  <TableCell align='right'>{t('finance.amount') || 'Amount'}</TableCell>
                  <TableCell>{t('finance.paymentStatus') || 'Status'}</TableCell>
                  <TableCell align='right'>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map(invoice => (
                  <TableRow
                    key={invoice.id}
                    hover
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon color='primary' fontSize='small' />
                        <Typography variant='body2' fontWeight='medium'>
                          {invoice.invoiceNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell align='right'>
                      <Typography variant='body2' fontWeight='medium'>
                        {formatCurrency(invoice.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(invoice.paymentStatus)}
                        <Chip
                          label={getPaymentStatusLabel(invoice.paymentStatus)}
                          color={getPaymentStatusColor(invoice.paymentStatus) as any}
                          size='small'
                          variant='outlined'
                        />
                      </Box>
                    </TableCell>
                    <TableCell align='right'>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title={t('finance.viewInvoice') || 'View Invoice'}>
                          <IconButton size='small' href={`/${locale}/apps/invoices/${invoice.id}`} target='_blank'>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('finance.downloadInvoice') || 'Download Invoice'}>
                          <IconButton
                            size='small'
                            href={`/${locale}/apps/invoices/${invoice.id}/download`}
                            target='_blank'
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default FinanceTab
