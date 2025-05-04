import React, { useEffect, useState } from 'react'

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
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'

import CustomTextField from '@core/components/mui/TextField'
import { APPOINTMENT_STATUS_OPTIONS } from '../constants'

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'required'),
  doctor_id: z.string().min(1, 'required'),
  appointment_date: z.string().min(1, 'required'),
  appointment_type: z.string().min(1, 'required'),
  status: z.string().min(1, 'required'),
  notes: z.string().optional()
})

type AppointmentFormType = z.infer<typeof appointmentSchema>

type PatientOption = { id: string | number; name: string; phone?: string }

type Props = {
  open: boolean
  handleClose: () => void
  doctors: { id: string | number; name: string }[]
  patients: PatientOption[]
  dictionary: any
}

// Helper: Get next 7 days from today
const getNext7Days = () => {
  const days = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)

    date.setDate(today.getDate() + i)
    days.push({
      date,
      label: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      iso: date.toISOString().split('T')[0]
    })
  }

  return days
}

// Helper to generate time slots between two times
const generateTimeSlots = (start = 9, end = 18, interval = 30) => {
  const slots = []

  for (let hour = start; hour < end; hour++) {
    for (let min = 0; min < 60; min += interval) {
      const h = hour.toString().padStart(2, '0')
      const m = min.toString().padStart(2, '0')

      slots.push(`${h}:${m}`)
    }
  }

  // Add the last slot at the end hour
  slots.push(`${end.toString().padStart(2, '0')}:00`)

  return slots
}

// Replace APPOINTMENT_TYPE_OPTIONS with keys for translation
const APPOINTMENT_TYPE_OPTION_KEYS = ['Consultation', 'Medical Check', 'Clinical Procedure', 'Other']

