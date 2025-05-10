'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import AddPaymentDrawer from '@views/apps/invoice/shared/AddPaymentDrawer'
import SendInvoiceDrawer from '@views/apps/invoice/shared/SendInvoiceDrawer'
import PaymentsList from '../shared/PaymentsList'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

type EditActionsProps = { invoice: any; refreshInvoice?: () => void }

const EditActions = ({ invoice, refreshInvoice }: EditActionsProps) => {
  // States
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false)
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false)
  const [services, setServices] = useState<any[]>([])

  // Hooks
  const params = useParams() as Record<string, string>
  const locale = params && typeof params['lang'] === 'string' ? params['lang'] : 'en'
  const t = require('@/contexts/translationContext').useTranslation()

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(setServices)
  }, [])

  const payments = Array.isArray(invoice?.payment_applications) ? invoice.payment_applications : []

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <Button
              fullWidth
              variant='contained'
              className='capitalize'
              startIcon={<i className='tabler-send' />}
              onClick={() => setSendDrawerOpen(true)}
            >
              Send Invoice
            </Button>
            <div className='flex items-center gap-4'>
              <Button
                fullWidth
                component={Link}
                color='secondary'
                variant='tonal'
                className='capitalize'
                href={getLocalizedUrl(`/apps/invoice/preview/${invoice.id}`, locale as Locale)}
              >
                Preview
              </Button>
              <Button fullWidth color='secondary' variant='tonal' className='capitalize'>
                Save
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
          <PaymentsList payments={payments} invoice={invoice} services={services} t={t} />
        </div>
      </Grid>
    </Grid>
  )
}

export default EditActions
