// MUI Import
import { useState } from 'react'

import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Component Imports
import PaymentForm from './PaymentForm'
import { useTranslation } from '@/contexts/translationContext'

type Props = {
  open: boolean
  handleClose: () => void
  invoice?: any
}

const AddPaymentDrawer = ({ open, handleClose, invoice }: Props) => {
  // Add payments and balance calculation
  const payments = Array.isArray(invoice?.payment_applications) ? invoice.payment_applications : []

  const invoiceBalance =
    Number(invoice?.total_amount || 0) - payments.reduce((sum: number, p: any) => sum + Number(p.amount_applied), 0)

  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  let timeoutId: NodeJS.Timeout | null = null

  const t = useTranslation()

  const handleFormSubmit = async (formData: any) => {
    if (!invoice) return handleClose()

    try {
      const res = await fetch('/api/apps/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organisation_id: invoice.organisation_id,
          patient_id: invoice.patient_id,
          invoice_id: invoice.id,
          invoice_line_id: formData.itemId,
          amount: formData.paymentAmount,
          payment_date: formData.paymentDate,
          payment_method: formData.paymentMethod,
          notes: formData.paymentNote
        })
      })

      if (res.ok) {
        setSuccess('Payment added successfully!')
        setError(null)
        timeoutId = setTimeout(() => setSuccess(null), 3000)
        handleClose()
      } else {
        setError('Failed to add payment.')
        setSuccess(null)
        timeoutId = setTimeout(() => setError(null), 3000)
      }
    } catch (e) {
      setError('Failed to add payment.')
      setSuccess(null)
      timeoutId = setTimeout(() => setError(null), 3000)
      handleClose()
    }
  }

  // Clear messages on drawer close
  const handleDrawerClose = () => {
    setSuccess(null)
    setError(null)
    if (timeoutId) clearTimeout(timeoutId)
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleDrawerClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>{t.invoice?.addPayment || 'Add Payment'}</Typography>
        <IconButton size='small' onClick={handleDrawerClose}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        {success && (
          <Alert severity='success' sx={{ mb: 2 }}>
            {t.invoice?.paymentSuccess || 'Payment added successfully!'}
          </Alert>
        )}
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {t.invoice?.paymentError || 'Failed to add payment.'}
          </Alert>
        )}
        {/* List of existing payments */}
        {payments.length > 0 && (
          <div className='mb-6'>
            <Typography variant='subtitle1' className='mb-2'>
              {t.invoice?.payments || 'Payments'}
            </Typography>
            {payments.map((p: any, idx: number) => (
              <div key={idx} className='flex justify-between mb-1'>
                <Typography variant='body2'>
                  {t.invoice?.[p.payment_method] || p.payment_method || 'Payment'}
                </Typography>
                <Typography variant='body2' color='text.primary'>
                  {Number(p.amount_applied).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                </Typography>
              </div>
            ))}
          </div>
        )}
        <PaymentForm
          invoice={invoice}
          payments={payments}
          invoiceBalance={invoiceBalance}
          onSubmit={handleFormSubmit}
        />
      </div>
    </Drawer>
  )
}

export default AddPaymentDrawer
