// AppointmentListCards component
'use client'

import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'

import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

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
    const currentMonth = new Date().toLocaleString('default', { month: 'short' })

    const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', {
      month: 'short'
    })

    return `${currentMonth}: ${current} | ${previousMonth}: ${previous}`
  }

  const data = [
    {
      title: 'Total Appointments',
      stats: stats.current.total.toString(),
      avatarIcon: 'tabler-calendar-event',
      avatarColor: 'primary',
      trend: stats.changes.total >= 0 ? 'positive' : 'negative',
      trendNumber: `${Math.abs(stats.changes.total)}%`,
      subtitle: formatSubtitle(stats.current.total, stats.previous.total)
    },
    {
      title: 'Completed',
      stats: stats.current.completed.toString(),
      avatarIcon: 'tabler-check',
      avatarColor: 'success',
      trend: stats.changes.completed >= 0 ? 'positive' : 'negative',
      trendNumber: `${Math.abs(stats.changes.completed)}%`,
      subtitle: formatSubtitle(stats.current.completed, stats.previous.completed)
    },
    {
      title: 'Scheduled',
      stats: stats.current.scheduled.toString(),
      avatarIcon: 'tabler-clock',
      avatarColor: 'warning',
      trend: stats.changes.scheduled >= 0 ? 'positive' : 'negative',
      trendNumber: `${Math.abs(stats.changes.scheduled)}%`,
      subtitle: formatSubtitle(stats.current.scheduled, stats.previous.scheduled)
    },
    {
      title: 'Cancelled',
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
