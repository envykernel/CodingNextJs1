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

// Zod schema for validation
const patientSchema = z.object({
  name: z.string().min(1, 'required'),
  phone_number: z.string().min(1, 'required'),
  gender: z.string().min(1, 'required'),
  status: z.string().min(1, 'required'),
  birthdate: z.coerce.date({ required_error: 'required', invalid_type_error: 'required' }),
  doctor: z.string().optional(),
  avatar: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  email: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_email: z.string().optional()
})

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
  const dictionary = useTranslation()
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

  // Add debug logs when editPatient changes
  useEffect(() => {
    console.log('EditPatient changed:', {
      editMode,
      editPatient,
      gender: editPatient?.gender,
      fullPatient: editPatient
    })
  }, [editMode, editPatient])

  // Reset form when drawer opens or editPatient changes
  useEffect(() => {
    if (open) {
      // Get the doctor name from the editPatient data
      const editDoctor =
        editMode && editPatient?.doctor
          ? typeof editPatient.doctor === 'string'
            ? editPatient.doctor
            : editPatient.doctor.name
          : ''

      // Get the gender from editPatient data
      const editGender = editMode && editPatient?.gender ? editPatient.gender : ''

      console.log('Resetting form with values:', {
        editMode,
        editPatientGender: editPatient?.gender,
        editGender,
        fullPatient: editPatient
      })

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
            message: dictionary.messages?.patientUpdated || 'Patient updated successfully'
          })

          // Close drawer after a short delay to show the success message
          setTimeout(() => {
            handleClose()
          }, 1500)
        } else {
          setFormStatus({
            type: 'error',
            message: result?.message || dictionary.messages?.error || 'An error occurred'
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
            message: dictionary.messages?.patientCreated || 'Patient created successfully'
          })

          // Close drawer after a short delay to show the success message
          setTimeout(() => {
            handleClose()
          }, 1500)
        } else {
          setFormStatus({
            type: 'error',
            message: result?.message || dictionary.messages?.error || 'An error occurred'
          })
        }
      }
    } catch (error) {
      console.error('Network or server error:', error)
      setFormStatus({
        type: 'error',
        message: dictionary.messages?.error || 'An error occurred'
      })
    }
  }

  const handleReset = () => {
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
          <Typography variant='h5'>
            {editMode ? dictionary.navigation.editPatient : dictionary.navigation.addNewPatient}
          </Typography>
          <IconButton size='small' onClick={handleReset}>
            <i className='tabler-x text-2xl text-textPrimary' />
          </IconButton>
        </div>
        <Divider />
        <div className='p-4 md:p-8'>
          <form onSubmit={handleSubmit(data => onSubmit(data))}>
            {/* Personal Information Section */}
            <Typography variant='subtitle1' className='mb-2 font-medium'>
              {dictionary.form.sectionPersonalInfo}
            </Typography>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6'>
              <Controller
                name='name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary.form.name}
                    placeholder={dictionary.form.namePlaceholder}
                    error={!!errors.name}
                    helperText={errors.name ? dictionary.form.required : ''}
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
                    label={dictionary.form.birthdate || 'Date of Birth'}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.birthdate}
                    helperText={errors.birthdate ? dictionary.form.required : ''}
                  />
                )}
              />
              <Controller
                name='gender'
                control={control}
                render={({ field }) => {
                  // Normalize the gender value to match MenuItem values
                  const normalizedGender = field.value
                    ? field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase()
                    : ''

                  console.log('Gender field render:', {
                    fieldValue: field.value,
                    normalizedGender,
                    editPatientGender: editPatient?.gender,
                    editMode
                  })

                  return (
                    <CustomTextField
                      select
                      fullWidth
                      label={dictionary.form.gender}
                      error={!!errors.gender}
                      helperText={errors.gender ? dictionary.form.required : ''}
                      value={normalizedGender}
                      onChange={e => {
                        console.log('Gender onChange:', e.target.value)

                        // Store the value in lowercase in the form
                        field.onChange(e.target.value.toLowerCase())
                      }}
                    >
                      <MenuItem value=''>{dictionary.form.selectGender}</MenuItem>
                      <MenuItem value='Male'>{dictionary.form.male}</MenuItem>
                      <MenuItem value='Female'>{dictionary.form.female}</MenuItem>
                      <MenuItem value='Other'>{dictionary.form.other}</MenuItem>
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
                    label={dictionary.form.doctor}
                    error={!!errors.doctor}
                    helperText={!!errors.doctor ? dictionary.form.required : ''}
                    {...field}
                    value={field.value || ''}
                  >
                    <MenuItem value=''>{dictionary.form.selectDoctor}</MenuItem>
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
                    label={dictionary.form.status}
                    error={!!errors.status}
                    helperText={errors.status ? dictionary.form.required : ''}
                    {...field}
                  >
                    <MenuItem value=''>{dictionary.form.selectStatus}</MenuItem>
                    <MenuItem value='enabled'>{dictionary.form.enabled}</MenuItem>
                    <MenuItem value='disabled'>{dictionary.form.disabled}</MenuItem>
                    <MenuItem value='blocked'>{dictionary.form.blocked}</MenuItem>
                    <MenuItem value='pending'>{dictionary.form.pending}</MenuItem>
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
                    label={dictionary.form.avatar}
                    placeholder={dictionary.form.avatarPlaceholder}
                  />
                )}
              />
            </div>
            <Divider className='my-6 border-dashed' />

            {/* Contact Information Section */}
            <Typography variant='subtitle1' className='mb-2 font-medium'>
              {dictionary.form.sectionContactInfo}
            </Typography>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6'>
              <Controller
                name='address'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary.form.address}
                    placeholder={dictionary.form.addressPlaceholder}
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
                    label={dictionary.form.city}
                    placeholder={dictionary.form.cityPlaceholder}
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
                    label={dictionary.form.phoneNumber}
                    placeholder={dictionary.form.phoneNumberPlaceholder}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number ? dictionary.form.required : ''}
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
                    label={dictionary.form.email}
                    placeholder={dictionary.form.emailPlaceholder}
                  />
                )}
              />
            </div>
            <Divider className='my-6 border-dashed' />

            {/* Emergency Contact Section */}
            <Typography variant='subtitle1' className='mb-2 font-medium'>
              {dictionary.form.sectionEmergencyContact}
            </Typography>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6'>
              <Controller
                name='emergency_contact_name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary.form.emergencyContactName}
                    placeholder={dictionary.form.emergencyContactNamePlaceholder}
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
                    label={dictionary.form.emergencyContactPhone}
                    placeholder={dictionary.form.emergencyContactPhonePlaceholder}
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
                    label={dictionary.form.emergencyContactEmail}
                    placeholder={dictionary.form.emergencyContactEmailPlaceholder}
                  />
                )}
              />
            </div>
            <div className='flex items-center gap-4 md:col-span-2 mt-8'>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Button variant='contained' type='submit'>
                  {editMode ? dictionary.navigation.save : dictionary.navigation.create}
                </Button>
                <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
                  {dictionary.navigation.cancel}
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
