'use client'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import InfoIcon from '@mui/icons-material/Info'
import Paper from '@mui/material/Paper'

import { useTranslation } from '@/contexts/translationContext'
import { formatDateToDDMMYYYY } from '@/utils/date'
import PatientMeasurementBlock from './PatientMeasurementBlock'
import ClinicalExamBlock from './ClinicalExamBlock'
import PrescriptionBlock from './PrescriptionBlock'
import LabTestRecapBlock from './LabTestRecapBlock'
import RadiologyBlock from './RadiologyBlock'

const VisitOverviewTab = ({ visitData, dictionary }: { visitData: any; dictionary: any }) => {
  const { t } = useTranslation()

  // Add early return if visitData is not available
  if (!visitData) {
    return null
  }

  const status = visitData.status

  const visitStatusObj: {
    [key: string]: {
      color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
      label: string
      icon: string
    }
  } = {
    scheduled: {
      color: 'info',
      label: t('navigation.visitDetails.statusOptions.scheduled') || 'Scheduled',
      icon: 'tabler-calendar-event'
    },
    in_progress: {
      color: 'warning',
      label: t('navigation.visitDetails.statusOptions.inProgress') || 'In Progress',
      icon: 'tabler-clock-play'
    },
    completed: {
      color: 'success',
      label: t('navigation.visitDetails.statusOptions.completed') || 'Completed',
      icon: 'tabler-circle-check'
    },
    cancelled: {
      color: 'error',
      label: t('navigation.visitDetails.statusOptions.cancelled') || 'Cancelled',
      icon: 'tabler-circle-x'
    }
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
          <CardContent sx={{ p: theme => `${theme.spacing(2)} !important` }}>
            {/* Header Row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
              }}
            >
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                {t('navigation.visitDetails.title') || 'Visit Details'}
              </Typography>
              <Chip
                icon={<i className={visitStatusObj[status]?.icon} />}
                label={visitStatusObj[status]?.label || status}
                color={visitStatusObj[status]?.color || 'default'}
                size='small'
                sx={{
                  height: 28,
                  '& .MuiChip-icon': {
                    fontSize: '1rem',
                    marginLeft: '4px'
                  }
                }}
              />
            </Box>

            {/* Content Grid */}
            <Grid container spacing={2}>
              {/* Date Card */}
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1
                  }}
                >
                  <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 0.5 }}>
                    {t('navigation.visitDetails.date') || 'Date'}
                  </Typography>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 500,
                      letterSpacing: '0.15px'
                    }}
                  >
                    {formatDateToDDMMYYYY(visitData.visit_date)}
                  </Typography>
                </Paper>
              </Grid>

              {/* Start Time Card */}
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1
                  }}
                >
                  <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 0.5 }}>
                    {t('navigation.visitDetails.startTime') || 'Start Time'}
                  </Typography>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 500,
                      letterSpacing: '0.15px'
                    }}
                  >
                    {visitData.start_time || '-'}
                  </Typography>
                </Paper>
              </Grid>

              {/* End Time Card */}
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      {endTimeLabel}
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
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 500,
                      letterSpacing: '0.15px',
                      color: !isVisitEnded ? 'text.secondary' : 'inherit'
                    }}
                  >
                    {visitData.end_time || '-'}
                  </Typography>
                </Paper>
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
