'use client'

// React Imports
import { useState } from 'react'
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import PatientLeftOverview from '@views/apps/patient/view/patient-left-overview'
import PatientRight from '@views/apps/patient/view/patient-right'

// Data Imports
import { updatePatientAction } from '@/app/server/actions'

// Dynamic Imports
const OverViewTab = dynamic(() => import('@views/apps/patient/view/patient-right/overview'))
const SecurityTab = dynamic(() => import('@views/apps/patient/view/patient-right/security'))
const BillingPlans = dynamic(() => import('@views/apps/patient/view/patient-right/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/apps/patient/view/patient-right/notifications'))
const ConnectionsTab = dynamic(() => import('@views/apps/patient/view/patient-right/connections'))
const MedicalDataTab = dynamic(() => import('@views/apps/patient/view/patient-right/medical'))
const AppointmentsTab = dynamic(() => import('@views/apps/patient/view/patient-right/appointments'))

// Vars
const tabContentList = (patientData: any, appointments: any[]): { [key: string]: ReactElement } => ({
  overview: <OverViewTab patientData={patientData} />,
  'medical-data': <MedicalDataTab patientData={patientData} />,
  appointments: <AppointmentsTab appointments={appointments} />,
  security: <SecurityTab />,
  'billing-plans': <BillingPlans data={[]} />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />
})

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
        <PatientRight tabContentList={tabContentList(patientData, appointments)} />
      </Grid>
    </Grid>
  )
}

export default PatientViewClient
