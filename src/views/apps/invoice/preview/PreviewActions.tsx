// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import AddPaymentDrawer from '@views/apps/invoice/shared/AddPaymentDrawer'
import SendInvoiceDrawer from '@views/apps/invoice/shared/SendInvoiceDrawer'
import PaymentProgress from '@views/apps/invoice/edit/PaymentProgress'
import PaymentsList from '../shared/PaymentsList'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const PreviewActions = ({
  id,
  invoice,
  refreshInvoice,
  onButtonClick
}: {
  id: string
  invoice: any
  refreshInvoice?: () => void
  onButtonClick: () => void
}) => {
  // States
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false)
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false)
  const [services, setServices] = useState<any[]>([])

  // Hooks
  const params = useParams() as Record<string, string | string[]> | null
  const locale = params && typeof params === 'object' && 'lang' in params ? params['lang'] : 'en'

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(setServices)
  }, [])

  const payments = Array.isArray(invoice?.payment_apps) ? invoice.payment_apps : []

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <PaymentProgress
            invoice={invoice}
            t={{ invoice: { totalAmount: 'Total', paid: 'Paid', remaining: 'Remaining' } }}
          />
          <div className='flex items-center gap-4'>
            <Button
              fullWidth
              color='info'
              variant='tonal'
              className='capitalize'
              onClick={onButtonClick}
              startIcon={<i className='tabler-printer' />}
            >
              Print
            </Button>
            <Button
              fullWidth
              component={Link}
              color='primary'
              variant='contained'
              className='capitalize'
              href={getLocalizedUrl(`/apps/invoice/edit/${id}`, locale as Locale)}
              startIcon={<i className='tabler-edit' />}
            >
              Edit
            </Button>
          </div>
          <Button
            fullWidth
            color='success'
            variant='contained'
            className='capitalize'
            onClick={() => setPaymentDrawerOpen(true)}
            startIcon={<i className='tabler-currency-dollar' />}
          >
            Add Payment
          </Button>
        </CardContent>
      </Card>
      <AddPaymentDrawer
        open={paymentDrawerOpen}
        handleClose={() => setPaymentDrawerOpen(false)}
        invoice={invoice}
        refreshInvoice={refreshInvoice}
      />
      <SendInvoiceDrawer open={sendDrawerOpen} handleClose={() => setSendDrawerOpen(false)} />
      <div className='mt-6'>
        <PaymentsList
          payments={payments}
          invoice={invoice}
          services={services}
          t={{
            invoice: {
              payments: 'Payments',
              item: 'Item',
              deletePayment: 'Delete Payment',
              confirmDeletePayment: 'Are you sure you want to delete this payment?',
              cancel: 'Cancel',
              delete: 'Delete'
            }
          }}
        />
      </div>
    </>
  )
}

export default PreviewActions
