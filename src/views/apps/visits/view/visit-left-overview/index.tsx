import { Grid } from '@mui/material'

import VisitDetails from './VisitDetails'

interface Patient {
  id?: string | number
  name?: string
  avatar?: string
  birthdate?: string
  gender?: string
  doctor?: string
  status?: string
  phone_number?: string
  email?: string
  address?: string
  city?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_email?: string
}

interface VisitData {
  id?: string | number
  patient?: Patient
}

interface VisitLeftOverviewProps {
  visitData: VisitData
}

const VisitLeftOverview = ({ visitData }: VisitLeftOverviewProps) => (
  <Grid container spacing={6}>
    <Grid size={{ xs: 12 }}>
      <VisitDetails visitData={visitData} />
    </Grid>
  </Grid>
)

export default VisitLeftOverview
