'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

import { useTranslation } from '@/contexts/translationContext'

// Component Imports
import UserActivityTimeLine from './UserActivityTimeline'

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

interface OverViewTabProps {
  patientData: any
}

// Patient status color mapping (same as PatientListTable)
const patientStatusObj: { [key: string]: 'success' | 'secondary' | 'error' | 'warning' | 'default' } = {
  admitted: 'success',
  critical: 'error',
  discharged: 'default',
  underObservation: 'warning',
  enabled: 'success',
  disabled: 'secondary',
  blocked: 'error',
  pending: 'warning',
  unknown: 'secondary'
}

// Helper for SSR-safe date formatting
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'

  return new Date(dateString).toISOString().slice(0, 10)
}

const OverViewTab = ({ patientData }: OverViewTabProps) => {
  const t = useTranslation()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-3 mb-4'>
              <i className='tabler-user text-xl text-primary' />
              <Typography variant='h6'>Personal Info</Typography>
            </div>
            <Divider className='mb-4' />
            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-2'>
                <i className='tabler-id text-lg' />
                <Typography>
                  <b>ID:</b> {patientData.id}
                </Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-user text-lg' />
                <Typography>
                  <b>Name:</b> {patientData.name}
                </Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-cake text-lg' />
                <Typography>
                  <b>Birthdate:</b> {patientData.birthdate ? formatDate(patientData.birthdate) : '-'}
                </Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-gender-bigender text-lg' />
                <Typography>
                  <b>Gender:</b> {patientData.gender}
                </Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-stethoscope text-lg' />
                <Typography>
                  <b>Doctor:</b>{' '}
                  {typeof patientData.doctor === 'object' && patientData.doctor
                    ? patientData.doctor.name
                    : patientData.doctor || '-'}
                </Typography>
              </div>
              <div className='flex items-center gap-2'>
                <Chip
                  label={t.form[patientData?.status || 'unknown'] || '-'}
                  color={patientStatusObj[String(patientData?.status || 'unknown')]}
                  variant='tonal'
                  size='small'
                  className='capitalize'
                />
                <Typography>
                  <b>Status</b>
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-3 mb-4'>
              <i className='tabler-home text-xl text-primary' />
              <Typography variant='h6'>Contact Info</Typography>
            </div>
            <Divider className='mb-4' />
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1 flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <i className='tabler-phone text-lg' />
                  <Typography>
                    <b>Phone:</b> {patientData.phone_number || '-'}
                  </Typography>
                </div>
                <div className='flex items-center gap-2'>
                  <i className='tabler-mail text-lg' />
                  <Typography>
                    <b>Email:</b> {patientData.email || '-'}
                  </Typography>
                </div>
              </div>
              <div className='flex-1 flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <i className='tabler-home text-lg' />
                  <Typography>
                    <b>Address:</b> {patientData.address || '-'}
                  </Typography>
                </div>
                <div className='flex items-center gap-2'>
                  <i className='tabler-building text-lg' />
                  <Typography>
                    <b>City:</b> {patientData.city || '-'}
                  </Typography>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-3 mb-4'>
              <i className='tabler-alert-triangle text-xl text-primary' />
              <Typography variant='h6'>Emergency Contact</Typography>
            </div>
            <Divider className='mb-4' />
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1 flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <i className='tabler-user text-lg' />
                  <Typography>
                    <b>Name:</b> {patientData.emergency_contact_name || '-'}
                  </Typography>
                </div>
                <div className='flex items-center gap-2'>
                  <i className='tabler-phone text-lg' />
                  <Typography>
                    <b>Phone:</b> {patientData.emergency_contact_phone || '-'}
                  </Typography>
                </div>
              </div>
              <div className='flex-1 flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <i className='tabler-mail text-lg' />
                  <Typography>
                    <b>Email:</b> {patientData.emergency_contact_email || '-'}
                  </Typography>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-3 mb-4'>
              <i className='tabler-calendar-event text-xl text-primary' />
              <Typography variant='h6'>Meta Info</Typography>
            </div>
            <Divider className='mb-4' />
            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-2'>
                <i className='tabler-calendar-event text-lg' />
                <Typography>
                  <b>Created At:</b> {patientData.created_at ? formatDate(patientData.created_at) : '-'}
                </Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-refresh text-lg' />
                <Typography>
                  <b>Updated At:</b> {patientData.updated_at ? formatDate(patientData.updated_at) : '-'}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <UserActivityTimeLine />
      </Grid>
    </Grid>
  )
}

export default OverViewTab
