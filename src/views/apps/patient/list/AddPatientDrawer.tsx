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
  setData: (data: PatientType[]) => void
  onPatientCreated?: (patient: PatientType) => void
}

type FormValidateType = {
  name: string
  birthdate: string
  gender: string
  doctor?: string
  status?: string
  avatar?: string
  address?: string
  city?: string
  phone_number?: string
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

const AddUserDrawer = (props: Props) => {
  // Props
  const { open, handleClose, patientData, setData } = props
  const dictionary = useTranslation()
  const { data: session } = useSession()

  // Debug translation loading
  console.log('dictionary.form:', dictionary.form)
  console.log('dictionary.form.birthdate:', dictionary.form?.birthdate)

  // Add local state for doctors
  const [doctors, setDoctors] = useState<{ id: string | number; name: string }[]>([])

  // Fetch doctors when drawer opens
  useEffect(() => {
    if (props.open) {
      fetch('/api/doctors')
        .then(res => res.json())
        .then(data => setDoctors(data.map((d: any) => ({ id: String(d.id), name: d.name }))))
        .catch(() => setDoctors([]))
    }
  }, [props.open])

  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      birthdate: '',
      gender: 'Female',
      doctor: doctors && doctors.length > 0 ? doctors[0].name : '',
      status: 'enabled',
      avatar: '',
      address: '',
      city: '',
      phone_number: '',
      email: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_email: ''
    }
  })

  // Ensure default values are set when drawer opens or doctors change
  useEffect(() => {
    if (open) {
      reset({
        name: '',
        birthdate: '',
        gender: 'Female',
        doctor: doctors && doctors.length > 0 ? doctors[0].name : '',
        status: 'enabled',
        avatar: '',
        address: '',
        city: '',
        phone_number: '',
        email: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_email: ''
      })
    }
  }, [open, doctors, reset])

  const onSubmit = async (data: FormValidateType) => {
    try {
      // Add organisation_id from session
      const payload = {
        ...data,
        organisation_id: session?.user?.organisationId ? Number(session.user.organisationId) : undefined
      }

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

        if (props.onPatientCreated) {
          props.onPatientCreated(mapNullToUndefined(result.patient))
        }

        handleClose()
      } else {
        // TODO: Show error to user (e.g., toast, alert, etc.)
        // alert(result?.error || 'Failed to save patient')
        console.error(result)
      }
    } catch (error) {
      console.error('Network or server error:', error)
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
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100vw', sm: '50vw', md: '50vw' } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>{dictionary.navigation.addNewPatient}</Typography>
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
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label={dictionary.form.gender}
                  error={!!errors.gender}
                  helperText={errors.gender ? dictionary.form.required : ''}
                  {...field}
                >
                  <MenuItem value=''>{dictionary.form.selectGender}</MenuItem>
                  <MenuItem value='Male'>{dictionary.form.male}</MenuItem>
                  <MenuItem value='Female'>{dictionary.form.female}</MenuItem>
                  <MenuItem value='Other'>{dictionary.form.other}</MenuItem>
                </CustomTextField>
              )}
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
                >
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
            <Button variant='contained' type='submit'>
              {dictionary.navigation.add}
            </Button>
            <Button variant='tonal' color='error' type='reset' onClick={() => handleReset()}>
              {dictionary.navigation.cancel}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
