import { getVisitById } from '@/app/server/visitActions'
import { getDictionary } from '@/app/server/dictionaryActions'
import type { Locale } from '@configs/i18n'
import ClientVisitView from '@/app/[lang]/(dashboard)/(private)/apps/visits/view/[id]/ClientVisitView'

interface VisitPageProps {
  params: {
    id: string
    lang: Locale
  }
}

export default async function VisitPage({ params }: VisitPageProps) {
  const { id, lang } = params
  const visitId = parseInt(id)

  const [visitData, dictionary] = await Promise.all([getVisitById(visitId), getDictionary(lang)])

  if (!visitData) {
    return <div>Visit not found</div>
  }

  return (
    <ClientVisitView
      data={{
        visitData,
        dictionary,
        prescriptionInitialData: visitData.prescriptions?.[0]
          ? {
              patientId: visitData.patient_id,
              doctor: visitData.doctor?.name || '',
              medications:
                visitData.prescriptions[0].lines?.map((line: any, idx: number) => ({
                  id: idx + 1,
                  name: line.drug_name,
                  dosage: line.dosage || '',
                  frequency: line.frequency || '',
                  duration: line.duration || '',
                  notes: line.instructions || ''
                })) || [],
              notes: visitData.prescriptions[0].notes || ''
            }
          : undefined,
        prescriptionExists: !!visitData.prescriptions?.[0]
      }}
    />
  )
}
