import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress
} from '@mui/material'

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
        startIcon={loading ? <CircularProgress size={20} color='inherit' /> : <i className='tabler-x text-lg' />}
      >
        {loading ? t('appointments.actions.loading') : t('appointments.actions.cancel')}
      </Button>

      <Dialog open={dialogOpen} onClose={handleCancelClose}>
        <DialogTitle>{t('appointments.actions.confirmCancellation')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('appointments.actions.cancelAppointmentConfirmation')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} disabled={loading}>
            {t('appointments.actions.cancel')}
          </Button>
          <Button
            onClick={handleCancelConfirm}
            color='error'
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color='inherit' /> : undefined}
          >
            {loading ? t('appointments.actions.loading') : t('appointments.actions.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CancelAppointmentButton
