'use client'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import { useTranslation } from '@/contexts/translationContext'
import PatientMeasurementBlock from './PatientMeasurementBlock'
import ClinicalExamBlock from './ClinicalExamBlock'
import PrescriptionBlock from './PrescriptionBlock'

const VisitOverviewTab = ({ visitData, dictionary }: { visitData: any; dictionary: any }) => {
  const t = useTranslation()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-3 mb-4'>
              <i className='tabler-calendar-event text-xl text-primary' />
              <Typography variant='h6'>{t.visitDetails || 'Visit Details'}</Typography>
            </div>
            <Divider className='mb-4' />
            {/* Multi-column layout for visit data */}
            <div className='flex flex-col gap-4'>
              {/* Single row for date, start time, end time, status */}
              <div className='flex flex-wrap items-center gap-6'>
                <div className='flex items-center gap-2'>
                  <i className='tabler-calendar-event text-lg' />
                  <Typography>
                    <b>{t.date || 'Date'}:</b>{' '}
                    {visitData.arrival_time && !isNaN(new Date(visitData.arrival_time).getTime())
                      ? new Date(visitData.arrival_time).toISOString().slice(0, 10)
                      : '-'}
                  </Typography>
                </div>
                <div className='flex items-center gap-2'>
                  <i className='tabler-clock-hour-8 text-lg' />
                  <Typography>
                    <b>{t.startTime || 'Start Time'}:</b>{' '}
                    {visitData.start_time && !isNaN(new Date(visitData.start_time).getTime())
                      ? new Date(visitData.start_time).toISOString().slice(11, 19)
                      : '-'}
                  </Typography>
                </div>
                <div className='flex items-center gap-2'>
                  <i className='tabler-clock-hour-4 text-lg' />
                  <Typography>
                    <b>{t.endTime || 'End Time'}:</b>{' '}
                    {visitData.end_time && !isNaN(new Date(visitData.end_time).getTime())
                      ? new Date(visitData.end_time).toISOString().slice(11, 19)
                      : '-'}
                  </Typography>
                </div>
                <div className='flex items-center gap-2'>
                  <i className='tabler-flag text-lg' />
                  <Typography>
                    <b>{t.status || 'Status'}:</b> {visitData.status || '-'}
                  </Typography>
                </div>
              </div>
              {/* Notes on a separate line */}
              <div className='flex items-center gap-2'>
                <i className='tabler-notes text-lg' />
                <Typography>
                  <b>{t.notes || 'Notes'}:</b> {visitData.notes || '-'}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
      {visitData.patient_measurement && (
        <Grid size={{ xs: 12 }}>
          <PatientMeasurementBlock measurement={visitData.patient_measurement} />
        </Grid>
      )}
      {visitData.clinical_exams && visitData.clinical_exams.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <ClinicalExamBlock exam={visitData.clinical_exams[0]} />
        </Grid>
      )}
      {visitData.prescriptions && visitData.prescriptions.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <PrescriptionBlock
            prescription={{
              id: visitData.prescriptions[0].id,
              doctor: visitData.prescriptions[0].doctor?.name || '',
              medications:
                visitData.prescriptions[0].lines?.map((line: any, idx: number) => ({
                  id: idx + 1,
                  name: line.drug_name,
                  dosage: line.dosage || '',
                  frequency: line.frequency || '',
                  duration: line.duration || '',
                  notes: line.instructions ?? ''
                })) || [],
              notes: visitData.prescriptions[0].notes || ''
            }}
            dictionary={dictionary}
          />
        </Grid>
      )}
    </Grid>
  )
}

export default VisitOverviewTab
