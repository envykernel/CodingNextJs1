// Component Imports
import PatientList from '@views/apps/patient/list'

// Type Imports
import type { PatientType } from '@views/apps/patient/list/PatientListTable'
import type { Locale } from '@configs/i18n'

// Data Imports
import { getPatientList } from '@/app/server/patientActions'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'
import { getUserOrganisation } from '@/utils/getUserOrganisation'

// Helper function to transform null values to undefined
function transformPatientData(patients: any[]): PatientType[] {
  return patients.map(patient => ({
    ...patient,
    doctor: patient.doctor
      ? {
          id: patient.doctor.id,
          name: patient.doctor.name,
          specialty: patient.doctor.specialty || undefined,
          email: patient.doctor.email || undefined,
          phone_number: patient.doctor.phone_number || undefined
        }
      : undefined,
    status: patient.status || undefined,
    avatar: patient.avatar || undefined,
    address: patient.address || undefined,
    city: patient.city || undefined,
    phone_number: patient.phone_number || undefined,
    email: patient.email || undefined,
    emergency_contact_name: patient.emergency_contact_name || undefined,
    emergency_contact_phone: patient.emergency_contact_phone || undefined,
    emergency_contact_email: patient.emergency_contact_email || undefined,
    created_at: patient.created_at || undefined,
    updated_at: patient.updated_at || undefined
  }))
}

type PageProps = {
  params: Promise<{ lang: Locale }>
}

const PatientListPage = async ({ params }: PageProps) => {
  // Vars
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const { organisationId } = await getUserOrganisation()

  // Fetch patient data
  const patientData = await getPatientList({
    organisationId: organisationId || 0
  })

  // Transform the data to match PatientType
  const transformedPatients = transformPatientData(patientData.patients)

  return (
    <TranslationProvider dictionary={dictionary}>
      <PatientList
        patientData={transformedPatients}
        page={patientData.page}
        pageSize={patientData.pageSize}
        total={patientData.total}
      />
    </TranslationProvider>
  )
}

export default PatientListPage
