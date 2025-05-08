import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'

import { getServerSession } from 'next-auth'

import VisitLeftOverview from '@views/apps/visits/view/visit-left-overview'
import VisitRight from '@views/apps/visits/view/visit-right'
import { getVisitById, savePrescriptionForVisit, updatePrescriptionForVisit } from '@/app/server/visitActions'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'
import PatientMeasurementsForm from '@views/apps/visits/view/visit-right/PatientMeasurementsForm'
import ClinicalExamForm from '@views/apps/visits/view/visit-right/ClinicalExamForm'
import PrescriptionForm from '@/components/prescriptions/PrescriptionForm'
import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

const VisitOverviewTab = dynamic(() => import('@views/apps/visits/view/visit-right/overview'))

const tabContentList = (
  visitData: any,
  lang: string,
  dictionary: any,
  doctorName: string,
  prescriptionInitialData: any,
  prescriptionExists: boolean
) => ({
  overview: <VisitOverviewTab visitData={visitData} dictionary={dictionary} />,
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
  ),
  prescriptions: (
    <PrescriptionForm
      dictionary={dictionary}
      patientId={visitData.patient_id}
      doctorName={doctorName}
      initialData={prescriptionInitialData}
      onSubmit={async data => {
        'use server'

        if (prescriptionExists) {
          await updatePrescriptionForVisit(visitData.id, data)
        } else {
          await savePrescriptionForVisit(visitData.id, data)
        }
      }}
      submitButtonText={dictionary?.navigation?.savePrescription || 'Save Prescription'}
      title={dictionary?.navigation?.prescriptions || 'Prescriptions'}
    />
  )
})

export default async function VisitViewTab({ params }: { params: Promise<{ id: string; lang: string }> }) {
  const { id, lang } = await params
  const visitId = Number(id)
  const visitData = await getVisitById(visitId)
  const dictionary = await getDictionary(lang as Locale)
  const session = await getServerSession(authOptions)
  const doctorName = session?.user?.name || ''

  // Fetch prescription for this visit (if any)
  const prescription = await prisma.prescription.findFirst({
    where: { visit_id: visitId },
    include: { lines: true, doctor: true }
  })

  const prescriptionInitialData = prescription
    ? {
        patientId: prescription.patient_id,
        doctor: prescription.doctor?.name || '',
        medications: prescription.lines.map((line, idx) => ({
          id: idx + 1,
          name: line.drug_name,
          dosage: line.dosage || '',
          frequency: line.frequency || '',
          duration: line.duration || '',
          notes: line.instructions ?? ''
        })),
        notes: prescription.notes || ''
      }
    : undefined

  const prescriptionExists = !!prescription

  return (
    <TranslationProvider dictionary={dictionary}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, lg: 4, md: 5 }}>
          <VisitLeftOverview visitData={visitData} />
        </Grid>
        <Grid size={{ xs: 12, lg: 8, md: 7 }}>
          <VisitRight
            tabContentList={tabContentList(
              visitData,
              lang,
              dictionary,
              doctorName,
              prescriptionInitialData,
              prescriptionExists
            )}
          />
        </Grid>
      </Grid>
    </TranslationProvider>
  )
}
