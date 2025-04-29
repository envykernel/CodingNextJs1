'use client'

import type { PrescriptionFormValues } from './PrescriptionForm'
import PrescriptionForm from './PrescriptionForm'

export default function CreatePrescriptionClient({ dictionary }: { dictionary: any }) {
  const onSubmit = (data: PrescriptionFormValues) => {
    console.log('Creating prescription:', JSON.stringify(data, null, 2))
  }

  return (
    <PrescriptionForm
      dictionary={dictionary}
      onSubmit={onSubmit}
      submitButtonText={dictionary?.navigation?.create}
      title={dictionary?.navigation?.createPrescription}
    />
  )
}
