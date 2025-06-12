import { Grid as MuiGrid } from '@mui/material'

import VisitDetails from './VisitDetails'
import DoctorAssignment from './DoctorAssignment'

interface VisitData {
  id: number
  doctor?: {
    id: number
    name: string
    email: string
  }
  patient?: {
    id?: string | number
    name?: string
    avatar?: string
    birthdate?: string
    gender?: string
    status?: string
    phone_number?: string
    email?: string
    address?: string
    city?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_contact_email?: string
  }
  [key: string]: any
}

interface VisitLeftOverviewProps {
  visitData: VisitData
  onVisitUpdate: (updatedVisit: VisitData) => void
}

const VisitLeftOverview = ({ visitData, onVisitUpdate }: VisitLeftOverviewProps) => (
  <MuiGrid container spacing={6}>
    <MuiGrid item xs={12}>
      <DoctorAssignment visitData={visitData} onDoctorUpdate={onVisitUpdate} />
    </MuiGrid>
    <MuiGrid item xs={12}>
      <VisitDetails visitData={visitData} />
    </MuiGrid>
  </MuiGrid>
)

export default VisitLeftOverview
