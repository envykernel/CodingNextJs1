'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

import CustomAvatar from '@core/components/mui/Avatar'
import { useTranslation } from '@/contexts/translationContext'

// Component Imports
import EditPatientDrawer from './EditPatientDrawer'

// Vars
interface UserDetailsProps {
  patientData: any
  onPatientUpdated?: (patient: any) => void
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

const UserDetails = ({ patientData, onPatientUpdated }: UserDetailsProps) => {
  const { t } = useTranslation()
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)

  const handleEditClick = () => {
    setEditDrawerOpen(true)
  }

  const handleEditClose = () => {
    setEditDrawerOpen(false)
  }

  const handlePatientUpdate = async (updatedPatient: any) => {
    if (onPatientUpdated) {
      await onPatientUpdated(updatedPatient)
    }

    setEditDrawerOpen(false)
  }

  return (
    <>
      <Card>
        <CardContent className='flex flex-col items-center gap-3 pbs-12'>
          <CustomAvatar
            color={patientData?.gender === 'male' ? 'primary' : patientData?.gender === 'female' ? 'error' : 'info'}
            skin='filled'
            variant='rounded'
            size={120}
            sx={{
              '& i': {
                color: 'white',
                fontSize: '3rem'
              },
              ...(patientData?.gender === 'female' && {
                backgroundColor: '#FF69B4 !important', // Pink color
                '&:hover': {
                  backgroundColor: '#FF69B4 !important'
                }
              })
            }}
          >
            {patientData?.gender === 'male' ? (
              <i className='tabler-user' />
            ) : patientData?.gender === 'female' ? (
              <i className='tabler-user-circle' />
            ) : (
              <i className='tabler-user' />
            )}
          </CustomAvatar>
          <div className='flex flex-col items-center gap-1'>
            <Typography variant='h5' className='font-bold text-center'>
              {patientData?.name || '-'}
            </Typography>
            <Chip
              label={t(`form.${patientData?.status || 'unknown'}`) || '-'}
              color={patientStatusObj[String(patientData?.status || 'unknown')]}
              variant='outlined'
              className='capitalize font-medium'
              sx={{
                borderWidth: 2,
                '& .MuiChip-label': {
                  px: 2,
                  fontSize: '0.875rem'
                },
                ...(patientData?.status === 'enabled' && {
                  borderColor: 'success.main',
                  color: 'success.main',
                  '&:hover': {
                    backgroundColor: 'success.main',
                    color: 'white'
                  }
                }),
                ...(patientData?.status === 'disabled' && {
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'white'
                  }
                }),
                ...(patientData?.status === 'blocked' && {
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.main',
                    color: 'white'
                  }
                }),
                ...(patientData?.status === 'pending' && {
                  borderColor: 'warning.main',
                  color: 'warning.main',
                  '&:hover': {
                    backgroundColor: 'warning.main',
                    color: 'white'
                  }
                })
              }}
            />
          </div>
          <Divider className='w-full' />

          {/* Personal Information Section */}
          <div className='w-full'>
            <Typography variant='subtitle1' className='mb-3 font-medium flex items-center gap-2'>
              <i className='tabler-user text-xl text-primary' />
              {t('patient.profile') || 'Patient Profile'}
            </Typography>
            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-2'>
                <i className='tabler-cake text-lg text-textSecondary' />
                <Typography className='font-medium' color='text.secondary'>
                  {t('form.birthdate') || 'Birthdate'}
                </Typography>
                <Typography color='text.primary'>
                  {patientData?.birthdate ? formatDate(patientData.birthdate) : '-'}
                </Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-gender-bigender text-lg text-textSecondary' />
                <Typography className='font-medium' color='text.secondary'>
                  {t('form.gender') || 'Gender'}
                </Typography>
                <Typography color='text.primary'>{patientData?.gender || '-'}</Typography>
              </div>
            </div>
          </div>

          <Divider className='w-full' />

          {/* Contact Information Section */}
          <div className='w-full'>
            <Typography variant='subtitle1' className='mb-3 font-medium flex items-center gap-2'>
              <i className='tabler-address-book text-xl text-primary' />
              {t('patient.information') || 'Patient Information'}
            </Typography>
            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-2'>
                <i className='tabler-phone text-lg text-textSecondary' />
                <Typography className='font-medium' color='text.secondary'>
                  {t('form.phoneNumber') || 'Phone Number'}
                </Typography>
                <Typography color='text.primary'>{patientData?.phone_number || '-'}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-mail text-lg text-textSecondary' />
                <Typography className='font-medium' color='text.secondary'>
                  {t('form.email') || 'Email'}
                </Typography>
                <Typography color='text.primary'>{patientData?.email || '-'}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-home text-lg text-textSecondary' />
                <Typography className='font-medium' color='text.secondary'>
                  {t('form.address') || 'Address'}
                </Typography>
                <Typography color='text.primary'>{patientData?.address || '-'}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-building text-lg text-textSecondary' />
                <Typography className='font-medium' color='text.secondary'>
                  {t('form.city') || 'City'}
                </Typography>
                <Typography color='text.primary'>{patientData?.city || '-'}</Typography>
              </div>
            </div>
          </div>

          <Divider className='w-full' />

          {/* Emergency Contact Section */}
          <div className='w-full'>
            <Typography variant='subtitle1' className='mb-3 font-medium flex items-center gap-2'>
              <i className='tabler-alert-triangle text-xl text-primary' />
              {t('patient.emergencyContact') || 'Emergency Contact'}
            </Typography>
            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-2'>
                <i className='tabler-user text-lg text-textSecondary' />
                <Typography color='text.primary'>{patientData?.emergency_contact_name || '-'}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-phone text-lg text-textSecondary' />
                <Typography color='text.primary'>{patientData?.emergency_contact_phone || '-'}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-mail text-lg text-textSecondary' />
                <Typography color='text.primary'>{patientData?.emergency_contact_email || '-'}</Typography>
              </div>
            </div>
          </div>

          <Button variant='contained' onClick={handleEditClick} className='mt-4'>
            {t('navigation.edit') || 'Edit'}
          </Button>
        </CardContent>
      </Card>
      <EditPatientDrawer
        open={editDrawerOpen}
        onClose={handleEditClose}
        patientData={patientData}
        onPatientUpdated={handlePatientUpdate}
      />
    </>
  )
}

export default UserDetails
