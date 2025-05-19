'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import PatientStatistics from '@components/patient-statistics/PatientStatistics'
import PatientStatusOverview from '@/views/dashboards/organization/PatientStatusOverview'
import TodayAppointments from '@/views/dashboards/organization/TodayAppointments'
import ThisWeekPayments from '@/views/dashboards/organization/ThisWeekPayments'
import PaymentStatistics from '@/views/dashboards/organization/PaymentStatistics'

// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'
import type { PatientStatisticsType } from '@/app/server/patientStatisticsActions'

const OrganizationDashboard = () => {
  const [statistics, setStatistics] = useState<UserDataType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/patient-statistics')

        if (!response.ok) throw new Error('Failed to fetch statistics')

        const data: PatientStatisticsType = await response.json()

        setStatistics([
          {
            title: 'New Patients',
            stats: data.newPatients.monthly.count.toString(),
            avatarIcon: 'tabler-user-plus',
            avatarColor: 'success',
            trend: data.newPatients.monthly.trend,
            trendNumber: `${Math.abs(Math.round(data.newPatients.monthly.percentageChange))}%`,
            subtitle: 'This month vs last month'
          },
          {
            title: 'New Patients',
            stats: data.newPatients.yearly.count.toString(),
            avatarIcon: 'tabler-user-plus',
            avatarColor: 'success',
            trend: data.newPatients.yearly.trend,
            trendNumber: `${Math.abs(Math.round(data.newPatients.yearly.percentageChange))}%`,
            subtitle: 'This year vs last year'
          },
          {
            title: 'Disabled Patients',
            stats: data.disabledPatients.monthly.count.toString(),
            avatarIcon: 'tabler-user-off',
            avatarColor: 'error',
            trend: data.disabledPatients.monthly.trend,
            trendNumber: `${Math.abs(Math.round(Math.abs(data.disabledPatients.monthly.percentageChange)))}%`,
            subtitle: 'This month vs last month'
          },
          {
            title: 'Disabled Patients',
            stats: data.disabledPatients.yearly.count.toString(),
            avatarIcon: 'tabler-user-off',
            avatarColor: 'error',
            trend: data.disabledPatients.yearly.trend,
            trendNumber: `${Math.abs(Math.round(Math.abs(data.disabledPatients.yearly.percentageChange)))}%`,
            subtitle: 'This year vs last year'
          }
        ])
      } catch (error) {
        console.error('Error fetching patient statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  if (loading) {
    return <div>Loading statistics...</div>
  }

  return (
    <Grid container spacing={6}>
      {/* Patient Statistics */}
      <Grid item xs={12}>
        <PatientStatistics data={statistics} />
      </Grid>

      {/* Today's Appointments */}
      <Grid item xs={12}>
        <TodayAppointments />
      </Grid>

      {/* This Week's Payments and Patient Status Overview */}
      <Grid item xs={12} md={6}>
        <ThisWeekPayments />
      </Grid>

      {/* Patient Status Overview */}
      <Grid item xs={12} md={6}>
        <PatientStatusOverview />
      </Grid>

      {/* Payment Statistics */}
      <Grid item xs={12}>
        <PaymentStatistics />
      </Grid>
    </Grid>
  )
}

export default OrganizationDashboard
