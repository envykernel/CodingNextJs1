'use client'

// React Imports
import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { useTheme, alpha } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Contexts
import { useTranslation } from '@/contexts/translationContext'
import VisitActionButton from '@/app/[lang]/(dashboard)/(private)/apps/appointments/components/VisitActionButton'
import CancelAppointmentButton from '@/app/[lang]/(dashboard)/(private)/apps/appointments/components/CancelAppointmentButton'

// Types
type AppointmentType = 'consultation' | 'follow-up' | 'emergency' | 'routine-check' | 'specialist' | 'other'

type Appointment = {
  id: string
  patientName: string
  type: AppointmentType
  time: string
  duration: number // in minutes
  doctorName: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  visit?: {
    id: number
    status: string
  }
}

type StatusColumn = {
  id: Appointment['status']
  label: string
  icon: string
  color: string
}

const TodayAppointments = () => {
  const theme = useTheme()
  const t = useTranslation()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [visitsByAppointmentId, setVisitsByAppointmentId] = useState<Record<number, any>>({})
  const [navigatingVisitId, setNavigatingVisitId] = useState<number | null>(null)
  const router = useRouter()

  // Appointment type configurations with fallback
  const appointmentTypes: Record<AppointmentType, { label: string; color: string; icon: string }> = {
    consultation: { label: 'Consultation', color: theme.palette.primary.main, icon: 'tabler-stethoscope' },
    'follow-up': { label: 'Follow-up', color: theme.palette.success.main, icon: 'tabler-refresh' },
    emergency: { label: 'Emergency', color: theme.palette.error.main, icon: 'tabler-ambulance' },
    'routine-check': { label: 'Routine Check', color: theme.palette.info.main, icon: 'tabler-clipboard-check' },
    specialist: { label: 'Specialist', color: theme.palette.warning.main, icon: 'tabler-user-md' },
    other: { label: 'Other', color: theme.palette.grey[500], icon: 'tabler-calendar' }
  }

  // Helper function to get appointment type config with fallback
  const getAppointmentTypeConfig = (type: string) => {
    const normalizedType = type.toLowerCase() as AppointmentType

    return appointmentTypes[normalizedType] || appointmentTypes.other
  }

  // Status column configurations
  const statusColumns: StatusColumn[] = [
    {
      id: 'scheduled',
      label: 'Scheduled',
      icon: 'tabler-clock',
      color: theme.palette.info.main
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      icon: 'tabler-loader-2',
      color: theme.palette.warning.main
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: 'tabler-check',
      color: theme.palette.success.main
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      icon: 'tabler-x',
      color: theme.palette.error.main
    }
  ]

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments?filter=today')

      if (!response.ok) throw new Error('Failed to fetch appointments')

      const data = await response.json()

      // Transform the appointments to match our component's format
      const transformedAppointments: Appointment[] = data.appointments.map((apt: any) => {
        const appointmentDate = new Date(apt.appointmentDate)

        // Format time in user's local timezone
        const time = appointmentDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })

        // Normalize appointment type
        const normalizedType = apt.type.toLowerCase() as AppointmentType
        const type = Object.keys(appointmentTypes).includes(normalizedType) ? normalizedType : 'other'

        return {
          id: apt.id.toString(),
          patientName: apt.patientName,
          type,
          time,
          duration: 30,
          doctorName: apt.doctorName,
          status: apt.status.toLowerCase() as Appointment['status'],
          visit: apt.visit
        }
      })

      // Sort appointments by time
      const sortedAppointments = transformedAppointments.sort((a, b) => a.time.localeCompare(b.time))

      setAppointments(sortedAppointments)
      setVisitsByAppointmentId(data.visitsByAppointmentId || {})
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleAppointmentCancelled = () => {
    // Refresh the appointments list
    fetchAppointments()
  }

  const handleVisitClick = (visitId: number) => {
    setNavigatingVisitId(visitId)
    router.push(`/fr/apps/visits/view/${visitId}`)
  }

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <i className='tabler-loader-2 animate-spin text-4xl' />
            <Typography sx={{ mt: 2 }}>Loading appointments...</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main'
              }}
            >
              <i className='tabler-calendar-event text-xl' />
            </Box>
            <Box>
              <Typography variant='h5'>Today&apos;s Schedule</Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                })}
                {' • '}
                <Typography component='span' variant='caption' sx={{ color: 'text.secondary' }}>
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </Typography>
              </Typography>
            </Box>
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${appointments.length} appointments`}
              size='small'
              sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}
            />
            <Tooltip title='Refresh'>
              <IconButton onClick={fetchAppointments}>
                <i className='tabler-refresh' />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent sx={{ p: '0 !important' }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            p: 2,
            overflowX: 'auto',
            width: '100%',
            '&::-webkit-scrollbar': {
              height: '8px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.3),
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: theme => alpha(theme.palette.primary.main, 0.5)
              }
            }
          }}
        >
          {statusColumns.map(column => {
            const columnAppointments = appointments.filter(apt => apt.status === column.id)

            return (
              <Paper
                key={column.id}
                sx={{
                  flex: 1,
                  minWidth: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: theme => alpha(theme.palette.background.default, 0.6),
                  border: theme => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  borderRadius: 1
                }}
              >
                {/* Column Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    backgroundColor: alpha(column.color, 0.05)
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <i className={`${column.icon} text-lg`} style={{ color: column.color }} />
                    <Typography variant='subtitle1' sx={{ fontWeight: 600, color: column.color }}>
                      {column.label}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${columnAppointments.length} appointment${columnAppointments.length !== 1 ? 's' : ''}`}
                    size='small'
                    sx={{
                      backgroundColor: alpha(column.color, 0.1),
                      color: column.color,
                      height: 24
                    }}
                  />
                </Box>

                {/* Column Content */}
                <Box
                  sx={{
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    minHeight: 100
                  }}
                >
                  {columnAppointments.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 100,
                        color: 'text.secondary',
                        border: theme => `1px dashed ${alpha(theme.palette.divider, 0.5)}`,
                        borderRadius: 1,
                        backgroundColor: theme => alpha(theme.palette.background.default, 0.4)
                      }}
                    >
                      <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='tabler-calendar-off text-lg' />
                        {t.noAppointmentsInStatus?.replace('{status}', column.label.toLowerCase()) ||
                          `No ${column.label.toLowerCase()} appointments`}
                      </Typography>
                    </Box>
                  ) : (
                    columnAppointments.map(appointment => {
                      const typeConfig = getAppointmentTypeConfig(appointment.type)
                      const visit = visitsByAppointmentId[parseInt(appointment.id)]
                      const isNavigating = navigatingVisitId === appointment.visit?.id

                      return (
                        <Paper
                          key={appointment.id}
                          elevation={0}
                          sx={{
                            p: 2,
                            backgroundColor: 'background.paper',
                            border: theme => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            borderRadius: 1,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: typeConfig.color,
                              backgroundColor: alpha(typeConfig.color, 0.02),
                              transform: 'translateY(-2px)',
                              boxShadow: theme => theme.shadows[1]
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: alpha(typeConfig.color, 0.1),
                                color: typeConfig.color
                              }}
                            >
                              <i className={`${typeConfig.icon} text-lg`} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                                {appointment.patientName}
                              </Typography>
                              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                {appointment.doctorName}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className='tabler-clock text-base' style={{ color: theme.palette.text.secondary }} />
                              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                                {appointment.time}
                              </Typography>
                              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                ({appointment.duration} min)
                              </Typography>
                            </Box>
                            <Chip
                              label={appointment.type}
                              size='small'
                              sx={{
                                backgroundColor: alpha(typeConfig.color, 0.1),
                                color: typeConfig.color,
                                textTransform: 'capitalize',
                                height: 24
                              }}
                            />
                          </Box>

                          {/* Add Visit Action Button and Cancel Button for scheduled appointments */}
                          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {appointment.visit?.id ? (
                              <Button
                                variant='contained'
                                color='success'
                                size='small'
                                fullWidth
                                onClick={() => handleVisitClick(appointment.visit!.id)}
                                disabled={isNavigating}
                                startIcon={
                                  isNavigating ? (
                                    <CircularProgress size={20} color='inherit' />
                                  ) : (
                                    <i className='tabler-clipboard-check text-lg' />
                                  )
                                }
                              >
                                {isNavigating ? t.loading || 'Loading...' : t.goToVisit || 'Go to Visit'}
                              </Button>
                            ) : (
                              appointment.status === 'scheduled' && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <VisitActionButton
                                    appointmentId={parseInt(appointment.id)}
                                    visit={visit}
                                    t={t}
                                    lang='fr'
                                    size='small'
                                    variant='contained'
                                    className='flex-1'
                                    onVisitCreated={handleAppointmentCancelled}
                                  />
                                  <CancelAppointmentButton
                                    appointmentId={parseInt(appointment.id)}
                                    t={t}
                                    size='small'
                                    variant='outlined'
                                    className='flex-1'
                                    onAppointmentCancelled={handleAppointmentCancelled}
                                  />
                                </Box>
                              )
                            )}
                          </Box>
                        </Paper>
                      )
                    })
                  )}
                </Box>
              </Paper>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}

export default TodayAppointments
