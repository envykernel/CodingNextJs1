'use client'

import React, { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import { useSession } from 'next-auth/react'

import { useTranslation } from '@/contexts/translationContext'
import { getSpecialties } from '@/utils/medicalSpecialties'

interface Doctor {
  id: number
  name: string
  specialty: string | null
  phone_number: string | null
  email: string | null
  status: string
  organisation_id: number
}

interface DoctorDrawerProps {
  open: boolean
  onClose: () => void
  doctor: Doctor | null
  onSave: () => void
  onResetFilters?: () => void
}

// Zod schema for doctor form
const doctorSchema = z.object({
  name: z.string().min(1, { message: 'form.validation.required' }),
  specialty: z.string().min(1, { message: 'form.validation.required' }),
  email: z.string().email({ message: 'form.validation.email.invalid' }).optional().or(z.literal('')),
  phone_number: z.string().optional().or(z.literal('')),
  status: z.enum(['enabled', 'disabled'], {
    required_error: 'form.validation.status.required',
    invalid_type_error: 'form.validation.status.required'
  })
})

type DoctorFormValues = z.infer<typeof doctorSchema>

export default function DoctorDrawer({ open, onClose, doctor, onSave, onResetFilters }: DoctorDrawerProps) {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const params = useParams()
  const lang = (params?.lang as string) || 'en' // Default to 'en' if params is null
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Get specialties from our JSON file
  const specialties = getSpecialties()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      specialty: '',
      email: '',
      phone_number: '',
      status: 'enabled'
    }
  })

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (open) {
      if (doctor) {
        reset({
          name: doctor.name,
          specialty: doctor.specialty || '',
          email: doctor.email || '',
          phone_number: doctor.phone_number || '',
          status: doctor.status as 'enabled' | 'disabled'
        })
      } else {
        reset({
          name: '',
          specialty: '',
          email: '',
          phone_number: '',
          status: 'enabled'
        })
      }
    }
  }, [open, doctor, reset])

  const handleClose = () => {
    setShowSuccess(false)
    setIsSubmitting(false)
    setFormError(null)
    reset({
      name: '',
      specialty: '',
      email: '',
      phone_number: '',
      status: 'enabled'
    })
    onClose()

    if (showSuccess && onResetFilters) {
      onResetFilters()
    }
  }

  const onSubmit = async (data: DoctorFormValues) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const url = doctor ? `/api/doctors/${doctor.id}` : '/api/doctors'
      const method = doctor ? 'PUT' : 'POST'

      // Explicitly specify which fields to send
      const formattedData = {
        name: data.name
          .trim()
          .replace(/^Dr\.\s*/i, '')
          .replace(/^dr\.\s*/i, ''),
        specialty: data.specialty,
        email: data.email || '',
        phone_number: data.phone_number || '',
        status: data.status,
        organisation_id: session?.user?.organisationId
      }

      console.log('Sending doctor data:', formattedData)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      })

      const responseData = await response.text()

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseData)

          if (errorData.errorKey) {
            setFormError(t(errorData.errorKey))
          } else {
            setFormError(responseData)
          }
        } catch {
          setFormError(responseData)
        }

        setIsSubmitting(false)

        return
      }

      // Show success message
      setShowSuccess(true)

      // Wait for 1.5 seconds to show the success message before closing
      setTimeout(() => {
        onSave()
        handleClose()
      }, 1500)
    } catch (error) {
      console.error('Error saving doctor:', error)
      setFormError(t('errorSavingDoctor') || 'Error saving doctor')
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Box sx={{ p: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h5'>{doctor ? t('doctors.editDoctor') : t('doctors.addDoctor')}</Typography>
          <IconButton size='small' onClick={handleClose}>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        {showSuccess && (
          <Alert
            severity='success'
            sx={{
              mb: 4,
              '& .MuiAlert-message': {
                fontSize: '0.875rem'
              }
            }}
          >
            {doctor ? t('doctors.doctorUpdated') : t('doctors.doctorAdded')}
          </Alert>
        )}

        {formError && (
          <Alert
            severity='error'
            sx={{
              mb: 4,
              '& .MuiAlert-message': {
                fontSize: '0.875rem'
              }
            }}
          >
            {formError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 2 }}>
            <Typography variant='caption' color='text.secondary'>
              {t('doctors.namePrefixHint')}
            </Typography>
          </Box>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('doctors.doctorName')}
                error={!!errors.name}
                helperText={
                  errors.name?.message && typeof errors.name.message === 'string' ? t(errors.name.message) : ''
                }
                sx={{ mb: 4 }}
                value={field.value.replace(/^Dr\.\s*/i, '')}
                onChange={e => field.onChange(e.target.value)}
              />
            )}
          />

          <Controller
            name='specialty'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.specialty} sx={{ mb: 4 }}>
                <InputLabel>{t('doctors.specialty')}</InputLabel>
                <Select {...field} label={t('doctors.specialty')}>
                  {specialties.map(specialty => (
                    <MenuItem key={specialty.id} value={specialty.id}>
                      {specialty.translations[lang as keyof typeof specialty.translations]}
                    </MenuItem>
                  ))}
                </Select>
                {errors.specialty && errors.specialty.message && typeof errors.specialty.message === 'string' && (
                  <Typography variant='caption' color='error' sx={{ mt: 1 }}>
                    {t(errors.specialty.message)}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('doctors.email')}
                error={!!errors.email}
                helperText={
                  errors.email?.message && typeof errors.email.message === 'string' ? t(errors.email.message) : ''
                }
                sx={{ mb: 4 }}
              />
            )}
          />

          <Controller
            name='phone_number'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('doctors.phoneNumber')}
                error={!!errors.phone_number}
                helperText={
                  errors.phone_number?.message && typeof errors.phone_number.message === 'string'
                    ? t(errors.phone_number.message)
                    : ''
                }
                sx={{ mb: 4 }}
              />
            )}
          />

          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.status} sx={{ mb: 4 }}>
                <InputLabel>{t('doctors.statusLabel')}</InputLabel>
                <Select {...field} label={t('doctors.statusLabel')}>
                  <MenuItem value='enabled'>{t('doctors.status.enabled')}</MenuItem>
                  <MenuItem value='disabled'>{t('doctors.status.disabled')}</MenuItem>
                </Select>
                {errors.status && errors.status.message && typeof errors.status.message === 'string' && (
                  <Typography variant='caption' color='error' sx={{ mt: 1 }}>
                    {t(errors.status.message)}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button variant='outlined' color='secondary' onClick={onClose}>
              {t('doctors.cancel')}
            </Button>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color='inherit' /> : null}
            >
              {isSubmitting ? t('common.saving') : doctor ? t('doctors.update') : t('doctors.save')}
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}
