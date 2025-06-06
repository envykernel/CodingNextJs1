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
import { useTranslation } from '@/contexts/translationContext'

type Invoice = {
  id: number
  total_amount: number
  payment_apps: any[]
  organisation?: {
    id: number
    currency: string
  }
}

const PreviewActions = ({
  id,
  invoice: initialInvoice,
  refreshInvoice,
  onButtonClick
}: {
  id: string
  invoice: Invoice
  refreshInvoice?: () => void
  onButtonClick: () => void
}) => {
  // States
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false)
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice)

  // Hooks
  const params = useParams() as Record<string, string | string[]> | null
  const locale = params && typeof params === 'object' && 'lang' in params ? params['lang'] : 'en'
  const { t } = useTranslation()

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(setServices)
  }, [])

  // Update invoice state when initialInvoice changes
  useEffect(() => {
    setInvoice(initialInvoice)
  }, [initialInvoice])

  const refreshPaymentData = async () => {
    try {
      const res = await fetch(`/api/apps/invoice/payments?id=${id}`)
      if (!res.ok) throw new Error('Failed to fetch payment data')
      const data = await res.json()
      setInvoice((prev: Invoice) => ({ ...prev, ...data }))
    } catch (error) {
      console.error('Error refreshing payment data:', error)
    }
  }

  const payments = Array.isArray(invoice?.payment_apps) ? invoice.payment_apps : []

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <PaymentProgress invoice={invoice} t={t} />
          <div className='flex items-center gap-4'>
            <Button
              fullWidth
              color='info'
              variant='tonal'
              className='capitalize'
              onClick={onButtonClick}
              startIcon={<i className='tabler-printer' />}
            >
              {t('invoice.print')}
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
              {t('invoice.edit')}
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
            {t('invoice.addPayment')}
          </Button>
        </CardContent>
      </Card>
      <AddPaymentDrawer
        open={paymentDrawerOpen}
        handleClose={() => setPaymentDrawerOpen(false)}
        invoice={invoice}
        refreshInvoice={refreshPaymentData}
      />
      <SendInvoiceDrawer open={sendDrawerOpen} handleClose={() => setSendDrawerOpen(false)} />
      <div className='mt-6'>
        <PaymentsList
          payments={payments}
          invoice={invoice}
          services={services}
          t={t}
          onPaymentDeleted={refreshPaymentData}
        />
      </div>
    </>
  )
}

export default PreviewActions
