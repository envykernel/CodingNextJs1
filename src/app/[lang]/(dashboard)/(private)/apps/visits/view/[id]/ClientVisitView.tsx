'use client'

import { useState, useCallback, useEffect } from 'react'

import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid2'

import CircularProgress from '@mui/material/CircularProgress'

import { TranslationProvider } from '@/contexts/translationContext'

// Dynamically import form components with loading states
const VisitOverviewTab = dynamic(() => import('@/views/apps/visits/view/visit-right/overview'), {
  loading: () => (
    <div className='flex items-center justify-center p-4'>
      <CircularProgress />
    </div>
  ),
  ssr: false
})

const PatientMeasurementsForm = dynamic(() => import('@/views/apps/visits/view/visit-right/PatientMeasurementsForm'), {
  loading: () => (
    <div className='flex items-center justify-center p-4'>
      <CircularProgress />
    </div>
  ),
  ssr: false
})

const ClinicalExamForm = dynamic(() => import('@/views/apps/visits/view/visit-right/ClinicalExamForm'), {
  loading: () => (
    <div className='flex items-center justify-center p-4'>
      <CircularProgress />
    </div>
  ),
  ssr: false
})

const PrescriptionForm = dynamic(() => import('@/components/prescriptions/PrescriptionForm'), {
  loading: () => (
    <div className='flex items-center justify-center p-4'>
      <CircularProgress />
    </div>
  ),
  ssr: false
})

const LabTestOrderForm = dynamic(() => import('@/components/lab-test-order-form'), {
  loading: () => (
    <div className='flex items-center justify-center p-4'>
      <CircularProgress />
    </div>
  ),
  ssr: false
})

const RadiologyOrderForm = dynamic(() => import('@/components/radiology-order-form'), {
  loading: () => (
    <div className='flex items-center justify-center p-4'>
      <CircularProgress />
    </div>
  ),
  ssr: false
})

// Import static components
import VisitLeftOverview from '@/views/apps/visits/view/visit-left-overview'
import VisitRight from '@/views/apps/visits/view/visit-right'

interface ClientVisitViewProps {
  data: {
    visitData: {
      id: number
      measurements?: any
      clinicalExam?: any
      prescriptions?: any[]
      labTests?: any[]
      [key: string]: any
    }
    dictionary: any
    prescriptionInitialData: any
    prescriptionExists: boolean
  }
}

export default function ClientVisitView({ data: initialData }: ClientVisitViewProps) {
  const [data, setData] = useState(initialData)
  const { visitData, dictionary } = data
  const [isLoading, setIsLoading] = useState(true)

  // Add effect to handle loading state
  useEffect(() => {
    if (visitData) {
      setIsLoading(false)
    }
  }, [visitData])

  const handleVisitUpdate = useCallback(
    async (updatedVisit?: any) => {
      try {
        if (updatedVisit) {
          // If we have updated visit data, use it directly
          setData(prevData => ({
            ...prevData,
            visitData: updatedVisit
          }))
        } else {
          // Otherwise fetch the latest data
          const response = await fetch(`/api/visits/${visitData.id}`)

          if (!response.ok) throw new Error('Failed to fetch updated visit data')

          const { visit } = await response.json()

          // Update only the visit data while keeping other data the same
          setData(prevData => ({
            ...prevData,
            visitData: visit
          }))
        }
      } catch (error) {
        console.error('Error updating visit data:', error)
      }
    },
    [visitData.id]
  )

  const tabContentList = {
    overview: isLoading ? (
      <div className='flex items-center justify-center p-4'>
        <CircularProgress />
      </div>
    ) : (
      <VisitOverviewTab visitData={visitData} dictionary={dictionary} />
    ),
    patientMeasurements: (
      <PatientMeasurementsForm
        visitId={visitData.id}
        dictionary={dictionary}
        initialValues={visitData.patient_measurement}
        onVisitUpdate={handleVisitUpdate}
      />
    ),
    clinicalExam: (
      <ClinicalExamForm
        visitId={visitData.id}
        dictionary={dictionary}
        initialValues={visitData.clinical_exams?.[0]}
        onVisitUpdate={handleVisitUpdate}
      />
    ),
    prescriptions: (
      <PrescriptionForm
        dictionary={dictionary}
        patientId={visitData.patient_id}
        doctorName={visitData.doctor?.name || ''}
        initialData={
          visitData.prescriptions?.[0]
            ? {
                id: visitData.prescriptions[0].id,
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
            : undefined
        }
        onSubmit={async data => {
          try {
            // Use the API endpoint instead of server actions
            const res = await fetch('/api/prescriptions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                visit_id: visitData.id,
                medications: data.medications,
                notes: data.notes
              })
            })

            if (!res.ok) {
              const error = await res.json()

              throw new Error(error.message || 'Failed to save prescription')
            }

            // Fetch updated visit data
            const visitRes = await fetch(`/api/visits/${visitData.id}`)

            if (!visitRes.ok) throw new Error('Failed to fetch updated visit data')
            const response = await visitRes.json()

            handleVisitUpdate(response.visit)
          } catch (error) {
            console.error('Error saving prescription:', error)
            throw error
          }
        }}
        submitButtonText={dictionary?.navigation?.save || 'Save'}
        title={dictionary?.navigation?.prescription || 'Prescription'}
      />
    ),
    tests: (
      <LabTestOrderForm
        visitId={visitData.id}
        dictionary={dictionary}
        initialValues={visitData.lab_test_orders}
        onVisitUpdate={handleVisitUpdate}
      />
    ),
    radiology: (
      <RadiologyOrderForm
        visitId={visitData.id}
        initialValues={visitData.radiology_orders}
        onSuccess={handleVisitUpdate}
      />
    )
  }

  return (
    <TranslationProvider dictionary={dictionary}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <VisitLeftOverview visitData={visitData} />
        </Grid>
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <VisitRight
            visitData={visitData}
            dictionary={dictionary}
            tabContentList={tabContentList}
            onVisitUpdate={handleVisitUpdate}
          />
        </Grid>
      </Grid>
    </TranslationProvider>
  )
}
