// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports

// Component Imports
import PatientLeftOverview from '@views/apps/patient/view/patient-left-overview'
import PatientRight from '@views/apps/patient/view/patient-right'

// Data Imports
import { getPatientById } from '@/app/server/patientActions'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'

const OverViewTab = dynamic(() => import('@views/apps/patient/view/patient-right/overview'))
const SecurityTab = dynamic(() => import('@views/apps/patient/view/patient-right/security'))
const BillingPlans = dynamic(() => import('@views/apps/patient/view/patient-right/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/apps/patient/view/patient-right/notifications'))
const ConnectionsTab = dynamic(() => import('@views/apps/patient/view/patient-right/connections'))
const MedicalDataTab = dynamic(() => import('@views/apps/patient/view/patient-right/medical'))

// Vars
const tabContentList = (patientData: any): { [key: string]: ReactElement } => ({
  overview: <OverViewTab patientData={patientData} />,
  medical: <MedicalDataTab patientData={patientData} />,
  security: <SecurityTab />,
  'billing-plans': <BillingPlans data={[]} />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />
})

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/pages/pricing` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getPricingData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/pages/pricing`)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
} */

import type { Locale } from '@configs/i18n'

interface PatientViewTabProps {
  params: { id: string; lang: Locale }
}

const PatientViewTab = async ({ params }: PatientViewTabProps) => {
  const patientId = Number(params.id)
  const patientData = await getPatientById(patientId)
  const dictionary = await getDictionary(params.lang)

  return (
    <TranslationProvider dictionary={dictionary}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, lg: 4, md: 5 }}>
          <PatientLeftOverview patientData={patientData} />
        </Grid>
        <Grid size={{ xs: 12, lg: 8, md: 7 }}>
          <PatientRight tabContentList={tabContentList(patientData)} />
        </Grid>
      </Grid>
    </TranslationProvider>
  )
}

export default PatientViewTab
