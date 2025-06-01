// AppointmentListCards component
'use client'

import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import Grid from '@mui/material/Grid'

import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import { useTranslation } from '@/contexts/translationContext'

interface AppointmentStats {
  current: {
    total: number
    completed: number
    scheduled: number
    cancelled: number
  }
  previous: {
    total: number
    completed: number
    scheduled: number
    cancelled: number
  }
  changes: {
    total: number
    completed: number
    scheduled: number
    cancelled: number
  }
}

const AppointmentListCards = () => {
  const { t } = useTranslation()
  const params = useParams<{ lang: string }>()

  const [stats, setStats] = useState<AppointmentStats>({
    current: {
      total: 0,
      completed: 0,
      scheduled: 0,
      cancelled: 0
    },
    previous: {
      total: 0,
      completed: 0,
      scheduled: 0,
      cancelled: 0
    },
    changes: {
      total: 0,
      completed: 0,
      scheduled: 0,
      cancelled: 0
    }
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/appointments/stats')
        const data = await response.json()

        setStats(data)
      } catch (error) {
        console.error('Error fetching appointment stats:', error)
      }
    }

    fetchStats()
  }, [])

  const formatSubtitle = (current: number, previous: number) => {
    if (!params?.lang) {
      return ''
    }

    const currentMonth = new Date().toLocaleDateString(params.lang, { month: 'short' })

    const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString(params.lang, {
      month: 'short'
    })

    const template = t('appointmentStatistics.monthlyComparison')

    return template
      .replace('{currentMonth}', currentMonth)
      .replace('{current}', current.toString())
      .replace('{previousMonth}', previousMonth)
      .replace('{previous}', previous.toString())
  }

  const data = [
    {
      title: t('appointmentStatistics.totalAppointments'),
      stats: stats.current.total.toString(),
      avatarIcon: 'tabler-calendar-event',
      avatarColor: 'primary',
      trend: stats.changes.total >= 0 ? 'positive' : 'negative',
      trendNumber: `${Math.abs(stats.changes.total)}%`,
      subtitle: formatSubtitle(stats.current.total, stats.previous.total)
    },
    {
      title: t('appointmentStatistics.completedAppointments'),
      stats: stats.current.completed.toString(),
      avatarIcon: 'tabler-check',
      avatarColor: 'success',
      trend: stats.changes.completed >= 0 ? 'positive' : 'negative',
      trendNumber: `${Math.abs(stats.changes.completed)}%`,
      subtitle: formatSubtitle(stats.current.completed, stats.previous.completed)
    },
    {
      title: t('appointmentStatistics.scheduledAppointments'),
      stats: stats.current.scheduled.toString(),
      avatarIcon: 'tabler-clock',
      avatarColor: 'warning',
      trend: stats.changes.scheduled >= 0 ? 'positive' : 'negative',
      trendNumber: `${Math.abs(stats.changes.scheduled)}%`,
      subtitle: formatSubtitle(stats.current.scheduled, stats.previous.scheduled)
    },
    {
      title: t('appointmentStatistics.cancelledAppointments'),
      stats: stats.current.cancelled.toString(),
      avatarIcon: 'tabler-x',
      avatarColor: 'error',
      trend: stats.changes.cancelled >= 0 ? 'positive' : 'negative',
      trendNumber: `${Math.abs(stats.changes.cancelled)}%`,
      subtitle: formatSubtitle(stats.current.cancelled, stats.previous.cancelled)
    }
  ]

  return (
    <Grid container spacing={6}>
      {data.map((item, i) => (
        <Grid key={i} item xs={12} sm={6} md={3}>
          <HorizontalWithSubtitle {...{ ...item, avatarColor: item.avatarColor as any }} />
        </Grid>
      ))}
    </Grid>
  )
}

export default AppointmentListCards
