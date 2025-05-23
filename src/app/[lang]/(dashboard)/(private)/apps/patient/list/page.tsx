// Component Imports
// import { getServerSession } from 'next-auth'

import PatientList from '@views/apps/patient/list'

// Data Imports
import { getPatientList } from '@/app/server/patientActions'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import { TranslationProvider } from '@/contexts/translationContext'

// import { authOptions } from '@/libs/auth'
import { getUserOrganisation } from '@/utils/getUserOrganisation'

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

const PatientListApp = async ({
  params,
  searchParams
}: {
  params: Promise<{ lang: Locale }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const { lang } = await params
  const resolvedSearchParams = await searchParams

  // Parse pagination params
  const page = resolvedSearchParams?.page
    ? Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page)
    : 1

  const pageSize = resolvedSearchParams?.pageSize
    ? Number(
        Array.isArray(resolvedSearchParams.pageSize) ? resolvedSearchParams.pageSize[0] : resolvedSearchParams.pageSize
      )
    : 10

  const name = resolvedSearchParams?.name
    ? Array.isArray(resolvedSearchParams.name)
      ? resolvedSearchParams.name[0]
      : resolvedSearchParams.name
    : undefined

  // Get the logged-in user's organisationId
  const { organisationId } = await getUserOrganisation()
  const patientData = await getPatientList({ page, pageSize, name, organisationId })

  const dictionary = await getDictionary(lang)

  return (
    <TranslationProvider dictionary={dictionary}>
      <PatientList
        patientData={patientData.patients}
        page={patientData.page}
        pageSize={patientData.pageSize}
        total={patientData.total}
      />
    </TranslationProvider>
  )
}

export default PatientListApp
