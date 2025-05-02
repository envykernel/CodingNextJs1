// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
// import type { UsersType } from '@/types/apps/userTypes'
import type { PatientType } from './PatientListTable'

// Component Imports
import PatientListTable from './PatientListTable'
import PatientListCards from './PatientListCards'

type PatientListProps = {
  patientData?: PatientType[]
  page?: number
  pageSize?: number
  total?: number
}

const PatientList = ({ patientData, page, pageSize, total }: PatientListProps) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <PatientListCards />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <PatientListTable tableData={patientData} page={page} pageSize={pageSize} total={total} />
      </Grid>
    </Grid>
  )
}

export default PatientList
