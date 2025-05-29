import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from '@mui/material'
import { useTranslation } from '@/contexts/translationContext'

interface CancelAppointmentButtonProps {
  appointmentId: number
  size?: 'small' | 'medium' | 'large'
  variant?: 'text' | 'outlined' | 'contained'
  className?: string
  onAppointmentCancelled?: () => void
}

const CancelAppointmentButton: React.FC<CancelAppointmentButtonProps> = ({
  appointmentId,
  size = 'small',
  variant = 'outlined',
  className = '',
  onAppointmentCancelled
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { t } = useTranslation()

  const handleCancelClick = () => {
    setDialogOpen(true)
  }

  const handleCancelClose = () => {
    setDialogOpen(false)
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
      } else {
        const data = await res.json()
        console.error(data.error || 'Error cancelling appointment')
      }
    } catch (e) {
      console.error('Error cancelling appointment')
    } finally {
      setLoading(false)
      setDialogOpen(false)
    }
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
