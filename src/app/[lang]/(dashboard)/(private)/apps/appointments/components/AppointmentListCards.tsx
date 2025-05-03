// AppointmentListCards component
'use client'

import Grid from '@mui/material/Grid'

import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

const data = [
  {
    title: 'Total Appointments',
    stats: '120',
    avatarIcon: 'tabler-calendar-event',
    avatarColor: 'primary',
    trend: 'positive',
    trendNumber: '10%',
    subtitle: 'This month'
  },
  {
    title: 'Completed',
    stats: '90',
    avatarIcon: 'tabler-check',
    avatarColor: 'success',
    trend: 'positive',
    trendNumber: '5%',
    subtitle: 'This month'
  },
  {
    title: 'Pending',
    stats: '20',
    avatarIcon: 'tabler-clock',
    avatarColor: 'warning',
    trend: 'negative',
    trendNumber: '8%',
    subtitle: 'This month'
  },
  {
    title: 'Cancelled',
    stats: '10',
    avatarIcon: 'tabler-x',
    avatarColor: 'error',
    trend: 'negative',
    trendNumber: '2%',
    subtitle: 'This month'
  }
]

const AppointmentListCards = () => (
  <Grid container spacing={6}>
    {data.map((item, i) => (
      <Grid key={i} item xs={12} sm={6} md={3}>
        <HorizontalWithSubtitle {...{ ...item, avatarColor: item.avatarColor as any }} />
      </Grid>
    ))}
  </Grid>
)

export default AppointmentListCards
