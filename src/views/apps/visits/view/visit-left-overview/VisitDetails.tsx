'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'

import CustomAvatar from '@core/components/mui/Avatar'
import { useTranslation } from '@/contexts/translationContext'

const VisitDetails = ({ visitData }: { visitData: any }) => {
  const router = useRouter()
  const { t } = useTranslation()
  const patient = visitData.patient || {}
  const [invoice, setInvoice] = useState<any>(null)
  const [loadingInvoice, setLoadingInvoice] = useState(true)

  useEffect(() => {
    if (!visitData?.id) return
    setLoadingInvoice(true)
    fetch(`/api/apps/invoice?visitId=${visitData.id}`)
      .then(res => res.json())
      .then(data => {
        // If API returns an array, find the invoice for this visit
        if (Array.isArray(data)) {
          setInvoice(data.find((inv: any) => inv.visit_id === visitData.id) || null)
        } else if (data && data.visit_id === visitData.id) {
          setInvoice(data)
        } else {
          setInvoice(null)
        }

        setLoadingInvoice(false)
      })
      .catch(() => {
        setInvoice(null)
        setLoadingInvoice(false)
      })
  }, [visitData?.id])

  return (
    <Card>
      <CardContent className='flex flex-col items-center gap-6 pbs-12'>
        <CustomAvatar
          color={patient.gender === 'male' ? 'primary' : patient.gender === 'female' ? 'error' : 'info'}
          skin='filled'
          variant='rounded'
          size={120}
          sx={{
            '& i': {
              color: 'white',
              fontSize: '3rem'
            },
            ...(patient.gender === 'female' && {
              backgroundColor: '#FF69B4 !important', // Pink color
              '&:hover': {
                backgroundColor: '#FF69B4 !important'
              }
            })
          }}
        >
          {patient.gender === 'male' ? (
            <i className='tabler-user' />
          ) : patient.gender === 'female' ? (
            <i className='tabler-user-circle' />
          ) : (
            <i className='tabler-user' />
          )}
        </CustomAvatar>
        <Typography variant='h5' className='font-bold text-center'>
          {patient.name || '-'}
        </Typography>
        <Divider className='w-full' />

        {/* Personal Info */}
        <div className='w-full flex flex-col gap-2 mb-2'>
          <div className='flex items-center gap-2 mb-1'>
            <i className='tabler-user text-lg text-primary' />
            <Typography variant='subtitle1' className='font-semibold'>
              {t('form.sectionPersonalInfo')}
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
              {t('patient.birthdate')}
            </Typography>
            <Typography color='text.primary'>
              {patient.birthdate && !isNaN(new Date(patient.birthdate).getTime())
                ? new Date(patient.birthdate).toISOString().slice(0, 10)
                : '-'}
            </Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-gender-bigender text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t('patient.gender.label')}
            </Typography>
            <Typography color='text.primary'>{patient.gender || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-stethoscope text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t('form.doctor')}
            </Typography>
            <Typography color='text.primary'>{patient.doctor || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-flag text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t('form.status')}
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
              {t('form.sectionContactInfo')}
            </Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-phone text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t('patient.phone')}
            </Typography>
            <Typography color='text.primary'>{patient.phone_number || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-mail text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t('patient.email')}
            </Typography>
            <Typography color='text.primary'>{patient.email || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-home text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t('patient.address')}
            </Typography>
            <Typography color='text.primary'>{patient.address || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-building text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t('patient.city')}
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
              {t('form.sectionEmergencyContact')}
            </Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-user text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t('form.emergencyContactName')}
            </Typography>
            <Typography color='text.primary'>{patient.emergency_contact_name || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-phone text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t('form.emergencyContactPhone')}
            </Typography>
            <Typography color='text.primary'>{patient.emergency_contact_phone || '-'}</Typography>
          </div>
          <div className='flex items-center gap-2'>
            <i className='tabler-mail text-lg' />
            <Typography className='font-medium' color='text.secondary'>
              {t('form.emergencyContactEmail')}
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
          {t('patient.profile')}
        </Button>
      </div>
      {/* Invoice Button */}
      <div className='w-full flex justify-center pb-4'>
        {loadingInvoice ? null : invoice ? (
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => router.push(`/fr/apps/invoice/edit/${invoice.id}`)}
            disabled={!invoice.id}
          >
            {t('invoice.updateInvoice')}
          </Button>
        ) : (
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => router.push(`/fr/apps/invoice/add?visitId=${visitData?.id}`)}
            disabled={!visitData?.id}
          >
            {t('invoice.createInvoice')}
          </Button>
        )}
      </div>
    </Card>
  )
}

export default VisitDetails
