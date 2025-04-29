'use client'

import type { PrescriptionFormValues } from './PrescriptionForm'
import PrescriptionForm from './PrescriptionForm'

export default function EditPrescriptionClient({
  dictionary,
  prescription
}: {
  dictionary: any
  prescription: PrescriptionFormValues
}) {
  const onSubmit = (data: PrescriptionFormValues) => {
    console.log('Updating prescription:', JSON.stringify(data, null, 2))
  }

  return (
    <PrescriptionForm
      dictionary={dictionary}
      initialData={prescription}
      onSubmit={onSubmit}
      submitButtonText={dictionary?.navigation?.saveChanges}
      title={dictionary?.navigation?.editPrescription}
    />
  )
}
