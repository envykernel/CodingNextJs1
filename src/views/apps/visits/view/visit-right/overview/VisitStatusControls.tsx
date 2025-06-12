import React, { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { styled } from '@mui/material/styles'

import { updateVisitStatusAndFetch } from '@/utils/visitActions'

interface VisitStatusControlsProps {
  visitData: any
  onStatusChange: (newStatus: string) => void
  onVisitUpdate: (updatedVisit: any) => void
  dictionary: any
}

// VisitStatusButtons Component
interface VisitStatusButtonsProps {
  status: string
  onStartVisit: () => Promise<void>
  onStatusUpdate: (status: 'completed' | 'cancelled') => Promise<void>
  dictionary: any
}

// VisitProgressBar Component
interface VisitProgressBarProps {
  elapsedTime: number
  progress: number
  status: string
  dictionary: any
  isOvertime: boolean
  overtimeSeconds: number
}

// Add new interface for visit timing
interface VisitTiming {
  startTime: Date | null
  endTime: Date | null
  duration: number // in minutes
}

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100px',
  background: theme.palette.background.paper,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',
  marginBottom: '16px',
  '&:hover': {
    borderColor: theme.palette.primary.main
  }
}))

const ActionButton = styled(Button)(() => ({
  minWidth: '100px',
  height: '36px',
  borderRadius: '18px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: '0 16px',
  '&.MuiButton-contained': {
    '&:hover': {
      transform: 'translateY(-1px)'
    }
  }
}))

const ProgressWrapper = styled(Box)(() => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px'
}))

const StyledCircularProgress = styled(CircularProgress)(() => ({
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round'
  }
}))

const ProgressLabel = styled(Box)(() => ({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 600
}))

const StatusText = styled(Typography)(() => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  whiteSpace: 'nowrap'
}))

const TimeText = styled(Typography)(() => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  whiteSpace: 'nowrap'
}))

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: '16px'
  },
  '& .MuiDialogTitle-root': {
    fontSize: '1rem',
    fontWeight: 600,
    padding: '12px 16px'
  },
  '& .MuiDialogContent-root': {
    padding: '12px 16px'
  },
  '& .MuiDialogActions-root': {
    padding: '12px 16px',
    gap: '8px'
  }
}))

const StyledAlert = styled(Alert)(() => ({
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '0.875rem'
}))

const HorizontalProgress = styled(Box)(({ theme }) => ({
  height: '4px',
  width: '100%',
  backgroundColor: theme.palette.divider,
  borderRadius: '2px',
  overflow: 'hidden',
  margin: '0 16px',
  flex: 1
}))

const HorizontalProgressBar = styled(Box)<{ progress: number; status: string }>(({ theme, progress, status }) => ({
  height: '100%',
  width: `${progress}%`,
  backgroundColor:
    status === 'scheduled'
      ? theme.palette.info.main
      : status === 'in_progress'
        ? progress <= 60
          ? theme.palette.success.main
          : progress <= 90
            ? theme.palette.warning.main
            : theme.palette.error.main
        : theme.palette.info.main,
  transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out'
}))

