'use client'

// React Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

// Component Imports
import PatientSearchBar from '@/views/dashboards/organization/PatientSearchBar'
import OrganisationDashboardPatientStatistics from '@/views/dashboards/organization/OrganisationDashboardPatientStatistics'
import TodayAppointments from '@/views/dashboards/organization/TodayAppointments'
import AppointmentDayStats from '@/views/dashboards/organization/AppointmentDayStats'

const OrganizationDashboard = () => {
  return (
    <Grid container spacing={6}>
      {/* Patient Search Bar */}
      <Grid item xs={12}>
        <Box sx={{ py: 4 }}>
          <PatientSearchBar />
        </Box>
      </Grid>

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
