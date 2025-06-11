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
import Grid2 from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { useState, useEffect } from 'react'

// Component Imports
import PatientLabTests from '../dashboard/PatientLabTests'
import PatientMeasurementsChart from '../dashboard/PatientMeasurementsChart'
import CardStatsVertical from '@/components/card-statistics/Vertical'
import CardStatsHorizontal from '@/components/card-statistics/Horizontal'
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

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

interface OverviewTabProps {
  patientData: any
  appointments: Array<{
    id: number
    appointment_date: string
    status: string
    doctor: {
      id: number
      name: string
      specialty: string | null
      email: string | null
      phone_number: string | null
    }
    visit?: {
      id: number
      status: string
    }
  }>
}

interface Measurement {
  id: number
  measured_at: string
  blood_pressure_systolic: number | null
  blood_pressure_diastolic: number | null
}

interface ProcessedMeasurement {
  date: string
  systolic: number
  diastolic: number
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  const d = new Date(dateString)
  return d.toISOString().slice(0, 10)
}

const OverviewTab = ({ patientData, appointments }: OverviewTabProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [recentMedicalHistory, setRecentMedicalHistory] = useState<any[]>([])
  const [activePrescriptions, setActivePrescriptions] = useState<any[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [lastVisit, setLastVisit] = useState<any>(null)
  const [vitalSignsTrend, setVitalSignsTrend] = useState<ProcessedMeasurement[]>([])
  const [allergies, setAllergies] = useState<any[]>([])

  const getTranslatedHistoryType = (type: string) => {
    return t(`medicalHistory.types.${type.toLowerCase().replace(' ', '_')}`) || type
  }

  // Fetch medical history and filter allergies
  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        if (!patientData?.id) {
          console.error('Missing patient ID:', patientData)
          return
        }

        const patientId = Number(patientData.id)
        if (isNaN(patientId)) {
          console.error('Invalid patient ID:', patientData.id)
          return
        }

        console.log('Fetching medical history for patient:', patientId)
        const response = await fetch(`/api/patient-medical-history?patientId=${patientId}`)

        if (!response.ok) {
          const errorData = await response.json()
          console.error('API Error:', errorData)
          throw new Error(errorData.error || 'Failed to fetch medical history')
        }

        const data = await response.json()
        console.log('Received medical history data:', data)

        // Filter allergies from medical history
        const allergyHistory = data.filter((item: any) => item.history_type === 'allergy')
        setAllergies(allergyHistory)

        // Get recent medical history (excluding allergies)
        const recentHistory = data
          .filter((item: any) => item.history_type !== 'allergy')
          .sort((a: any, b: any) => {
            const dateA = a.date_occurred ? new Date(a.date_occurred).getTime() : 0
            const dateB = b.date_occurred ? new Date(b.date_occurred).getTime() : 0
            return dateB - dateA
          })
          .slice(0, 3)
        setRecentMedicalHistory(recentHistory)
      } catch (error) {
        console.error('Error in fetchMedicalHistory:', error)
      }
    }

    fetchMedicalHistory()
  }, [patientData?.id])

  // Debug logs
  console.log('OverViewTab patientData:', patientData)
  console.log('Recent medical history:', recentMedicalHistory)
  console.log('Allergies:', allergies)

  // Get latest measurements
  const latestMeasurements = patientData?.patient_measurements?.[0] || {}
  const bmi = calculateBMI(latestMeasurements.weight_kg, latestMeasurements.height_cm)

  // Get last visit date - get the most recent visit regardless of status
  useEffect(() => {
    const fetchLastVisit = async () => {
      try {
        if (!patientData?.id) return

        const patientId = Number(patientData.id)
        if (isNaN(patientId)) return

        const response = await fetch(`/api/patient-visits?patientId=${patientId}&limit=1&status=completed`)
        if (!response.ok) {
          const errorData = await response.json()
          console.error('API Error:', errorData)
          throw new Error(errorData.error || 'Failed to fetch last visit')
        }

        const data = await response.json()
        console.log('Last visit data:', data)
        if (data.length > 0) {
          setLastVisit(data[0])
        }
      } catch (error) {
        console.error('Error in fetchLastVisit:', error)
      }
    }

    fetchLastVisit()
  }, [patientData?.id])

  // Fetch active prescriptions
  useEffect(() => {
    const fetchActivePrescriptions = async () => {
      try {
        if (!patientData?.id) return

        const patientId = Number(patientData.id)
        if (isNaN(patientId)) return

        const response = await fetch(`/api/prescriptions/patient/${patientId}`)
        if (!response.ok) {
          const errorData = await response.json()
          console.error('API Error:', errorData)
          throw new Error(errorData.error || 'Failed to fetch active prescriptions')
        }

        const data = await response.json()
        console.log('Active prescriptions data:', data)
        // Filter active prescriptions (those without an end date or with a future end date)
        const activePrescriptions = data
          .filter((prescription: any) => {
            const endDate = prescription.medications[0]?.duration
              ? new Date(prescription.medications[0].duration)
              : null
            return !endDate || endDate > new Date()
          })
          .slice(0, 3)
        setActivePrescriptions(activePrescriptions)
      } catch (error) {
        console.error('Error in fetchActivePrescriptions:', error)
      }
    }

    fetchActivePrescriptions()
  }, [patientData?.id])

  // Fetch upcoming appointments
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        if (!patientData?.id) return

        const patientId = Number(patientData.id)
        if (isNaN(patientId)) return

        // Use the appointments data passed as prop instead of making a new API call
        const upcomingAppointments = appointments
          .filter(
            appointment => appointment.status === 'scheduled' && new Date(appointment.appointment_date) > new Date()
          )
          .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
          .slice(0, 3)

        setUpcomingAppointments(upcomingAppointments)
      } catch (error) {
        console.error('Error in fetchUpcomingAppointments:', error)
      }
    }

    fetchUpcomingAppointments()
  }, [patientData?.id, appointments])

  // Fetch vital signs trend data
  useEffect(() => {
    const fetchVitalSignsTrend = async () => {
      try {
        if (!patientData?.id) return

        const response = await fetch(`/api/patient-measurements?patientId=${patientData.id}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('API Error:', errorData)
          throw new Error(errorData.error || 'Failed to fetch vital signs')
        }

        const data = await response.json()
        if (!Array.isArray(data)) {
          console.error('Invalid measurements data format:', data)
          throw new Error('Invalid measurements data format')
        }

        const processedData = data
          .filter((item: Measurement) => item.measured_at)
          .map(
            (item: Measurement): ProcessedMeasurement => ({
              date: formatDateConsistent(item.measured_at),
              systolic: item.blood_pressure_systolic || 0,
              diastolic: item.blood_pressure_diastolic || 0
            })
          )
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        setVitalSignsTrend(processedData)
      } catch (error) {
        console.error('Error in fetchVitalSignsTrend:', error)
        setVitalSignsTrend([])
      }
    }

    fetchVitalSignsTrend()
  }, [patientData?.id])

  return (
    <Grid container spacing={6}>
      {/* Quick Stats Row */}
      <Grid item xs={12}>
        <Grid container spacing={6}>
          {/* Upcoming Appointments */}
          <Grid item xs={12} sm={6} md={4}>
            <CardStatsVertical
              stats={upcomingAppointments.length > 0 ? upcomingAppointments.length.toString() : t('patient.noData')}
              title={t('patient.upcomingAppointments') || 'Upcoming Appointments'}
              subtitle={t('patient.scheduledVisits') || 'Scheduled Visits'}
              avatarIcon='tabler-calendar-event'
              avatarColor='info'
              chipText={upcomingAppointments.length > 0 ? t('patient.scheduled') || 'Scheduled' : t('patient.noData')}
              chipColor='info'
              chipVariant='tonal'
            />
          </Grid>

          {/* Last Visit */}
          <Grid item xs={12} sm={6} md={4}>
            <CardStatsVertical
              stats={lastVisit?.visit_date ? formatDateConsistent(lastVisit.visit_date) : t('patient.noData')}
              title={t('patient.lastVisit') || 'Last Visit'}
              subtitle={t('patient.lastVisitDate') || 'Last Visit Date'}
              avatarIcon='tabler-clock'
              avatarColor='success'
              chipText={
                lastVisit?.status
                  ? t(`patient.visitStatus.${lastVisit.status}`) || lastVisit.status
                  : t('patient.noData')
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
              stats={bmi ? bmi.toString() : t('patient.noData')}
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
                  : t('patient.noData')
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

      {/* Medical Alerts Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-3 mb-4'>
              <i className='tabler-alert-triangle text-xl text-warning' />
              <Typography variant='h6'>{t('patientView.overview.medicalAlerts.title')}</Typography>
            </div>
            <Divider className='mb-4' />
            <Grid container spacing={4}>
              {/* Allergies */}
              <Grid item xs={12} md={6}>
                <div className='bg-error/5 p-4 rounded-lg border border-error/20'>
                  <div className='flex items-center gap-2 mb-2'>
                    <i className='tabler-allergens text-lg text-error' />
                    <Typography variant='subtitle1' className='font-medium text-error'>
                      {t('patientView.overview.medicalAlerts.allergies')}
                    </Typography>
                  </div>
                  {allergies.length === 0 ? (
                    <Typography color='text.secondary' className='italic'>
                      {t('patientView.overview.medicalAlerts.noAllergies')}
                    </Typography>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {allergies.map((allergy: any) => (
                        <Chip
                          key={allergy.id}
                          label={allergy.description}
                          color='error'
                          variant='outlined'
                          className='border-error/30'
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Grid>

              {/* Medical History Alerts */}
              <Grid item xs={12} md={6}>
                <div className='bg-warning/5 p-4 rounded-lg border border-warning/20'>
                  <div className='flex items-center gap-2 mb-2'>
                    <i className='tabler-notes text-lg text-warning' />
                    <Typography variant='subtitle1' className='font-medium text-warning'>
                      {t('patientView.overview.medicalAlerts.recentMedicalHistory')}
                    </Typography>
                  </div>
                  {recentMedicalHistory.length === 0 ? (
                    <Typography color='text.secondary' className='italic'>
                      {t('patientView.overview.medicalAlerts.noMedicalHistory')}
                    </Typography>
                  ) : (
                    <div className='space-y-2'>
                      {recentMedicalHistory.map((history: any) => (
                        <div key={history.id} className='flex items-start gap-2'>
                          <i className='tabler-circle-dot text-warning mt-1' />
                          <div>
                            <Typography variant='body2' className='font-medium'>
                              {getTranslatedHistoryType(history.history_type)}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {history.description}
                            </Typography>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

export default OverviewTab
