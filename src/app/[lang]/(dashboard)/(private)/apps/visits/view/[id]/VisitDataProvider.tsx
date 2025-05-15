import { getVisitById } from '@/app/server/visitActions'
import { getPrescriptionData } from '@/app/server/prescriptionActions'
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
  const [visit, dict, prescriptionResult] = await Promise.all([
    getVisitById(visitId),
    getDictionary(lang),
    getPrescriptionData(visitId)
  ])

  if (!visit) {
    return null
  }

  return children({
    visitData: visit,
    dictionary: dict,
    doctorName: visit.doctor?.name || '',
    prescriptionInitialData: prescriptionResult.prescriptionData,
    prescriptionExists: prescriptionResult.prescriptionExists
  })
}
