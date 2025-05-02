// Component Imports
import PatientList from '@views/apps/patient/list'

// Data Imports
import { getPatientData } from '@/app/server/patientActions'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import { TranslationProvider } from '@/contexts/translationContext'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/user-list` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getUserData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/user-list`)

  if (!res.ok) {
    throw new Error('Failed to fetch userData')
  }

  return res.json()
} */

const PatientListApp = async ({ params }: { params: { lang: Locale } }) => {
  // Vars
  const patientData = await getPatientData()
  const dictionary = await getDictionary(params.lang)

  return (
    <TranslationProvider dictionary={dictionary}>
      <PatientList patientData={patientData} />
    </TranslationProvider>
  )
}

export default PatientListApp
