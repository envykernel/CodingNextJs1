import { getVisitById } from '@/app/server/visitActions'
import { getDictionary } from '@/app/server/dictionaryActions'
import type { Locale } from '@configs/i18n'

interface VisitDataProviderProps {
  visitId: number
  lang: Locale
  children: (data: {
    visitData: any
    dictionary: any
    doctorName: string
    prescriptionInitialData: any
    prescriptionExists: boolean
  }) => React.ReactNode
}

export default async function VisitDataProvider({ visitId, lang, children }: VisitDataProviderProps) {
  const [visit, dict] = await Promise.all([getVisitById(visitId), getDictionary(lang)])

  if (!visit) {
    return null
  }

  return children({
    visitData: visit,
    dictionary: dict,
    doctorName: visit.doctor?.name || '',
    prescriptionInitialData: visit.prescriptions?.[0]
      ? {
          patientId: visit.patient_id,
          doctor: visit.doctor?.name || '',
          medications:
            visit.prescriptions[0].lines?.map((line: any, idx: number) => ({
              id: idx + 1,
              name: line.drug_name,
              dosage: line.dosage || '',
              frequency: line.frequency || '',
              duration: line.duration || '',
              notes: line.instructions || ''
            })) || [],
          notes: visit.prescriptions[0].notes || ''
        }
      : undefined,
    prescriptionExists: !!visit.prescriptions?.[0]
  })
}
