'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from '@/contexts/translationContext'

// Component Imports
import PatientLabTests from '../dashboard/PatientLabTests'
import PatientMeasurementsChart from '../dashboard/PatientMeasurementsChart'
import CardStatsVertical from '@components/card-statistics/Vertical'
import CardStatsHorizontal from '@components/card-statistics/Horizontal'
import CardStatsWithAreaChart from '@components/card-statistics/StatsWithAreaChart'
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/invoice` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getInvoiceData = async () => {
  const res = await fetch(`${process.env.API_URL}/apps/invoice`)

  if (!res.ok) {
    throw new Error('Failed to fetch invoice data')
  }

  return res.json()
} */

// Helper function to calculate days between dates
const getDaysBetween = (date1: Date, date2: Date) => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Helper function to calculate BMI
const calculateBMI = (weight: number | null, height: number | null) => {
  if (!weight || !height) return null
  const heightInMeters = height / 100
  return (weight / (heightInMeters * heightInMeters)).toFixed(1)
}

// Helper function to format date consistently
const formatDateConsistent = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

interface OverViewTabProps {
  patientData: any
}

const OverViewTab = ({ patientData }: OverViewTabProps) => {
  const theme = useTheme()
  const { t } = useTranslation()

  // Debug logs
  console.log('All appointments:', patientData?.appointments)

  // Get latest measurements
  const latestMeasurements = patientData?.patient_measurements?.[0] || {}
  const bmi = calculateBMI(latestMeasurements.weight_kg, latestMeasurements.height_cm)

  // Get last visit date - get the most recent visit regardless of status
  const sortedAppointments =
    patientData?.appointments?.sort(
      (a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    ) || []

  // Get only the most recent visit
  const lastVisit = sortedAppointments[0]

  // Get upcoming appointments (excluding the last visit if it's in the future)
  const upcomingAppointments =
    patientData?.appointments
      ?.filter((apt: any) => {
        const aptDate = new Date(apt.appointment_date)
        const now = new Date()
        // Only include future appointments that aren't the last visit
        return aptDate > now && apt.id !== lastVisit?.id
      })
      .slice(0, 3) || []

  // Get active prescriptions
  const activePrescriptions = patientData?.prescriptions?.filter((presc: any) => presc.status === 'active') || []

  const daysSinceLastVisit = lastVisit ? getDaysBetween(new Date(lastVisit.appointment_date), new Date()) : null

  // Prepare chart data for vital signs trend
  const vitalSignsData = patientData?.patient_measurements?.slice(0, 7).reverse() || []
  const chartSeries = [
    {
      name: 'Blood Pressure',
      data: vitalSignsData.map((m: any) => m.blood_pressure_systolic || 0)
    }
  ]

  return (
    <Grid container spacing={6}>
      {/* Quick Stats Row */}
      <Grid item xs={12}>
        <Grid container spacing={6}>
          {/* Upcoming Appointments */}
          <Grid item xs={12} sm={6} md={4}>
            <CardStatsVertical
              stats={upcomingAppointments.length.toString()}
              title={t('patient.upcomingAppointments') || 'Upcoming Appointments'}
              subtitle={t('patient.scheduledVisits') || 'Scheduled Visits'}
              avatarIcon='tabler-calendar-event'
              avatarColor='info'
              chipText={t('patient.scheduled') || 'Scheduled'}
              chipColor='info'
              chipVariant='tonal'
            />
          </Grid>

          {/* Last Visit */}
          <Grid item xs={12} sm={6} md={4}>
            <CardStatsVertical
              stats={lastVisit?.appointment_date ? formatDateConsistent(lastVisit.appointment_date) : '-'}
              title={t('patient.lastVisit') || 'Last Visit'}
              subtitle={t('patient.lastVisitDate') || 'Last Visit Date'}
              avatarIcon='tabler-clock'
              avatarColor='success'
              chipText={
                lastVisit?.status
                  ? t(`patient.visitStatus.${lastVisit.status}`) || lastVisit.status
                  : t('patient.unknown')
              }
              chipColor={
                lastVisit?.status === 'completed'
                  ? 'success'
                  : lastVisit?.status === 'cancelled'
                    ? 'error'
                    : lastVisit?.status === 'scheduled'
                      ? 'info'
                      : 'secondary'
              }
              chipVariant='tonal'
            />
          </Grid>

          {/* BMI Status */}
          <Grid item xs={12} sm={6} md={4}>
            <CardStatsVertical
              stats={bmi || '-'}
              title={t('patient.bmi') || 'BMI'}
              subtitle={t('patient.bodyMassIndex') || 'Body Mass Index'}
              avatarIcon='tabler-weight'
              avatarColor={
                bmi
                  ? Number(bmi) < 18.5
                    ? 'warning'
                    : Number(bmi) < 25
                      ? 'success'
                      : Number(bmi) < 30
                        ? 'warning'
                        : 'error'
                  : 'secondary'
              }
              chipText={
                bmi
                  ? Number(bmi) < 18.5
                    ? t('patient.underweight') || 'Underweight'
                    : Number(bmi) < 25
                      ? t('patient.normal') || 'Normal'
                      : Number(bmi) < 30
                        ? t('patient.overweight') || 'Overweight'
                        : t('patient.obese') || 'Obese'
                  : '-'
              }
              chipColor={
                bmi
                  ? Number(bmi) < 18.5
                    ? 'warning'
                    : Number(bmi) < 25
                      ? 'success'
                      : Number(bmi) < 30
                        ? 'warning'
                        : 'error'
                  : 'secondary'
              }
              chipVariant='tonal'
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Vital Signs Row */}
      <Grid item xs={12}>
        <Grid container spacing={6}>
          {/* Blood Pressure */}
          <Grid item xs={12} sm={6} md={3}>
            <CardStatsHorizontal
              stats={
                latestMeasurements.blood_pressure_systolic && latestMeasurements.blood_pressure_diastolic
                  ? `${latestMeasurements.blood_pressure_systolic}/${latestMeasurements.blood_pressure_diastolic}`
                  : t('patient.noData')
              }
              title={t('patient.bloodPressure') || 'Blood Pressure'}
              avatarIcon='tabler-heartbeat'
              avatarColor='error'
              avatarSkin='light'
            />
          </Grid>

          {/* Weight */}
          <Grid item xs={12} sm={6} md={3}>
            <CardStatsHorizontal
              stats={latestMeasurements.weight_kg ? `${latestMeasurements.weight_kg} kg` : t('patient.noData')}
              title={t('patient.weight') || 'Weight'}
              avatarIcon='tabler-weight'
              avatarColor='primary'
              avatarSkin='light'
            />
          </Grid>

          {/* Height */}
          <Grid item xs={12} sm={6} md={3}>
            <CardStatsHorizontal
              stats={latestMeasurements.height_cm ? `${latestMeasurements.height_cm} cm` : t('patient.noData')}
              title={t('patient.height') || 'Height'}
              avatarIcon='tabler-ruler'
              avatarColor='info'
              avatarSkin='light'
            />
          </Grid>

          {/* Temperature */}
          <Grid item xs={12} sm={6} md={3}>
            <CardStatsHorizontal
              stats={latestMeasurements.temperature_c ? `${latestMeasurements.temperature_c}°C` : t('patient.noData')}
              title={t('patient.temperature') || 'Temperature'}
              avatarIcon='tabler-thermometer'
              avatarColor='warning'
              avatarSkin='light'
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Vital Signs Trend */}
      <Grid item xs={12} md={6}>
        <CardStatsWithAreaChart
          stats={t('patient.vitalSignsTrend') || 'Vital Signs Trend'}
          title={t('patient.last7Days') || 'Last 7 Days'}
          avatarIcon='tabler-chart-line'
          chartColor='primary'
          avatarColor='primary'
          avatarSkin='light'
          chartSeries={chartSeries}
        />
      </Grid>

      {/* Medical Alerts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mb-4 flex items-center gap-2'>
              <i className='tabler-alert-triangle text-xl text-primary' />
              {t('patient.medicalAlerts') || 'Medical Alerts'}
            </Typography>
            <Divider className='mb-4' />
            <Grid container spacing={3}>
              {/* Allergies */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant='subtitle2' color='text.secondary' className='mb-2'>
                    {t('patient.allergies') || 'Allergies'}
                  </Typography>
                  {patientData?.allergies?.length > 0 ? (
                    <Box className='flex flex-wrap gap-1'>
                      {patientData.allergies.map((allergy: string) => (
                        <HorizontalWithBorder
                          key={allergy}
                          title={allergy}
                          stats='Allergy'
                          avatarIcon='tabler-alert-circle'
                          color='error'
                          trendNumber={0}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      {t('patient.noAllergies') || 'No known allergies'}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Current Medications */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant='subtitle2' color='text.secondary' className='mb-2'>
                    {t('patient.currentMedications') || 'Current Medications'}
                  </Typography>
                  {activePrescriptions.length > 0 ? (
                    <Box className='flex flex-col gap-2'>
                      {activePrescriptions.map((prescription: any) => (
                        <HorizontalWithBorder
                          key={prescription.id}
                          title={prescription.medication_name}
                          stats={prescription.dosage || '-'}
                          avatarIcon='tabler-pill'
                          color='primary'
                          trendNumber={0}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      {t('patient.noActiveMedications') || 'No active medications'}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Existing Charts */}
      <Grid item xs={12}>
        <PatientMeasurementsChart patientId={patientData.id} dictionary={patientData.dictionary} />
      </Grid>
      <Grid item xs={12}>
        <PatientLabTests patientId={patientData.id} dictionary={patientData.dictionary} />
      </Grid>
    </Grid>
  )
}

export default OverViewTab
