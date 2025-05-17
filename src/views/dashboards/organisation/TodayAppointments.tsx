'use client'

// React Imports
import { useEffect, useState } from 'react'

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

// Types
type AppointmentType = 'consultation' | 'follow-up' | 'emergency' | 'routine-check' | 'specialist'

type Appointment = {
  id: string
  patientName: string
  type: AppointmentType
  time: string
  duration: number // in minutes
  doctorName: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

type StatusColumn = {
  id: Appointment['status']
  label: string
  icon: string
  color: string
}

const TodayAppointments = () => {
  const theme = useTheme()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  // Appointment type configurations
  const appointmentTypes: Record<AppointmentType, { label: string; color: string; icon: string }> = {
    consultation: { label: 'Consultation', color: theme.palette.primary.main, icon: 'tabler-stethoscope' },
    'follow-up': { label: 'Follow-up', color: theme.palette.success.main, icon: 'tabler-refresh' },
    emergency: { label: 'Emergency', color: theme.palette.error.main, icon: 'tabler-ambulance' },
    'routine-check': { label: 'Routine Check', color: theme.palette.info.main, icon: 'tabler-clipboard-check' },
    specialist: { label: 'Specialist', color: theme.palette.warning.main, icon: 'tabler-user-md' }
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
      id: 'in-progress',
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

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // TODO: Replace with actual API call
        // This is mock data for demonstration
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            patientName: 'John Doe',
            type: 'consultation',
            time: '09:00',
            duration: 30,
            doctorName: 'Dr. Smith',
            status: 'scheduled'
          },
          {
            id: '2',
            patientName: 'Jane Smith',
            type: 'follow-up',
            time: '09:30',
            duration: 20,
            doctorName: 'Dr. Johnson',
            status: 'scheduled'
          },
          {
            id: '3',
            patientName: 'Mike Wilson',
            type: 'emergency',
            time: '10:00',
            duration: 45,
            doctorName: 'Dr. Brown',
            status: 'in-progress'
          },
          {
            id: '4',
            patientName: 'Sarah Davis',
            type: 'routine-check',
            time: '11:00',
            duration: 30,
            doctorName: 'Dr. Wilson',
            status: 'scheduled'
          },
          {
            id: '5',
            patientName: 'Robert Taylor',
            type: 'specialist',
            time: '11:30',
            duration: 60,
            doctorName: 'Dr. Anderson',
            status: 'scheduled'
          }
        ]

        // Sort appointments by time
        const sortedAppointments = mockAppointments.sort((a, b) => a.time.localeCompare(b.time))

        setAppointments(sortedAppointments)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

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
    <Card sx={{ height: '100%' }}>
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
                  day: 'numeric'
                })}
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
              <IconButton>
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
            height: 'calc(100vh - 300px)',
            minHeight: 500,
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
                    flex: 1,
                    p: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    '&::-webkit-scrollbar': {
                      width: '6px'
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'transparent'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: theme => alpha(theme.palette.primary.main, 0.2),
                      borderRadius: '3px',
                      '&:hover': {
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.3)
                      }
                    }
                  }}
                >
                  {columnAppointments.map(appointment => {
                    const typeConfig = appointmentTypes[appointment.type]

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
                      </Paper>
                    )
                  })}
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
