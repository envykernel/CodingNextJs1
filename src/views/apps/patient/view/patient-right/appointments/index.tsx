'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

import { useTranslation } from '@/contexts/translationContext'

interface Appointment {
  id: number
  appointment_date: string
  appointment_type?: string
  status?: string
  notes?: string
  doctor?: {
    name?: string
  }
  visit?: {
    id: number
    status: string
  }
}

interface AppointmentsTabProps {
  appointments: Appointment[]
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  const d = new Date(dateString)

  return d.toLocaleDateString()
}

const formatTime = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  const d = new Date(dateString)

  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function groupAppointments(appointments: Appointment[]) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const past: Appointment[] = []
  const thisMonth: Appointment[] = []
  const next: Appointment[] = []

  appointments.forEach(a => {
    const date = new Date(a.appointment_date)

    if (date < startOfMonth) {
      past.push(a)
    } else if (date >= startOfMonth && date <= endOfMonth) {
      thisMonth.push(a)
    } else if (date > endOfMonth) {
      next.push(a)
    }
  })

  // Sort past appointments descending and take only the two most recent
  past.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
  const pastLimited = past.slice(0, 2)

  return { past: pastLimited, thisMonth, next }
}

const getStatusColor = (status: string | undefined): 'default' | 'info' | 'success' | 'error' | 'warning' => {
  switch ((status || '').toLowerCase()) {
    case 'scheduled':
      return 'info'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'error'
    case 'no_show':
      return 'warning'
    default:
      return 'default'
  }
}

const AppointmentCard = ({
  appointment,
  t,
  onCancel
}: {
  appointment: Appointment
  t: any
  onCancel?: (appointment: Appointment) => void
}) => {
  const router = useRouter()

  return (
    <Card variant='outlined' className='mb-4 shadow-sm'>
      <CardContent className='flex flex-col gap-2 p-4'>
        <div className='flex flex-row gap-6'>
          <div className='flex flex-col'>
            <Typography variant='caption' color='text.secondary' className='uppercase tracking-wide'>
              {t.patient.date || t.navigation.date || 'Date'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {formatDate(appointment.appointment_date)}
            </Typography>
          </div>
          <div className='flex flex-col'>
            <Typography variant='caption' color='text.secondary' className='uppercase tracking-wide'>
              {t.patient.time || t.navigation.time || 'Time'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {formatTime(appointment.appointment_date)}
            </Typography>
          </div>
        </div>
        <div className='flex flex-row items-center gap-2'>
          <Typography variant='caption' color='text.secondary' className='uppercase tracking-wide'>
            {t.patient.doctor || t.navigation.doctor || 'Doctor'}
          </Typography>
          <Typography variant='body2' className='font-semibold'>
            {appointment.doctor?.name || '-'}
          </Typography>
        </div>
        <div className='flex justify-start items-center'>
          <Chip label={appointment.status || '-'} size='small' color={getStatusColor(appointment.status)} />
        </div>
      </CardContent>
      <Divider />
      <div className='flex justify-center p-2'>
        {appointment.visit?.id ? (
          <Tooltip title={t.goToVisit || 'Go to Visit'}>
            <Button
              size='small'
              variant='outlined'
              color='success'
              onClick={() => router.push(`/fr/apps/visits/view/${appointment.visit!.id}`)}
              className='hover:text-success hover:border-success'
              startIcon={<i className='tabler-clipboard-check text-lg' />}
            >
              {t.goToVisit || 'Visit'}
            </Button>
          </Tooltip>
        ) : appointment.status === 'scheduled' ? (
          <Tooltip title={t.cancelAppointment || 'Cancel Appointment'}>
            <Button
              size='small'
              variant='outlined'
              color='error'
              onClick={() => onCancel && onCancel(appointment)}
              className='hover:text-error hover:border-error'
              startIcon={<i className='tabler-x text-lg' />}
            >
              {t.cancelAppointment || 'Cancel'}
            </Button>
          </Tooltip>
        ) : null}
      </div>
    </Card>
  )
}

const AppointmentsTab = ({ appointments }: AppointmentsTabProps) => {
  const t = useTranslation()
  const router = useRouter()
  const { past, thisMonth, next } = groupAppointments(appointments)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return

    setIsCancelling(true)

    try {
      const res = await fetch(`/api/appointments/${appointmentToCancel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (res.ok) {
        router.refresh()
      } else {
        console.error('Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    } finally {
      setIsCancelling(false)
      setCancelDialogOpen(false)
      setAppointmentToCancel(null)
    }
  }

  const handleCancelClose = () => {
    setCancelDialogOpen(false)
    setAppointmentToCancel(null)
  }

  const renderCards = (data: Appointment[]) =>
    data.length === 0 ? (
      <Typography className='text-center'>
        {t.patient.noAppointments || t.navigation.noAppointments || 'No appointments available.'}
      </Typography>
    ) : (
      <div className='flex flex-col gap-2'>
        {data.map((a: Appointment) => (
          <AppointmentCard key={a.id} appointment={a} t={t} onCancel={handleCancelClick} />
        ))}
      </div>
    )

  return (
    <>
      <Card>
        <CardContent>
          <div className='flex items-center gap-3 mb-4'>
            <i className='tabler-calendar-event text-xl text-primary' />
            <Typography variant='h6'>
              {t.patient.appointments || t.navigation.appointments || 'Appointments'}
            </Typography>
          </div>
          <Divider className='mb-4' />
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <Typography variant='subtitle1' className='mb-2 text-center'>
                {t.navigation.past || 'Past'}
              </Typography>
              {renderCards(past)}
            </div>
            <div>
              <Typography variant='subtitle1' className='mb-2 text-center'>
                {t.navigation.thisMonth || 'This Month'}
              </Typography>
              {renderCards(thisMonth)}
            </div>
            <div>
              <Typography variant='subtitle1' className='mb-2 text-center'>
                {t.navigation.next || 'Next'}
              </Typography>
              {renderCards(next)}
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={cancelDialogOpen} onClose={handleCancelClose}>
        <DialogTitle>{t.confirmCancellation || 'Confirm Cancellation'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t.cancelAppointmentConfirmation || 'Are you sure you want to cancel this appointment?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} disabled={isCancelling}>
            {t.common?.cancel || 'Cancel'}
          </Button>
          <Button onClick={handleCancelConfirm} color='error' disabled={isCancelling}>
            {isCancelling ? t.loading || 'Loading...' : t.confirm || 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AppointmentsTab
