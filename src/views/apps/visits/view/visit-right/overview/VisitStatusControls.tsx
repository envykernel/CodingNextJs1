import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

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

const VisitStatusButtons = ({ status, onStartVisit, onStatusUpdate, dictionary }: VisitStatusButtonsProps) => {
  return (
    <div className='flex gap-2'>
      {status === 'scheduled' && (
        <Button
          variant='contained'
          color='primary'
          onClick={onStartVisit}
          startIcon={<i className='tabler-player-play' />}
          size='small'
        >
          {dictionary.startVisit || 'Start Visit'}
        </Button>
      )}
      {status === 'in_progress' && (
        <Button
          variant='contained'
          color='success'
          onClick={() => onStatusUpdate('completed')}
          startIcon={<i className='tabler-check' />}
          size='small'
        >
          {dictionary.markAsCompleted || 'Mark as Completed'}
        </Button>
      )}
      {(status === 'scheduled' || status === 'in_progress') && (
        <Button
          variant='contained'
          color='error'
          onClick={() => onStatusUpdate('cancelled')}
          startIcon={<i className='tabler-x' />}
          size='small'
        >
          {dictionary.markAsCancelled || 'Mark as Cancelled'}
        </Button>
      )}
    </div>
  )
}

// VisitProgressBar Component
interface VisitProgressBarProps {
  elapsedTime: number
  progress: number
  dictionary: any
}

const VisitProgressBar = ({ elapsedTime, progress, dictionary }: VisitProgressBarProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getProgressColor = (progress: number) => {
    if (progress <= 60) return 'success'
    if (progress <= 90) return 'warning'

    return 'error'
  }

  return (
    <Box className='flex-1 min-w-[200px]'>
      <div className='flex items-center justify-between mb-2'>
        <Typography variant='body2' color='text.secondary'>
          {dictionary.elapsedTime || 'Elapsed Time'}: {formatTime(elapsedTime)}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {Math.round(progress)}%
        </Typography>
      </div>
      <LinearProgress
        variant='determinate'
        value={progress}
        color={getProgressColor(progress)}
        className='h-2 rounded'
      />
    </Box>
  )
}

// Main VisitStatusControls Component
const VisitStatusControls = ({ visitData, onStatusChange, onVisitUpdate, dictionary }: VisitStatusControlsProps) => {
  const [status, setStatus] = useState(visitData.status)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [progress, setProgress] = useState(0)

  // Effect to refresh visit data when status changes to completed or cancelled
  useEffect(() => {
    if (status === 'completed' || status === 'cancelled') {
      onVisitUpdate(visitData)
    }
  }, [status, onVisitUpdate, visitData])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    // Only start timer if we have all required data
    if (status === 'in_progress' && visitData?.start_time && visitData?.end_time && visitData?.visit_date) {
      interval = setInterval(() => {
        try {
          // Create date objects using the visit date
          const visitDate = visitData.visit_date
          const [startHours, startMinutes] = visitData.start_time.split(':').map(Number)
          const [endHours, endMinutes] = visitData.end_time.split(':').map(Number)

          const start = new Date(visitDate)

          start.setHours(startHours, startMinutes, 0, 0)

          const end = new Date(visitDate)

          end.setHours(endHours, endMinutes, 0, 0)

          const now = new Date()

          // If the visit is from a previous day, use the end time as current time
          const currentTime = now > end ? end : now

          // Calculate elapsed time in seconds
          const elapsed = Math.max(0, Math.floor((currentTime.getTime() - start.getTime()) / 1000))

          setElapsedTime(elapsed)

          // Calculate progress based on total duration
          const totalDuration = (end.getTime() - start.getTime()) / 1000 // total duration in seconds
          const newProgress = Math.min(Math.max(0, (elapsed / totalDuration) * 100), 100)

          setProgress(newProgress)
        } catch (error) {
          // If there's any error in date calculations, clear the interval
          if (interval) clearInterval(interval)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status, visitData])

  const handleStartVisit = async () => {
    try {
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/visits/${visitData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error || 'Failed to start visit')
      }

      const data = await response.json()

      setStatus(data.visit.status)
      onStatusChange(data.visit.status)
      onVisitUpdate(data.visit)
      setSuccess('Visit started')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleStatusUpdate = async (newStatus: 'completed' | 'cancelled') => {
    try {
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/visits/${visitData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error || 'Failed to update status')
      }

      const data = await response.json()

      setStatus(data.visit.status)
      onStatusChange(data.visit.status)
      onVisitUpdate(data.visit)
      setSuccess(`Visit marked as ${newStatus}`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Don't render the controls if the visit is completed or cancelled
  if (status === 'completed' || status === 'cancelled') {
    return null
  }

  return (
    <Card className='mb-6'>
      <CardContent>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-4'>
            {status === 'in_progress' && (
              <VisitProgressBar elapsedTime={elapsedTime} progress={progress} dictionary={dictionary} />
            )}
            <VisitStatusButtons
              status={status}
              onStartVisit={handleStartVisit}
              onStatusUpdate={handleStatusUpdate}
              dictionary={dictionary}
            />
          </div>

          {error && <Alert severity='error'>{error}</Alert>}
          {success && <Alert severity='success'>{success}</Alert>}
        </div>
      </CardContent>
    </Card>
  )
}

export default VisitStatusControls
