import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import EditPrescriptionClient from '@/components/prescriptions/EditPrescriptionClient'
import type { PrescriptionFormValues } from '@/components/prescriptions/PrescriptionForm'

// Mock data for a single prescription
const mockPrescription: PrescriptionFormValues = {
  patientName: 'John Doe',
  doctor: 'Dr. Smith',
  medications: [
    {
      id: 1,
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '7 days',
      notes: 'Take with food'
    }
  ],
  notes: 'Follow up in 2 weeks'
}

export default async function EditPrescriptionPage({ params }: { params: { lang: Locale; id: string } }) {
  const dictionary = await getDictionary(params.lang)

  // TODO: Replace with actual API call to fetch prescription data
  // const prescription = await fetchPrescription(params.id)
  const prescription = mockPrescription

  return <EditPrescriptionClient dictionary={dictionary} prescription={prescription} />
}
