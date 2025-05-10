import { useState } from 'react'

import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const PaymentsList = ({ payments, invoice, services, t, onPaymentDeleted }: any) => {
  const [showPayments, setShowPayments] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null)

  // Helper to get service name by invoice_line_id
  const getServiceNameByLineId = (invoice_line_id: number) => {
    const line = Array.isArray(invoice?.lines) ? invoice.lines.find((l: any) => l.id === invoice_line_id) : null

    if (!line) return ''
    const service = services.find((s: any) => s.id === line.service_id)

    return service ? service.name : ''
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
        if (onPaymentDeleted) onPaymentDeleted()
      } else {
        setDeleteDialogOpen(false)
        setDeletingPaymentId(null)
      }
    } catch (e) {
      setDeleteDialogOpen(false)
      setDeletingPaymentId(null)
    }
  }

  if (!payments || payments.length === 0) return null

  return (
    <div className='mb-6'>
      <div className='flex items-center justify-between mb-2'>
        <Typography variant='subtitle1' className='font-bold'>
          {t.invoice?.payments || 'Payments'}
        </Typography>
        <IconButton size='small' onClick={() => setShowPayments(v => !v)}>
          <i className={showPayments ? 'tabler-chevron-up' : 'tabler-chevron-down'} />
        </IconButton>
      </div>
      <Collapse in={showPayments}>
        <div>
          {payments.map((p: any, idx: number) => (
            <div key={idx} className='flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1 sm:gap-0'>
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t.invoice?.confirmDeletePayment || 'Are you sure you want to delete this payment?'}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t.invoice?.cancel || 'Cancel'}</Button>
          <Button color='error' onClick={handleDeletePayment}>
            {t.invoice?.delete || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default PaymentsList
