import React, { useEffect } from 'react'

import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Autocomplete from '@mui/material/Autocomplete'

import { useTranslation } from '@/contexts/translationContext'
import CustomTextField from '@core/components/mui/TextField'
import { APPOINTMENT_STATUS_OPTIONS, APPOINTMENT_TYPE_OPTIONS } from '../constants'

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'required'),
  doctor_id: z.string().min(1, 'required'),
  appointment_date: z.string().min(1, 'required'),
  appointment_type: z.string().min(1, 'required'),
  status: z.string().min(1, 'required'),
  notes: z.string().optional()
})

type AppointmentFormType = z.infer<typeof appointmentSchema>

type Props = {
  open: boolean
  handleClose: () => void
  doctors: { id: string | number; name: string }[]
  patients: { id: string | number; name: string }[]
}

const AddAppointmentDrawer = ({ open, handleClose, doctors, patients }: Props) => {
  const t = useTranslation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AppointmentFormType>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_type: '',
      status: APPOINTMENT_STATUS_OPTIONS[0],
      notes: ''
    }
  })

  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // Reset form to default values every time the drawer is opened
  useEffect(() => {
    if (open) {
      reset({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_type: '',
        status: APPOINTMENT_STATUS_OPTIONS[0],
        notes: ''
      })
    }
  }, [open, reset])

  const onSubmit = async (data: AppointmentFormType) => {
    setSubmitError(null)

    try {
      const result = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (result.ok) {
        handleClose()
        reset()
      } else {
        let errorMsg = 'Failed to create appointment'

        const resultText = await result.text()

        if (resultText) {
          errorMsg += ': ' + resultText
        }

        setSubmitError(errorMsg)
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to create appointment')
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100vw', sm: '50vw', md: '40vw' } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>
          {t.createAppointment || t.appointments?.createAppointment || 'Create New Appointment'}
        </Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-4 md:p-8'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6'>
            <Controller
              name='patient_id'
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={patients}
                  getOptionLabel={option => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, value) => field.onChange(value ? value.id : '')}
                  value={patients.find(p => p.id === field.value) || null}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      fullWidth
                      label={t.patient?.name || 'Patient'}
                      error={!!errors.patient_id}
                      helperText={errors.patient_id ? t.form?.required || 'Required' : ''}
                    />
                  )}
                />
              )}
            />
            <Controller
              name='doctor_id'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label={t.doctor || 'Doctor'}
                  {...field}
                  error={!!errors.doctor_id}
                  helperText={errors.doctor_id ? t.form?.required || 'Required' : ''}
                >
                  <MenuItem value=''>{t.form?.selectDoctor || 'Select Doctor'}</MenuItem>
                  {doctors.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
            <Controller
              name='appointment_date'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  type='datetime-local'
                  fullWidth
                  label={t.date || 'Date'}
                  {...field}
                  error={!!errors.appointment_date}
                  helperText={errors.appointment_date ? t.form?.required || 'Required' : ''}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              name='appointment_type'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label={t.type || 'Type'}
                  {...field}
                  error={!!errors.appointment_type}
                  helperText={errors.appointment_type ? t.form?.required || 'Required' : ''}
                >
                  <MenuItem value=''>{t.form?.selectType || 'Select Type'}</MenuItem>
                  {APPOINTMENT_TYPE_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
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
                  label={t.status || 'Status'}
                  {...field}
                  error={!!errors.status}
                  helperText={errors.status ? t.form?.required || 'Required' : ''}
                >
                  {APPOINTMENT_STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
            <Controller
              name='notes'
              control={control}
              render={({ field }) => (
                <CustomTextField fullWidth multiline minRows={2} label={t.notes || 'Notes'} {...field} />
              )}
            />
          </div>
          <div className='flex items-center gap-4 mt-8'>
            <Button variant='contained' type='submit'>
              {t.createAppointment || t.appointments?.createAppointment || 'Create New Appointment'}
            </Button>
            <Button variant='tonal' color='error' type='button' onClick={handleClose}>
              {t.common?.cancel || 'Cancel'}
            </Button>
          </div>
          {submitError && <div className='text-red-500 mt-2'>{submitError}</div>}
        </form>
      </div>
    </Drawer>
  )
}

export default AddAppointmentDrawer
