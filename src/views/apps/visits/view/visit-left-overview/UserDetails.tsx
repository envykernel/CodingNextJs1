'use client'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'

import CustomAvatar from '@core/components/mui/Avatar'
import { useTranslation } from '@/contexts/translationContext'

const UserDetails = ({ visitData }: { visitData: any }) => {
  const t = useTranslation()
  const router = useRouter()
  const patient = visitData.patient || {}

  return (
    <Card>
      <CardContent className='flex flex-col items-center gap-6 pbs-12'>
        <CustomAvatar alt='user-profile' src={patient.avatar || '/images/avatars/1.png'} variant='rounded' size={120} />
        <Typography variant='h5' className='font-bold text-center'>
          {patient.name || '-'}
        </Typography>
        <Divider className='w-full' />

        {/* Personal Info */}
        <div className='w-full flex flex-col gap-2 mb-2'>
          <div className='flex items-center gap-2 mb-1'>
            <i className='tabler-user text-lg text-primary' />
            <Typography variant='subtitle1' className='font-semibold'>
              {t.form?.personalInfo || 'Personal Info'}
            </Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-id text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              ID
            </Typography>
            <Typography color='text.primary'>{patient.id || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-cake text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t.patient?.birthdate}
            </Typography>
            <Typography color='text.primary'>
              {patient.birthdate ? new Date(patient.birthdate).toISOString().slice(0, 10) : '-'}
            </Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-gender-bigender text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t.patient?.gender}
            </Typography>
            <Typography color='text.primary'>{patient.gender || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-stethoscope text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t.form?.doctor || 'Doctor'}
            </Typography>
            <Typography color='text.primary'>{patient.doctor || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-flag text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t.form?.status || 'Status'}
            </Typography>
            <Typography color='text.primary'>{patient.status || '-'}</Typography>
          </div>
        </div>

        <Divider className='w-full' />
        {/* Contact Info */}
        <div className='w-full flex flex-col gap-2 mb-2'>
          <div className='flex items-center gap-2 mb-1'>
            <i className='tabler-phone text-lg text-primary' />
            <Typography variant='subtitle1' className='font-semibold'>
              {t.form?.contactInfo || 'Contact Info'}
            </Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-phone text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t.patient?.phone}
            </Typography>
            <Typography color='text.primary'>{patient.phone_number || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-mail text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t.patient?.email}
            </Typography>
            <Typography color='text.primary'>{patient.email || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-home text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t.patient?.address}
            </Typography>
            <Typography color='text.primary'>{patient.address || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-building text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t.patient?.city}
            </Typography>
            <Typography color='text.primary'>{patient.city || '-'}</Typography>
          </div>
        </div>

        <Divider className='w-full' />
        {/* Emergency Contact */}
        <div className='w-full flex flex-col gap-2'>
          <div className='flex items-center gap-2 mb-1'>
            <i className='tabler-alert-triangle text-lg text-primary' />
            <Typography variant='subtitle1' className='font-semibold'>
              {t.form?.emergencyContact || 'Emergency Contact'}
            </Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-user text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t.form?.emergencyContactName || 'Name'}
            </Typography>
            <Typography color='text.primary'>{patient.emergency_contact_name || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-phone text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t.form?.emergencyContactPhone || 'Phone'}
            </Typography>
            <Typography color='text.primary'>{patient.emergency_contact_phone || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-mail text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t.form?.emergencyContactEmail || 'Email'}
            </Typography>
            <Typography color='text.primary'>{patient.emergency_contact_email || '-'}</Typography>
          </div>
        </div>
      </CardContent>
      <Divider className='w-full my-4' />
      <div className='w-full flex justify-center pb-4'>
        <Button
          variant='contained'
          color='primary'
          onClick={() => router.push(`/fr/apps/patient/view/${patient.id}`)}
          disabled={!patient.id}
        >
          {t.patient?.label || 'Patient Profile'}
        </Button>
      </div>
    </Card>
  )
}

export default UserDetails
