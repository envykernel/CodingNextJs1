'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'

// Component Imports
import AddPaymentDrawer from '@views/apps/invoice/shared/AddPaymentDrawer'
import SendInvoiceDrawer from '@views/apps/invoice/shared/SendInvoiceDrawer'
import PaymentsList from '../shared/PaymentsList'
import PaymentProgress from './PaymentProgress'

// Translation Imports
import { useTranslation } from '@/contexts/translationContext'

type EditActionsProps = { invoice: any; refreshInvoice?: () => void }

const EditActions = ({ invoice, refreshInvoice }: EditActionsProps) => {
  const { t } = useTranslation()

  // States
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false)
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false)
  const [services, setServices] = useState<any[]>([])

  // Hooks
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(setServices)
  }, [])

  const payments = Array.isArray(invoice?.payment_apps) ? invoice.payment_apps : []

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <PaymentProgress invoice={invoice} t={t} />
            <Button
              fullWidth
              color='success'
              variant='contained'
              className='capitalize'
              onClick={() => setPaymentDrawerOpen(true)}
              startIcon={<i className='tabler-currency-dollar' />}
            >
              {t('invoice.addPayment')}
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
