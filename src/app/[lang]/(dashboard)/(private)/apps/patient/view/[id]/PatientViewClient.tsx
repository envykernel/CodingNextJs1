'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import PatientLeftOverview from '@views/apps/patient/view/patient-left-overview'
import PatientRight from '@views/apps/patient/view/patient-right'

// Data Imports
import { updatePatientAction } from '@/app/server/actions'

interface PatientViewClientProps {
  initialPatientData: any
  appointments: any[]
  patientId: number
}

const PatientViewClient = ({ initialPatientData, appointments, patientId }: PatientViewClientProps) => {
  const [patientData, setPatientData] = useState(initialPatientData)

  const handlePatientUpdate = async (updatedPatient: any) => {
    try {
      const result = await updatePatientAction(patientId, updatedPatient)

      if (result) {
        setPatientData(result)
      }
    } catch (error) {
      console.error('Error updating patient:', error)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <PatientLeftOverview patientData={patientData} onPatientUpdated={handlePatientUpdate} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <PatientRight patientId={patientId} patientData={patientData} appointments={appointments} />
      </Grid>
    </Grid>
  )
}

export default PatientViewClient