const AddAppointmentDrawer = ({ open, handleClose, doctors, patients, dictionary }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AppointmentFormType>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_type: APPOINTMENT_TYPE_OPTION_KEYS[0],
      status: APPOINTMENT_STATUS_OPTIONS[0],
      notes: ''
    }
  })

  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null)

  // Reset form to default values every time the drawer is opened
  useEffect(() => {
    if (open) {
      reset({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_type: APPOINTMENT_TYPE_OPTION_KEYS[0],
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

  // Disponibility week logic
  const weekDays = getNext7Days()
  const timeSlots = generateTimeSlots(9, 18, 30) // 09:00 to 18:00, every 30 min

  // For demo, randomly mark some slots as unavailable
  const isSlotAvailable = (dayIdx: number, slotIdx: number) => (dayIdx + slotIdx) % 3 !== 0

  // When a slot is clicked, update the form and highlight
  const handleSlotClick = (dayIso: string, slot: string) => {
    // Compose ISO datetime string for the slot
    // Assume slot is in HH:mm, dayIso is YYYY-MM-DD
    const dateTime = `${dayIso}T${slot}:00`

    setValue('appointment_date', dateTime)
    setSelectedSlot({ day: dayIso, time: slot })
  }

  // Keep selectedSlot in sync with form value (e.g., if user changes datepicker manually)
  const appointmentDateValue = watch('appointment_date')

  useEffect(() => {
    if (appointmentDateValue) {
      const [date, time] = appointmentDateValue.split('T')

      if (date && time) {
        const slot = time.slice(0, 5) // HH:mm

        setSelectedSlot({ day: date, time: slot })
      }
    }
  }, [appointmentDateValue])

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
          {dictionary.createAppointment || dictionary.appointments?.createAppointment || 'Create New Appointment'}
        </Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-4 md:p-8'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6'>
            {/* Patient input: full row */}
            <div className='col-span-1 md:col-span-2'>
              <Controller
                name='patient_id'
                control={control}
                render={({ field }) => (
                  <>
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
                          label={dictionary.patient?.name || 'Patient'}
                          error={!!errors.patient_id}
                          helperText={errors.patient_id ? dictionary.form?.required || 'Required' : ''}
                        />
                      )}
                    />
                    {/* Show phone number if patient is selected */}
                    {(() => {
                      const selected = patients.find(p => p.id === field.value)

                      if (selected && selected.phone) {
                        return (
                          <Typography variant='body2' color='text.secondary' className='mt-1'>
                            {(dictionary.patient?.phone || 'Phone') + ': ' + selected.phone}
                          </Typography>
                        )
                      }

                      return null
                    })()}
                  </>
                )}
              />
            </div>
            {/* Doctor input */}
            <Controller
              name='doctor_id'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label={dictionary.doctor || 'Doctor'}
                  {...field}
                  error={!!errors.doctor_id}
                  helperText={errors.doctor_id ? dictionary.form?.required || 'Required' : ''}
                >
                  <MenuItem value=''>{dictionary.form?.selectDoctor || 'Select Doctor'}</MenuItem>
                  {doctors.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
            {/* Date input */}
            <Controller
              name='appointment_date'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  type='datetime-local'
                  fullWidth
                  label={dictionary.date || 'Date'}
                  {...field}
                  error={!!errors.appointment_date}
                  helperText={errors.appointment_date ? dictionary.form?.required || 'Required' : ''}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            {/* Type input */}
            <Controller
              name='appointment_type'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label={dictionary.type || 'Type'}
                  {...field}
                  error={!!errors.appointment_type}
                  helperText={errors.appointment_type ? dictionary.form?.required || 'Required' : ''}
                >
                  <MenuItem value=''>{dictionary.form?.selectType || 'Select Type'}</MenuItem>
                  {APPOINTMENT_TYPE_OPTION_KEYS.map(optKey => (
                    <MenuItem key={optKey} value={optKey}>
                      {dictionary.appointments?.typeOptions?.[optKey] || optKey}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
            {/* Status input */}
            <Controller
              name='status'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label={dictionary.status || 'Status'}
                  {...field}
                  error={!!errors.status}
                  helperText={errors.status ? dictionary.form?.required || 'Required' : ''}
                >
                  {APPOINTMENT_STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {dictionary.appointments?.statusOptions?.[opt] || opt}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
            {/* Notes input: full row */}
            <div className='col-span-1 md:col-span-2'>
              <Controller
                name='notes'
                control={control}
                render={({ field }) => (
                  <CustomTextField fullWidth multiline minRows={2} label={dictionary.notes || 'Notes'} {...field} />
                )}
              />
            </div>
          </div>
          {submitError && <div className='text-red-500 mt-2'>{submitError}</div>}

          {/* Disponibility Section */}
          <Box mt={6}>
            <Card variant='outlined' className='p-4'>
              <Typography variant='subtitle1' className='mb-2 font-semibold'>
                {dictionary.appointments?.availabilityTitle || dictionary.availabilityTitle || 'Availability'}
              </Typography>
              <Box className='flex gap-2 mb-2'>
                <Box className='flex items-center gap-1'>
                  <Box className='w-3 h-3 rounded-full bg-green-400' />
                  <Typography variant='caption'>
                    {dictionary.appointments?.available || dictionary.available || 'Available'}
                  </Typography>
                </Box>
                <Box className='flex items-center gap-1'>
                  <Box className='w-3 h-3 rounded-full bg-gray-300' />
                  <Typography variant='caption'>
                    {dictionary.appointments?.unavailable || dictionary.unavailable || 'Unavailable'}
                  </Typography>
                </Box>
              </Box>
              <Box className='flex flex-col gap-3'>
                {weekDays.map((day, dayIdx) => (
                  <Box key={day.iso}>
                    <Typography variant='caption' className='mb-1 font-semibold'>
                      {day.label}
                    </Typography>
                    <Box className='flex flex-wrap gap-2'>
                      {timeSlots.map((slot, slotIdx) => {
                        const available = isSlotAvailable(dayIdx, slotIdx)
                        const isSelected = selectedSlot && selectedSlot.day === day.iso && selectedSlot.time === slot

                        return (
                          <Button
                            key={slot}
                            variant='contained'
                            color={isSelected ? 'primary' : available ? 'success' : 'inherit'}
                            size='small'
                            disabled={!available}
                            onClick={available ? () => handleSlotClick(day.iso, slot) : undefined}
                            sx={isSelected ? { border: '2px solid #1976d2' } : {}}
                          >
                            {slot}
                          </Button>
                        )
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
          <div className='flex items-center gap-4 mt-8'>
            <Button variant='contained' type='submit'>
              {dictionary.createAppointment || dictionary.appointments?.createAppointment || 'Create New Appointment'}
            </Button>
            <Button variant='tonal' color='error' type='button' onClick={handleClose}>
              {dictionary.common?.cancel || 'Cancel'}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddAppointmentDrawer
