// Data Imports
import { getPatientById, getAppointmentsByPatientId } from '@/app/server/patientActions'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'

// Client Component Imports
import PatientViewClient from './PatientViewClient'

import type { Locale } from '@configs/i18n'

interface PatientViewTabProps {
  params: { id: string; lang: Locale }
}

const PatientViewTab = async ({ params }: PatientViewTabProps) => {
  const patientId = Number(params.id)
  const patientData = await getPatientById(patientId)
  const appointments = await getAppointmentsByPatientId(patientId)
  const dictionary = await getDictionary(params.lang)

  return (
    <TranslationProvider dictionary={dictionary}>
      <PatientViewClient initialPatientData={patientData} appointments={appointments} patientId={patientId} />
    </TranslationProvider>
  )
}

export default PatientViewTab
