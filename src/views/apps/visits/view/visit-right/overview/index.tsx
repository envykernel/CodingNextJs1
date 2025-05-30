'use client'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import InfoIcon from '@mui/icons-material/Info'

import { useTranslation } from '@/contexts/translationContext'
import { formatDateToDDMMYYYY } from '@/utils/date'
import PatientMeasurementBlock from './PatientMeasurementBlock'
import ClinicalExamBlock from './ClinicalExamBlock'
import PrescriptionBlock from './PrescriptionBlock'
import LabTestRecapBlock from './LabTestRecapBlock'
import RadiologyBlock from './RadiologyBlock'

const VisitOverviewTab = ({ visitData, dictionary }: { visitData: any; dictionary: any }) => {
  const { t } = useTranslation()
  const status = visitData.status

  const visitStatusObj: {
    [key: string]: {
      color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
      label: string
    }
  } = {
    scheduled: { color: 'info', label: t('navigation.visitDetails.statusOptions.scheduled') || 'Scheduled' },
    in_progress: { color: 'warning', label: t('navigation.visitDetails.statusOptions.inProgress') || 'In Progress' },
    completed: { color: 'success', label: t('navigation.visitDetails.statusOptions.completed') || 'Completed' },
    cancelled: { color: 'error', label: t('navigation.visitDetails.statusOptions.cancelled') || 'Cancelled' }
  }

  const isVisitEnded = status === 'completed' || status === 'cancelled'

  const endTimeLabel = isVisitEnded
    ? t('navigation.visitDetails.endTime') || 'End Time'
    : t('navigation.visitDetails.estimatedEndTime') || 'Estimated End Time'

  return (
    <Grid container spacing={3}>
      {/* Visit Details Block */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant='h5' sx={{ mr: 2 }}>
                    {t('navigation.visitDetails.title') || 'Visit Details'}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='tabler-calendar text-lg text-primary' />
                    <Typography variant='subtitle2' sx={{ color: 'text.secondary', mr: 1 }}>
                      {t('navigation.visitDetails.date') || 'Date'}:
                    </Typography>
                    <Typography variant='body1'>{formatDateToDDMMYYYY(visitData.visit_date)}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='tabler-clock text-lg text-primary' />
                    <Typography variant='subtitle2' sx={{ color: 'text.secondary', mr: 1 }}>
                      {t('navigation.visitDetails.startTime') || 'Start Time'}:
                    </Typography>
                    <Typography variant='body1'>{visitData.start_time || '-'}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='tabler-clock-off text-lg text-primary' />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant='subtitle2' sx={{ color: 'text.secondary', mr: 1 }}>
                        {endTimeLabel}:
                      </Typography>
                      {!isVisitEnded && (
                        <Tooltip
                          title={
                            t('navigation.visitDetails.estimatedEndTimeTooltip') ||
                            'This is the estimated end time based on the appointment duration'
                          }
                        >
                          <InfoIcon fontSize='small' color='action' sx={{ cursor: 'help' }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant='body1' sx={{ color: !isVisitEnded ? 'text.secondary' : 'inherit' }}>
                      {visitData.end_time || '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='tabler-flag text-lg text-primary' />
                    <Typography variant='subtitle2' sx={{ color: 'text.secondary', mr: 1 }}>
                      {t('navigation.visitDetails.status') || 'Status'}:
                    </Typography>
                    <Chip
                      label={visitStatusObj[status]?.label || status}
                      color={visitStatusObj[status]?.color || 'default'}
                      size='small'
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Other Blocks */}
      <Grid item xs={12}>
        {visitData.patient_measurement ? (
          <PatientMeasurementBlock measurement={visitData.patient_measurement} />
        ) : (
          <Card>
            <CardContent>
              <Typography color='text.secondary'>
                {t('navigation.visitDetails.noMeasurements') || 'No measurements recorded'}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Grid>

      <Grid item xs={12}>
        {visitData.clinical_exams && visitData.clinical_exams.length > 0 ? (
          <ClinicalExamBlock exam={visitData.clinical_exams[0]} />
        ) : (
          <Card>
            <CardContent>
              <Typography color='text.secondary'>
                {t('navigation.visitDetails.noClinicalExam') || 'No clinical exam recorded'}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Grid>

      <Grid item xs={12}>
        {visitData.prescriptions && visitData.prescriptions.length > 0 ? (
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
        ) : (
          <Card>
            <CardContent>
              <Typography color='text.secondary'>
                {t('navigation.visitDetails.noPrescriptions') || 'No prescriptions recorded'}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Grid>

      <Grid item xs={12}>
        <LabTestRecapBlock visitId={visitData.id} dictionary={dictionary} showOnlyIfTestsExist={true} />
      </Grid>

      <Grid item xs={12}>
        <RadiologyBlock radiologyOrders={visitData.radiology_orders} />
      </Grid>
    </Grid>
  )
}

export default VisitOverviewTab
