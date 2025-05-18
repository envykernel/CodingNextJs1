import { useState, Fragment } from 'react'

import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import type { TimelineProps } from '@mui/lab/Timeline'

const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  },
  '& .MuiTimelineDot-root': {
    border: 0,
    padding: 0
  }
})

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
        <Timeline>
          {payments.map((p: any, idx: number) => (
            <Fragment key={idx}>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color='primary' variant='outlined'>
                    <i className='tabler-currency-dollar text-lg text-primary' />
                  </TimelineDot>
                  {idx !== payments.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent className='flex flex-col h-full pbs-0 pis-4 pbe-2'>
                  <div className='flex-1 flex flex-col gap-0.5'>
                    <Typography variant='body2' className='font-bold text-green-700 dark:text-green-400'>
                      {Number(p.amount_applied).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                    <div className='flex items-start w-full gap-2'>
                      <div className='flex flex-col'>
                        <Tooltip title={getServiceNameByLineId(p.invoice_line_id) || t.invoice?.item || 'Item'}>
                          <span className='inline-block mb-1'>
                            <span className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded px-2 py-0.5 text-xs font-medium'>
                              {getServiceNameByLineId(p.invoice_line_id) || t.invoice?.item || 'Item'}
                            </span>
                          </span>
                        </Tooltip>
                        <span className='bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded px-2 py-0.5 text-xs font-medium'>
                          {t.invoice?.[p.payment?.payment_method?.toLowerCase()] ||
                            p.payment?.payment_method ||
                            'Payment'}
                        </span>
                      </div>
                      <div className='flex-1' />
                      <Tooltip title={t.invoice?.deletePayment || 'Delete Payment'}>
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
                      </Tooltip>
                    </div>
                    <Typography variant='caption' color='text.disabled'>
                      {p.payment?.payment_date ? new Date(p.payment.payment_date).toISOString().split('T')[0] : '-'}
                    </Typography>
                  </div>
                </TimelineContent>
              </TimelineItem>
            </Fragment>
          ))}
        </Timeline>
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
