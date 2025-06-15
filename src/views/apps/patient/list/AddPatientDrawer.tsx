// React Imports
// import { useState } from 'react'
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'

import { useTranslation } from '@/contexts/translationContext'

// Types Imports
// import type { UsersType } from '@/types/apps/userTypes'
import type { PatientType } from './PatientListTable'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  handleClose: () => void
  patientData?: PatientType[]
  setData?: (data: PatientType[]) => void
  onPatientCreated?: (patient: PatientType) => void
  onPatientUpdated?: (patient: PatientType) => void
  editMode?: boolean
  editPatient?: PatientType
}

type FormValidateType = {
  name: string
  phone_number: string
  gender: string
  status: string
  birthdate: string
  doctor?: string
  avatar?: string
  address?: string
  city?: string
  email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_email?: string
}

const PatientDrawer = ({
  open,
  handleClose,
  patientData,
  setData,
  onPatientCreated,
  onPatientUpdated,
  editMode,
  editPatient
}: Props) => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [doctors, setDoctors] = useState<{ id: string | number; name: string }[]>([])

  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({
    type: null,
    message: ''
  })

  // Fetch doctors when drawer opens
  useEffect(() => {
    if (open) {
      fetch('/api/doctors')
        .then(res => res.json())
        .then(data => setDoctors(data.map((d: any) => ({ id: String(d.id), name: d.name }))))
        .catch(() => setDoctors([]))
    }
  }, [open])

  // Create schema inside component to access translations
  const patientSchema = z.object({
    name: z
      .string()
      .min(1, t('form.validation.required'))
      .min(4, t('form.validation.name.minLength'))
      .regex(/^[a-zA-Z\s-']+$/, t('form.validation.name.invalidCharacters')),
    phone_number: z
      .string()
      .min(1, t('form.validation.required'))
      .regex(/^(?:(?:\+|00)212|0)[5-7]\d{8}$/, t('form.validation.phone.invalidFormat')),
    gender: z.string().min(1, t('form.validation.required')),
    status: z.string().min(1, t('form.validation.required')),
    birthdate: z.coerce.date({
      required_error: t('form.validation.required'),
      invalid_type_error: t('form.validation.birthdate.invalid')
    }),
    doctor: z.string().min(1, t('form.validation.required')),
    avatar: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    email: z.string().email(t('form.validation.email.invalid')).optional().or(z.literal('')),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z
      .string()
      .regex(/^(?:(?:\+|00)212|0)[5-7]\d{8}$/, t('form.validation.phone.invalidFormat'))
      .optional()
      .or(z.literal('')),
    emergency_contact_email: z.string().email(t('form.validation.email.invalid')).optional().or(z.literal(''))
  })

  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: editMode && editPatient ? editPatient.name : '',
      birthdate: editMode && editPatient ? new Date(editPatient.birthdate).toISOString().split('T')[0] : '',
      gender: editMode && editPatient ? editPatient.gender : '',
      doctor:
        editMode && editPatient?.doctor
          ? typeof editPatient.doctor === 'string'
            ? editPatient.doctor
            : editPatient.doctor.name
          : '',
      status: editMode && editPatient ? editPatient.status : 'enabled',
      avatar: editMode && editPatient ? editPatient.avatar : '',
      address: editMode && editPatient ? editPatient.address : '',
      city: editMode && editPatient ? editPatient.city : '',
      phone_number: editMode && editPatient ? editPatient.phone_number : '',
      email: editMode && editPatient ? editPatient.email : '',
      emergency_contact_name: editMode && editPatient ? editPatient.emergency_contact_name : '',
      emergency_contact_phone: editMode && editPatient ? editPatient.emergency_contact_phone : '',
      emergency_contact_email: editMode && editPatient ? editPatient.emergency_contact_email : ''
    }
  })

  // Reset form when drawer opens or editPatient changes
  useEffect(() => {
    if (open) {
      // Reset form status when drawer opens
      setFormStatus({ type: null, message: '' })

      // Get the doctor name from the editPatient data
      const editDoctor =
        editMode && editPatient?.doctor
          ? typeof editPatient.doctor === 'string'
            ? editPatient.doctor
            : editPatient.doctor.name
          : ''

      // Get the gender from editPatient data
      const editGender = editMode && editPatient?.gender ? editPatient.gender : ''

      reset({
        name: editMode && editPatient ? editPatient.name : '',
        birthdate: editMode && editPatient ? new Date(editPatient.birthdate).toISOString().split('T')[0] : '',
        gender: editGender,
        doctor: editDoctor,
        status: editMode && editPatient ? editPatient.status : 'enabled',
        avatar: editMode && editPatient ? editPatient.avatar : '',
        address: editMode && editPatient ? editPatient.address : '',
        city: editMode && editPatient ? editPatient.city : '',
        phone_number: editMode && editPatient ? editPatient.phone_number : '',
        email: editMode && editPatient ? editPatient.email : '',
        emergency_contact_name: editMode && editPatient ? editPatient.emergency_contact_name : '',
        emergency_contact_phone: editMode && editPatient ? editPatient.emergency_contact_phone : '',
        emergency_contact_email: editMode && editPatient ? editPatient.emergency_contact_email : ''
      })
    } else {
      // Reset form status when drawer closes
      setFormStatus({ type: null, message: '' })
    }
  }, [open, editMode, editPatient, reset])

  const onSubmit = async (data: FormValidateType) => {
    try {
      setFormStatus({ type: null, message: '' })

      const payload = {
        ...data,
        organisation_id: session?.user?.organisationId ? Number(session.user.organisationId) : undefined
      }

      if (editMode && editPatient) {
        // Update existing patient
        const res = await fetch(`/api/patient/${editPatient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const result = await res.json()

        if (result && result.success) {
          if (onPatientUpdated) {
            onPatientUpdated(mapNullToUndefined(result.patient))
          }

          setFormStatus({
            type: 'success',
            message: t('messages.patientUpdated')
          })

          // Reset form and close drawer after a short delay to show the success message
          setTimeout(() => {
            reset() // Reset form to default values
            handleClose()
          }, 1500)
        } else {
          setFormStatus({
            type: 'error',
            message: result?.message || t('messages.error')
          })
        }
      } else {
        // Create new patient
        const res = await fetch('/api/patient', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const result = await res.json()

        if (result && result.success) {
          if (setData && patientData) {
            setData([mapNullToUndefined(result.patient), ...patientData])
          }

          if (onPatientCreated) {
            onPatientCreated(mapNullToUndefined(result.patient))
          }

          setFormStatus({
            type: 'success',
            message: t('messages.patientCreated')
          })

          // Reset form and close drawer after a short delay to show the success message
          setTimeout(() => {
            reset() // Reset form to default values
            handleClose()
          }, 1500)
        } else {
          setFormStatus({
            type: 'error',
            message: result?.message || t('messages.error')
          })
        }
      }
    } catch (error) {
      console.error('Network or server error:', error)
      setFormStatus({
        type: 'error',
        message: t('messages.error')
      })
    }
  }

  const handleReset = () => {
    setFormStatus({ type: null, message: '' }) // Reset form status
    reset() // Reset form to default values
    handleClose()
  }

  function mapNullToUndefined(patient: any) {
    const fields = [
      'doctor',
      'status',
      'avatar',
      'address',
      'city',
      'phone_number',
      'email',
      'emergency_contact_name',
      'emergency_contact_phone',
      'emergency_contact_email',
      'created_at',
      'updated_at'
    ]

    const mapped = { ...patient }

    for (const key of fields) {
      if (mapped[key] === null) mapped[key] = undefined
    }

    return mapped
  }

  return (
    <>
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={handleReset}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100vw', sm: '50vw', md: '50vw' } } }}
      >
        <div className='flex items-center justify-between plb-5 pli-6'>
          <Typography variant='h5'>{editMode ? t('navigation.editPatient') : t('navigation.addNewPatient')}</Typography>
          <IconButton size='small' onClick={handleReset}>
            <i className='tabler-x text-2xl text-textPrimary' />
          </IconButton>
        </div>
        <Divider />
        <div className='p-4 md:p-8'>
          <form onSubmit={handleSubmit(data => onSubmit(data))}>
            {/* Personal Information Section */}
            <Typography variant='subtitle1' className='mb-2 font-medium'>
              {t('form.sectionPersonalInfo')}
            </Typography>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6'>
              <Controller
                name='name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('form.name')}
                    placeholder={t('form.namePlaceholder')}
                    error={!!errors.name}
                    helperText={
                      errors.name?.type === 'too_small' && field.value.length > 0
                        ? t('form.validation.name.minLength')
                        : errors.name?.type === 'invalid_string'
                          ? t('form.validation.name.invalidCharacters')
                          : errors.name?.message
                    }
                  />
                )}
              />
              <Controller
                name='birthdate'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    type='date'
                    fullWidth
                    label={t('form.birthdate')}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.birthdate}
                    helperText={errors.birthdate ? t('form.required') : ''}
                  />
                )}
              />
              <Controller
                name='gender'
                control={control}
                render={({ field }) => {
                  const normalizedGender = field.value
                    ? field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase()
                    : ''

                  return (
                    <CustomTextField
                      select
                      fullWidth
                      label={t('form.gender')}
                      error={!!errors.gender}
                      helperText={errors.gender ? t('form.required') : ''}
                      value={normalizedGender}
                      onChange={e => field.onChange(e.target.value.toLowerCase())}
                    >
                      <MenuItem value=''>{t('form.selectGender')}</MenuItem>
                      <MenuItem value='Male'>{t('form.male')}</MenuItem>
                      <MenuItem value='Female'>{t('form.female')}</MenuItem>
                      <MenuItem value='Other'>{t('form.other')}</MenuItem>
                    </CustomTextField>
                  )
                }}
              />
              <Controller
                name='doctor'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={t('form.doctor')}
                    error={!!errors.doctor}
                    helperText={!!errors.doctor ? t('form.required') : ''}
                    {...field}
                    value={field.value || ''}
                  >
                    <MenuItem value=''>{t('form.selectDoctor')}</MenuItem>
                    {doctors &&
                      doctors.map(opt => (
                        <MenuItem key={opt.id} value={opt.name}>
                          {opt.name}
                        </MenuItem>
                      ))}
                  </CustomTextField>
                )}
              />
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={t('form.status')}
                    error={!!errors.status}
                    helperText={errors.status ? t('form.required') : ''}
                    {...field}
                  >
                    <MenuItem value='enabled'>{t('form.enabled')}</MenuItem>
                    <MenuItem value='disabled'>{t('form.disabled')}</MenuItem>
                    <MenuItem value='blocked'>{t('form.blocked')}</MenuItem>
                    <MenuItem value='pending'>{t('form.pending')}</MenuItem>
                  </CustomTextField>
                )}
              />
              <Controller
                name='avatar'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('form.avatar')}
                    placeholder={t('form.avatarPlaceholder')}
                  />
                )}
              />
            </div>
            <Divider className='my-6 border-dashed' />

            {/* Contact Information Section */}
            <Typography variant='subtitle1' className='mb-2 font-medium'>
              {t('form.sectionContactInfo')}
            </Typography>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6'>
              <Controller
                name='address'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('form.address')}
                    placeholder={t('form.addressPlaceholder')}
                  />
                )}
              />
              <Controller
                name='city'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('form.city')}
                    placeholder={t('form.cityPlaceholder')}
                  />
                )}
              />
              <Controller
                name='phone_number'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('form.phoneNumber')}
                    placeholder={t('form.phoneNumberPlaceholder')}
                    error={!!errors.phone_number}
                    helperText={
                      errors.phone_number?.type === 'too_small'
                        ? t('form.required')
                        : errors.phone_number?.type === 'invalid_string'
                          ? t('form.validation.phone.invalidFormat')
                          : errors.phone_number?.message
                    }
                  />
                )}
              />
              <Controller
                name='email'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    type='email'
                    fullWidth
                    label={t('form.email')}
                    placeholder={t('form.emailPlaceholder')}
                  />
                )}
              />
            </div>
            <Divider className='my-6 border-dashed' />

            {/* Emergency Contact Section */}
            <Typography variant='subtitle1' className='mb-2 font-medium'>
              {t('form.sectionEmergencyContact')}
            </Typography>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6'>
              <Controller
                name='emergency_contact_name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('form.emergencyContactName')}
                    placeholder={t('form.emergencyContactNamePlaceholder')}
                  />
                )}
              />
              <Controller
                name='emergency_contact_phone'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('form.emergencyContactPhone')}
                    placeholder={t('form.emergencyContactPhonePlaceholder')}
                  />
                )}
              />
              <Controller
                name='emergency_contact_email'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    type='email'
                    fullWidth
                    label={t('form.emergencyContactEmail')}
                    placeholder={t('form.emergencyContactEmailPlaceholder')}
                  />
                )}
              />
            </div>
            <div className='flex items-center gap-4 md:col-span-2 mt-8'>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Button variant='contained' type='submit'>
                  {editMode ? t('navigation.save') : t('navigation.create')}
                </Button>
                <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
                  {t('navigation.cancel')}
                </Button>
                {formStatus.type && (
                  <Alert
                    severity={formStatus.type}
                    sx={{
                      flex: 1,
                      '& .MuiAlert-message': {
                        fontSize: '0.875rem'
                      }
                    }}
                  >
                    {formStatus.message}
                  </Alert>
                )}
              </Box>
            </div>
          </form>
        </div>
      </Drawer>
    </>
  )
}

export default PatientDrawer