// VisitStatusButtons Component
const VisitStatusButtons = ({ status, onStartVisit, onStatusUpdate, dictionary }: VisitStatusButtonsProps) => {
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleStartClick = async () => {
    setIsLoading(true)

    try {
      await onStartVisit()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelClick = () => {
    setOpenCancelDialog(true)
  }

  const handleCancelConfirm = async () => {
    setIsLoading(true)

    try {
      await onStatusUpdate('cancelled')
      setOpenCancelDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteClick = async () => {
    setIsLoading(true)

    try {
      await onStatusUpdate('completed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className='flex gap-2'>
        {status === 'scheduled' && (
          <ActionButton
            variant='contained'
            color='primary'
            onClick={handleStartClick}
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={16} color='inherit' /> : <i className='tabler-player-play text-sm' />
            }
          >
            {isLoading ? dictionary.visit.statusControls.starting : dictionary.visit.statusControls.startVisit}
          </ActionButton>
        )}
        {status === 'in_progress' && (
          <ActionButton
            variant='contained'
            color='primary'
            onClick={handleCompleteClick}
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={16} color='inherit' /> : <i className='tabler-check text-sm' />
            }
          >
            {isLoading ? dictionary.visit.statusControls.completing : dictionary.visit.statusControls.markAsCompleted}
          </ActionButton>
        )}
        {(status === 'scheduled' || status === 'in_progress') && (
          <ActionButton
            variant='outlined'
            color='error'
            onClick={handleCancelClick}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color='inherit' /> : <i className='tabler-x text-sm' />}
          >
            {isLoading ? dictionary.visit.statusControls.cancelling : dictionary.visit.statusControls.markAsCancelled}
          </ActionButton>
        )}
      </div>

      <StyledDialog
        open={openCancelDialog}
        onClose={() => !isLoading && setOpenCancelDialog(false)}
        aria-labelledby='cancel-dialog-title'
        aria-describedby='cancel-dialog-description'
      >
        <DialogTitle id='cancel-dialog-title'>
          <i className='tabler-alert-circle text-error mr-2' />
          {dictionary.visit.statusControls.confirmCancellation}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='cancel-dialog-description'>
            {dictionary.visit.statusControls.cancelConfirmationMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <ActionButton
            onClick={() => setOpenCancelDialog(false)}
            color='primary'
            variant='outlined'
            disabled={isLoading}
          >
            {dictionary.visit.statusControls.no}
          </ActionButton>
          <ActionButton onClick={handleCancelConfirm} color='error' variant='contained' disabled={isLoading} autoFocus>
            {isLoading ? (
              <>
                <CircularProgress size={16} color='inherit' className='mr-2' />
                {dictionary.visit.statusControls.cancelling}
              </>
            ) : (
              dictionary.visit.statusControls.yesCancel
            )}
          </ActionButton>
        </DialogActions>
      </StyledDialog>
    </>
  )
}

// VisitProgressBar Component
const VisitProgressBar = ({
  elapsedTime,
  progress,
  status,
  dictionary,
  isOvertime,
  overtimeSeconds
}: VisitProgressBarProps & {
  status: string
  isOvertime: boolean
  overtimeSeconds: number
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getProgressColor = (status: string, progress: number) => {
    if (status === 'scheduled') return 'info'

    if (status === 'in_progress') {
      if (isOvertime) return 'error'
      if (progress <= 60) return 'success'
      if (progress <= 90) return 'warning'

      return 'error'
    }

    return 'info'
  }

  const getProgressValue = (status: string, progress: number) => {
    if (status === 'scheduled') return 0
    if (isOvertime) return 100

    return progress
  }

  return (
    <div className='flex items-center gap-3'>
      <ProgressWrapper>
        <StyledCircularProgress
          variant='determinate'
          value={getProgressValue(status, progress)}
          color={getProgressColor(status, progress)}
          size={48}
          thickness={4}
        />
        <ProgressLabel>
          {status === 'scheduled' ? (
            <i className='tabler-calendar-event text-primary' />
          ) : isOvertime ? (
            <i className='tabler-alert-circle text-error' />
          ) : (
            `${Math.round(progress)}%`
          )}
        </ProgressLabel>
      </ProgressWrapper>
      {status === 'in_progress' && (
        <div className='flex flex-col'>
          <TimeText>{formatTime(elapsedTime)}</TimeText>
          {isOvertime && (
            <TimeText color='error.main' className='text-sm'>
              {dictionary.visit.statusControls.overtimePrefix}
              {formatTime(overtimeSeconds)}
            </TimeText>
          )}
        </div>
      )}
      {status === 'scheduled' && (
        <StatusText color='text.secondary'>{dictionary.visit.statusControls.scheduled}</StatusText>
      )}
    </div>
  )
}

// Main VisitStatusControls Component
const VisitStatusControls = ({ visitData, onStatusChange, onVisitUpdate, dictionary }: VisitStatusControlsProps) => {
  const [status, setStatus] = useState(visitData.status)
  const [error, setError] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isOvertime, setIsOvertime] = useState(false)
  const [overtimeSeconds, setOvertimeSeconds] = useState(0)

  const [visitTiming, setVisitTiming] = useState<VisitTiming>(() => {
    // Initialize timing from visitData if available
    if (visitData.start_time && visitData.end_time && visitData.visit_date) {
      const [startHours, startMinutes] = visitData.start_time.split(':').map(Number)
      const start = new Date(visitData.visit_date)

      start.setHours(startHours, startMinutes, 0, 0)

      const [endHours, endMinutes] = visitData.end_time.split(':').map(Number)
      const end = new Date(visitData.visit_date)

      end.setHours(endHours, endMinutes, 0, 0)

      return {
        startTime: start,
        endTime: end,
        duration: 30
      }
    }

    return {
      startTime: null,
      endTime: null,
      duration: 30
    }
  })

  // Timer effect with overtime tracking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (status === 'in_progress' && visitTiming.startTime) {
      interval = setInterval(() => {
        const now = new Date()
        const start = visitTiming.startTime!
        const end = visitTiming.endTime || new Date(start.getTime() + visitTiming.duration * 60 * 1000)

        if (now > end && !isOvertime) {
          setIsOvertime(true)
        }

        if (isOvertime) {
          const overtime = Math.floor((now.getTime() - end.getTime()) / 1000)

          setOvertimeSeconds(overtime)
        }

        const currentTime = now > end ? end : now
        const elapsed = Math.max(0, Math.floor((currentTime.getTime() - start.getTime()) / 1000))

        setElapsedTime(elapsed)

        const totalDuration = visitTiming.duration * 60
        const newProgress = Math.min(Math.max(0, (elapsed / totalDuration) * 100), 100)

        setProgress(newProgress)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status, visitTiming.startTime, visitTiming.endTime, visitTiming.duration, isOvertime])

  // Effect to handle status changes
  useEffect(() => {
    const isTerminated = status === 'completed' || status === 'cancelled'

    if (isTerminated) {
      setIsOvertime(false)
      setOvertimeSeconds(0)
    }
  }, [status])

  const handleStartVisit = async () => {
    try {
      setError(null)
      const now = new Date()
      const endTime = new Date(now.getTime() + visitTiming.duration * 60 * 1000)

      // Update timing state first
      setVisitTiming({
        startTime: now,
        endTime: endTime,
        duration: visitTiming.duration
      })

      // Then update the visit status
      const updatedVisit = await updateVisitStatusAndFetch(visitData.id, 'start')

      // Update local state
      setStatus(updatedVisit.status)

      // Update parent components
      onStatusChange(updatedVisit.status)
      onVisitUpdate(updatedVisit)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleStatusUpdate = async (newStatus: 'completed' | 'cancelled') => {
    try {
      setError(null)
      const now = new Date()

      // Update timing state first
      setVisitTiming(prev => ({
        ...prev,
        endTime: now
      }))

      // Then update the visit status
      const updatedVisit = await updateVisitStatusAndFetch(visitData.id, newStatus)

      // Update local state
      setStatus(updatedVisit.status)

      // Update parent components with the complete updated visit data
      onStatusChange(updatedVisit.status)
      onVisitUpdate({
        ...updatedVisit,
        start_time:
          visitTiming.startTime?.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          }) || updatedVisit.start_time,
        end_time: now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        })
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Don't render the controls if the visit is completed or cancelled
  if (status === 'completed' || status === 'cancelled') {
    return null
  }

  return (
    <StyledCard>
      <CardContent className='px-6 h-full'>
        <div className='flex items-center justify-between h-full'>
          <VisitProgressBar
            elapsedTime={elapsedTime}
            progress={progress}
            status={status}
            dictionary={dictionary}
            isOvertime={isOvertime}
            overtimeSeconds={overtimeSeconds}
          />
          <HorizontalProgress>
            <HorizontalProgressBar progress={progress} status={status} />
          </HorizontalProgress>
          <VisitStatusButtons
            status={status}
            onStartVisit={handleStartVisit}
            onStatusUpdate={handleStatusUpdate}
            dictionary={dictionary}
          />
        </div>
        {error && (
          <StyledAlert severity='error' className='mt-2'>
            {error}
          </StyledAlert>
        )}
      </CardContent>
    </StyledCard>
  )
}

export default VisitStatusControls
