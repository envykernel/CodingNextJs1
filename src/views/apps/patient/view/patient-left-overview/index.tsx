// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import UserDetails from './UserDetails'
import UserPlan from './UserPlan'

interface PatientLeftOverviewProps {
  patientData: any
}

const UserLeftOverview = ({ patientData }: PatientLeftOverviewProps) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserDetails patientData={patientData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <UserPlan />
      </Grid>
    </Grid>
  )
}

export default UserLeftOverview
