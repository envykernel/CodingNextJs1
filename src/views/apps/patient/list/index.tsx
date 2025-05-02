// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
// import type { UsersType } from '@/types/apps/userTypes'
import type { PatientType } from './PatientListTable'

// Component Imports
import PatientListTable from './PatientListTable'
import PatientListCards from './PatientListCards'

const PatientList = ({ patientData }: { patientData?: PatientType[] }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <PatientListCards />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <PatientListTable tableData={patientData} />
      </Grid>
    </Grid>
  )
}

export default PatientList
