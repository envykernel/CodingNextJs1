'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { InvoiceType } from '@/types/apps/invoiceTypes'

// Translation Imports
import { useTranslation } from '@/contexts/translationContext'

interface InvoiceStatsProps {
  invoiceData?: InvoiceType[]
}

const InvoiceStats = ({ invoiceData = [] }: InvoiceStatsProps) => {
  // Hooks
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const t = useTranslation()

  // Calculate statistics
  const totalInvoices = invoiceData.length

  // Calculate total amount of all invoices
  const totalAmount = invoiceData.reduce((sum, invoice) => {
    const total = Number(invoice.total) || 0

    return sum + total
  }, 0)

  const totalPaid = invoiceData.reduce((sum, invoice) => {
    const total = Number(invoice.total) || 0

    const balance =
      typeof invoice.balance === 'string'
        ? Number(invoice.balance.replace(/[^0-9.-]+/g, ''))
        : Number(invoice.balance) || 0

    return sum + (total - balance)
  }, 0)

  const totalUnpaid = invoiceData.reduce((sum, invoice) => {
    const balance =
      typeof invoice.balance === 'string'
        ? Number(invoice.balance.replace(/[^0-9.-]+/g, ''))
        : Number(invoice.balance) || 0

    return sum + balance
  }, 0)

  // Count unpaid invoices (invoices with balance > 0)
  const unpaidInvoicesCount = invoiceData.filter(invoice => {
    const balance =
      typeof invoice.balance === 'string'
        ? Number(invoice.balance.replace(/[^0-9.-]+/g, ''))
        : Number(invoice.balance) || 0

    return balance > 0
  }).length

  // Calculate percentage of total amount that is paid
  const paidPercentage = totalAmount ? Math.round((totalPaid / totalAmount) * 100) : 0

  // Format large numbers with k suffix
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }

    return num.toString()
  }

  return (
    <Card className='bs-full'>
      <CardContent>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <div className='flex flex-col items-start gap-2 is-full sm:is-6/12'>
            <div className='flex items-center gap-2'>
              <Typography variant='h3' color='success.main'>
                {formatNumber(totalPaid)}
              </Typography>
              <i className='tabler-currency-euro text-[32px] text-success' />
            </div>
            <Typography className='font-medium' color='text.primary'>
              {t.invoice?.totalInvoices || 'Total'} {formatNumber(totalInvoices)} {t.invoice?.invoices || 'invoices'}
            </Typography>
            <Typography>{t.invoice?.allInvoicesTracked || 'All invoices are tracked and managed'}</Typography>
            <div className='flex items-center gap-2'>
              <Chip
                label={`${paidPercentage}% ${t.invoice?.paid || 'Paid'}`}
                variant='tonal'
                size='small'
                color='success'
              />
              <Chip
                label={`${unpaidInvoicesCount} ${t.invoice?.unpaid || 'Unpaid'}`}
                variant='tonal'
                size='small'
                color='error'
              />
            </div>
          </div>
          <Divider orientation={isSmallScreen ? 'horizontal' : 'vertical'} flexItem />
          <div className='flex flex-col gap-3 is-full sm:is-6/12'>
            <div className='flex items-center gap-2'>
              <Typography variant='body2' className='text-nowrap'>
                {t.invoice?.totalPaid || 'Total Paid'}
              </Typography>
              <Typography variant='h6' color='success.main' className='is-full text-end'>
                {totalPaid.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
              </Typography>
            </div>
            <div className='flex items-center gap-2'>
              <Typography variant='body2' className='text-nowrap'>
                {t.invoice?.totalUnpaid || 'Total Unpaid'}
              </Typography>
              <Typography variant='h6' color='error.main' className='is-full text-end'>
                {totalUnpaid.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
              </Typography>
            </div>
            <div className='flex items-center gap-2'>
              <Typography variant='body2' className='text-nowrap'>
                {t.invoice?.unpaidInvoices || 'Unpaid Invoices'}
              </Typography>
              <Typography variant='h6' color='error.main' className='is-full text-end'>
                {formatNumber(unpaidInvoicesCount)}
              </Typography>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InvoiceStats
