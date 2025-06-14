'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'

// Contexts
import { useTranslation } from '@/contexts/translationContext'

// Types
type PaletteColorKey = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'

interface DayStats {
  day: string
  count: number
  percentage: number
  icon: string
  color: PaletteColorKey
  colorVariant: 'main' | 'light'
}

interface AppointmentDayStatsProps {
  dateRange?: 'week' | 'year'
  startDate?: Date | string
  endDate?: Date | string
}

const AppointmentDayStats = ({ dateRange, startDate, endDate }: AppointmentDayStatsProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const [stats, setStats] = useState<DayStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams()

        if (startDate && endDate) {
          // Use custom date range if provided
          params.append('startDate', startDate instanceof Date ? startDate.toISOString() : startDate)
          params.append('endDate', endDate instanceof Date ? endDate.toISOString() : endDate)
        } else if (dateRange) {
          // Use predefined range if no custom dates
          params.append('range', dateRange)
        }

        const response = await fetch(`/api/appointments/day-stats?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch appointment statistics')
        }

        const data = await response.json()

        // Map the data to include icons and colors
        const mappedData = data.map((day: Omit<DayStats, 'icon' | 'color' | 'colorVariant'>, index: number) => {
          const colors = [
            { color: 'primary' as const, variant: 'main' as const },
            { color: 'success' as const, variant: 'main' as const },
            { color: 'info' as const, variant: 'main' as const },
            { color: 'warning' as const, variant: 'main' as const },
            { color: 'error' as const, variant: 'main' as const },
            { color: 'secondary' as const, variant: 'main' as const },
            { color: 'info' as const, variant: 'light' as const }
          ]

          const icons = [
            'tabler-calendar-event',
            'tabler-calendar-time',
            'tabler-calendar-stats',
            'tabler-calendar-plus',
            'tabler-calendar-minus',
            'tabler-calendar-off',
            'tabler-calendar-x'
          ]

          return {
            ...day,
            icon: icons[index],
            color: colors[index].color,
            colorVariant: colors[index].variant
          }
        })

        setStats(mappedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [dateRange, startDate, endDate])

  if (loading) {
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
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.main
                }}
              >
                <i
                  className={`tabler-calendar-${startDate && endDate ? 'stats' : dateRange === 'week' ? 'week' : 'stats'} text-xl`}
                />
              </Box>
              <Box>
                <Typography variant='h5'>{t('appointmentStatistics.dayStats.title')}</Typography>
                <Typography variant='subtitle2' color='text.secondary'>
                  {t(
                    `appointmentStatistics.dayStats.subtitle.${startDate && endDate ? 'custom' : dateRange || 'week'}`
                  )}
                </Typography>
              </Box>
            </Box>
          }
        />
        <CardContent sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>{t('appointmentStatistics.dayStats.loading')}</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
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
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.main
                }}
              >
                <i
                  className={`tabler-calendar-${startDate && endDate ? 'stats' : dateRange === 'week' ? 'week' : 'stats'} text-xl`}
                />
              </Box>
              <Box>
                <Typography variant='h5'>{t('appointmentStatistics.dayStats.title')}</Typography>
                <Typography variant='subtitle2' color='text.secondary'>
                  {t(
                    `appointmentStatistics.dayStats.subtitle.${startDate && endDate ? 'custom' : dateRange || 'week'}`
                  )}
                </Typography>
              </Box>
            </Box>
          }
        />
        <CardContent sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color='error' align='center'>
            {t('appointmentStatistics.dayStats.error')}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Add check for empty stats but keep the header
  if (stats.length === 0 || stats.every(stat => stat.count === 0)) {
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
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.main
                }}
              >
                <i
                  className={`tabler-calendar-${startDate && endDate ? 'stats' : dateRange === 'week' ? 'week' : 'stats'} text-xl`}
                />
              </Box>
              <Box>
                <Typography variant='h5'>{t('appointmentStatistics.dayStats.title')}</Typography>
                <Typography variant='subtitle2' color='text.secondary'>
                  {t(
                    `appointmentStatistics.dayStats.subtitle.${startDate && endDate ? 'custom' : dateRange || 'week'}`
                  )}
                </Typography>
              </Box>
            </Box>
          }
        />
        <CardContent sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color='text.secondary' align='center'>
            {t('appointmentStatistics.dayStats.noAppointments')}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const getContrastText = (color: string) => {
    return theme.palette.getContrastText(color)
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
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.main
              }}
            >
              <i
                className={`tabler-calendar-${startDate && endDate ? 'stats' : dateRange === 'week' ? 'week' : 'stats'} text-xl`}
              />
            </Box>
            <Box>
              <Typography variant='h5'>{t('appointmentStatistics.dayStats.title')}</Typography>
              <Typography variant='subtitle2' color='text.secondary'>
                {t(`appointmentStatistics.dayStats.subtitle.${startDate && endDate ? 'custom' : dateRange || 'week'}`)}
              </Typography>
            </Box>
          </Box>
        }
      />
      <CardContent sx={{ p: '0 !important', height: 120 }}>
        <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
          {stats.map((item, index) => {
            const color = theme.palette[item.color][item.colorVariant]
            const textColor = getContrastText(color)
            const dayKey = item.day.toLowerCase()
            const translatedDay = t(`appointmentStatistics.dayStats.days.${dayKey}`)

            return (
              <Box
                key={index}
                sx={{
                  width: `${item.percentage}%`,
                  height: '100%',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    backgroundColor: color,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      filter: 'brightness(0.9)'
                    }
                  }}
                >
                  <Typography
                    variant='body2'
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      color: textColor,
                      fontWeight: 500
                    }}
                  >
                    {translatedDay}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      color: textColor,
                      fontWeight: 500
                    }}
                  >
                    {item.percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}

export default AppointmentDayStats
