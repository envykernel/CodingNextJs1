import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material'

interface CancelAppointmentButtonProps {
  appointmentId: number
  t: any
  onAppointmentCancelled?: () => void
  size?: 'small' | 'medium' | 'large'
  variant?: 'text' | 'outlined' | 'contained'
  className?: string
}

const CancelAppointmentButton: React.FC<CancelAppointmentButtonProps> = ({
  appointmentId,
  t,
  onAppointmentCancelled,
  size = 'small',
  variant = 'outlined',
  className = ''
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCancelClick = () => {
    setDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    setLoading(true)

    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (res.ok) {
        if (onAppointmentCancelled) onAppointmentCancelled()
        router.refresh()
      } else {
        console.error('Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    } finally {
      setLoading(false)
      setDialogOpen(false)
    }
  }

  const handleCancelClose = () => {
    setDialogOpen(false)
  }

  return (
    <>
      <Button
        variant={variant}
        color='error'
        size={size}
        className={className}
        onClick={handleCancelClick}
        disabled={loading}
        startIcon={<i className='tabler-x text-lg' />}
      >
        {loading ? t.loading || 'Loading...' : t.cancel || 'Cancel'}
      </Button>

      <Dialog open={dialogOpen} onClose={handleCancelClose}>
        <DialogTitle>{t.confirmCancellation || 'Confirm Cancellation'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t.cancelAppointmentConfirmation || 'Are you sure you want to cancel this appointment?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} disabled={loading}>
            {t.cancel || 'Cancel'}
          </Button>
          <Button onClick={handleCancelConfirm} color='error' disabled={loading}>
            {t.confirm || 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CancelAppointmentButton
