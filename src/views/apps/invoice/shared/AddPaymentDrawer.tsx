// MUI Import
import { useState, useEffect } from 'react'

import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

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
  const [showPayments, setShowPayments] = useState(true)
  const [services, setServices] = useState<any[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null)

  const t = useTranslation()

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(setServices)
  }, [])

  // Helper to get service name by invoice_line_id
  const getServiceNameByLineId = (invoice_line_id: number) => {
    const line = Array.isArray(invoice?.lines) ? invoice.lines.find((l: any) => l.id === invoice_line_id) : null

    if (!line) return ''
    const service = services.find((s: any) => s.id === line.service_id)

    return service ? service.name : ''
  }

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

  const handleDeletePayment = async () => {
    if (!deletingPaymentId) return

    try {
      const res = await fetch(`/api/apps/payment?payment_application_id=${deletingPaymentId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setDeleteDialogOpen(false)
        setDeletingPaymentId(null)
        if (typeof window !== 'undefined') window.location.reload()
      } else {
        setDeleteDialogOpen(false)
        setDeletingPaymentId(null)
      }
    } catch (e) {
      setDeleteDialogOpen(false)
      setDeletingPaymentId(null)
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
            <div className='flex items-center justify-between mb-2'>
              <Typography variant='subtitle1'>{t.invoice?.payments || 'Payments'}</Typography>
              <IconButton size='small' onClick={() => setShowPayments(v => !v)}>
                <i className={showPayments ? 'tabler-chevron-up' : 'tabler-chevron-down'} />
              </IconButton>
            </div>
            <Collapse in={showPayments}>
              <div>
                {payments.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className='flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1 sm:gap-0'
                  >
                    <Typography variant='body2' className='min-w-[90px]'>
                      {Number(p.amount_applied).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                    <Typography variant='body2' className='flex-1 truncate min-w-[120px]'>
                      {getServiceNameByLineId(p.invoice_line_id) || t.invoice?.item || 'Item'}
                    </Typography>
                    <Typography variant='body2' className='min-w-[90px]'>
                      {t.invoice?.[p.payment?.payment_method?.toLowerCase()] || p.payment?.payment_method || 'Payment'}
                    </Typography>
                    <IconButton
                      size='small'
                      color='error'
                      aria-label={t.invoice?.deletePayment || 'Delete Payment'}
                      onClick={() => {
                        setDeletingPaymentId(p.id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <i className='tabler-trash' />
                    </IconButton>
                  </div>
                ))}
              </div>
            </Collapse>
          </div>
        )}
        <PaymentForm
          invoice={invoice}
          payments={payments}
          invoiceBalance={invoiceBalance}
          onSubmit={handleFormSubmit}
        />
      </div>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t.invoice?.confirmDeletePayment || 'Are you sure you want to delete this payment?'}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t.invoice?.cancel || 'Cancel'}</Button>
          <Button color='error' onClick={handleDeletePayment}>
            {t.invoice?.delete || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  )
}

export default AddPaymentDrawer
