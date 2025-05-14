// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { useTranslation } from '@/contexts/translationContext'
import { updatePatientAction } from '@/app/server/actions'

interface Props {
  open: boolean
  onClose: () => void
  patientData: {
    id: number
    name: string
    birthdate: string | Date
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
    created_at?: string | Date
    updated_at?: string | Date
  }
  onPatientUpdated?: (patient: any) => void
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
  birthdate: z.string().min(1, 'required'),
  doctor: z.string().optional(),
  avatar: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  email: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_email: z.string().optional()
})

const EditPatientDrawer = ({ open, onClose, patientData, onPatientUpdated }: Props) => {
  const dictionary = useTranslation()
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([])

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
      name: patientData?.name || '',
      birthdate: patientData?.birthdate ? new Date(patientData.birthdate).toISOString().split('T')[0] : '',
      gender: patientData?.gender || 'Female',
      doctor: patientData?.doctor || '',
      status: patientData?.status || 'enabled',
      avatar: patientData?.avatar || '',
      address: patientData?.address || '',
      city: patientData?.city || '',
      phone_number: patientData?.phone_number || '',
      email: patientData?.email || '',
      emergency_contact_name: patientData?.emergency_contact_name || '',
      emergency_contact_phone: patientData?.emergency_contact_phone || '',
      emergency_contact_email: patientData?.emergency_contact_email || ''
    }
  })

  // Reset form when drawer opens or patient data changes
  useEffect(() => {
    if (open && patientData) {
      reset({
        name: patientData.name || '',
        birthdate: patientData.birthdate ? new Date(patientData.birthdate).toISOString().split('T')[0] : '',
        gender: patientData.gender || 'Female',
        doctor: patientData.doctor || '',
        status: patientData.status || 'enabled',
        avatar: patientData.avatar || '',
        address: patientData.address || '',
        city: patientData.city || '',
        phone_number: patientData.phone_number || '',
        email: patientData.email || '',
        emergency_contact_name: patientData.emergency_contact_name || '',
        emergency_contact_phone: patientData.emergency_contact_phone || '',
        emergency_contact_email: patientData.emergency_contact_email || ''
      })
    }
  }, [open, patientData, reset])

  const onSubmit = async (data: FormValidateType) => {
    try {
      const updatedPatient = await updatePatientAction(patientData.id, data)

      if (updatedPatient) {
        if (onPatientUpdated) {
          onPatientUpdated(mapNullToUndefined(updatedPatient))
        }

        onClose()
      }
    } catch (error) {
      console.error('Error updating patient:', error)
    }
  }

  const handleReset = () => {
    onClose()
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
        <Typography variant='h5'>{dictionary.navigation.editPatient}</Typography>
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
                      <MenuItem key={opt.id} value={opt.id}>
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
              {dictionary.navigation.save}
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

export default EditPatientDrawer
