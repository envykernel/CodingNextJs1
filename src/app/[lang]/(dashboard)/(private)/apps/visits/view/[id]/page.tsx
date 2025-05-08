import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'

import VisitLeftOverview from '@views/apps/visits/view/visit-left-overview'
import VisitRight from '@views/apps/visits/view/visit-right'
import { getVisitById } from '@/app/server/visitActions'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'
import PatientMeasurementsForm from '@views/apps/visits/view/visit-right/PatientMeasurementsForm'

const VisitOverviewTab = dynamic(() => import('@views/apps/visits/view/visit-right/overview'))

const tabContentList = (visitData: any) => ({
  overview: <VisitOverviewTab visitData={visitData} />,
  measurements: <PatientMeasurementsForm visitId={visitData.id} />
})

export default async function VisitViewTab({ params }: { params: { id: string; lang: string } }) {
  const visitId = Number(params.id)
  const visitData = await getVisitById(visitId)
  const dictionary = await getDictionary(params.lang as Locale)

  return (
    <TranslationProvider dictionary={dictionary}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, lg: 4, md: 5 }}>
          <VisitLeftOverview visitData={visitData} />
        </Grid>
        <Grid size={{ xs: 12, lg: 8, md: 7 }}>
          <VisitRight tabContentList={tabContentList(visitData)} />
        </Grid>
      </Grid>
    </TranslationProvider>
  )
}
