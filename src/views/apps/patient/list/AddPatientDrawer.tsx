// React Imports
// import { useState } from 'react'

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
}

type FormValidateType = {
  name: string
  age: number
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
  age: z.coerce.number().optional(),
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

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      age: 0,
      gender: '',
      doctor: '',
      status: '',
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

  const onSubmit = (data: FormValidateType) => {
    const newPatient: PatientType = {
      id: (patientData?.length && patientData?.length + 1) || 1,
      name: data.name,
      age: Number(data.age),
      gender: data.gender,
      doctor: data.doctor,
      status: data.status,
      avatar: data.avatar,
      address: data.address,
      city: data.city,
      phone_number: data.phone_number,
      email: data.email,
      emergency_contact_name: data.emergency_contact_name,
      emergency_contact_phone: data.emergency_contact_phone,
      emergency_contact_email: data.emergency_contact_email,
      created_at: new Date(),
      updated_at: new Date()
    }

    setData([...(patientData ?? []), newPatient])
    handleClose()
    resetForm()
  }

  const handleReset = () => {
    handleClose()
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
              name='age'
              control={control}
              rules={{ required: true, min: 0 }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  type='number'
                  fullWidth
                  label={dictionary.form.age}
                  placeholder={dictionary.form.agePlaceholder}
                  error={!!errors.age}
                  helperText={errors.age ? dictionary.form.required : ''}
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
                  {...field}
                  error={!!errors.gender}
                  helperText={errors.gender ? dictionary.form.required : ''}
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
                  {...field}
                  fullWidth
                  label={dictionary.form.doctor}
                  placeholder={dictionary.form.doctorPlaceholder}
                />
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
                  {...field}
                  error={!!errors.status}
                  helperText={errors.status ? dictionary.form.required : ''}
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
