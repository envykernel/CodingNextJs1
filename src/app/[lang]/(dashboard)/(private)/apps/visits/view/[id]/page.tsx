import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'

import VisitLeftOverview from '@views/apps/visits/view/visit-left-overview'
import VisitRight from '@views/apps/visits/view/visit-right'
import { getVisitById } from '@/app/server/visitActions'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'
import PatientMeasurementsForm from '@views/apps/visits/view/visit-right/PatientMeasurementsForm'
import ClinicalExamForm from '@views/apps/visits/view/visit-right/ClinicalExamForm'

const VisitOverviewTab = dynamic(() => import('@views/apps/visits/view/visit-right/overview'))

const tabContentList = (visitData: any, lang: string, dictionary: any) => ({
  overview: <VisitOverviewTab visitData={visitData} />,
  measurements: (
    <PatientMeasurementsForm
      key={lang}
      visitId={visitData.id}
      dictionary={dictionary}
      initialValues={visitData.patient_measurement}
    />
  ),
  clinicalExam: (
    <ClinicalExamForm
      key={lang}
      visitId={visitData.id}
      dictionary={dictionary}
      initialValues={
        visitData.clinical_exams && visitData.clinical_exams.length > 0 ? visitData.clinical_exams[0] : undefined
      }
    />
  )
})

export default async function VisitViewTab({ params }: { params: Promise<{ id: string; lang: string }> }) {
  const { id, lang } = await params
  const visitId = Number(id)
  const visitData = await getVisitById(visitId)
  const dictionary = await getDictionary(lang as Locale)

  return (
    <TranslationProvider dictionary={dictionary}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, lg: 4, md: 5 }}>
          <VisitLeftOverview visitData={visitData} />
        </Grid>
        <Grid size={{ xs: 12, lg: 8, md: 7 }}>
          <VisitRight tabContentList={tabContentList(visitData, lang, dictionary)} />
        </Grid>
      </Grid>
    </TranslationProvider>
  )
}
