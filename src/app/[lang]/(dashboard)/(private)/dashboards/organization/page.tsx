'use client'

// React Imports
import Grid from '@mui/material/Grid'

// Component Imports
import OrganisationDashboardPatientStatistics from '@/views/dashboards/organization/OrganisationDashboardPatientStatistics'
import TodayAppointments from '@/views/dashboards/organization/TodayAppointments'
import AppointmentDayStats from '@/views/dashboards/organization/AppointmentDayStats'

const OrganizationDashboard = () => {
  return (
    <Grid container spacing={6}>
      {/* Patient Statistics */}
      <OrganisationDashboardPatientStatistics />

      {/* Today's Appointments */}
      <Grid item xs={12}>
        <TodayAppointments />
      </Grid>

      {/* Current Week's Appointment Distribution */}
      <Grid item xs={12} md={6}>
        <AppointmentDayStats dateRange='week' />
      </Grid>

      {/* Year-to-Date Appointment Distribution */}
      <Grid item xs={12} md={6}>
        <AppointmentDayStats dateRange='year' />
      </Grid>
    </Grid>
  )
}

export default OrganizationDashboard
