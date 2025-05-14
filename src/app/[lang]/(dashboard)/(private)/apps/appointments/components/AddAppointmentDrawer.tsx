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
import { useSession } from 'next-auth/react'
import Alert from '@mui/material/Alert'

import AddPatientDrawer from '@/views/apps/patient/list/AddPatientDrawer'
import type { PatientType } from '@/views/apps/patient/list/PatientListTable'

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

type Props = {
  open: boolean
  handleClose: () => void
  doctors: { id: string | number; name: string }[]
  patients: PatientType[]
  dictionary: any
  onAppointmentCreated?: () => void
}

// Replace APPOINTMENT_TYPE_OPTIONS with keys for translation
const APPOINTMENT_TYPE_OPTION_KEYS = ['Consultation', 'Medical Check', 'Clinical Procedure', 'Other']

const AddAppointmentDrawer = ({
  open,
  handleClose,
  doctors,
  patients: initialPatients,
  dictionary,
  onAppointmentCreated
}: Props) => {
  const { data: session } = useSession()

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
  const [availability, setAvailability] = useState<{ date: string; slots: string[] }[]>([])
  const [unavailableWarning, setUnavailableWarning] = useState<string | null>(null)
  const [patients, setPatients] = useState<PatientType[]>(initialPatients)
  const [addPatientOpen, setAddPatientOpen] = useState(false)

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

  // Fetch availability when drawer opens or organisation changes
  useEffect(() => {
    const organisationId = session?.user?.organisationId

    if (open && organisationId) {
      fetch(`/api/appointments/availability?organisation_id=${organisationId}`)
        .then(res => res.json())
        .then(data => setAvailability(data))
        .catch(() => setAvailability([]))
    } else if (!open) {
      setAvailability([])
    }
  }, [open, session?.user?.organisationId])

  const onSubmit = async (data: AppointmentFormType) => {
    setSubmitError(null)

    // Convert local datetime to UTC ISO string for backend
    const localDate = new Date(data.appointment_date)

    const payload = {
      ...data,
      appointment_date: localDate.toISOString()
    }

    try {
      const result = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (result.ok) {
        handleClose()
        reset()
        if (typeof onAppointmentCreated === 'function') onAppointmentCreated()
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

  // When a slot is clicked, update the form and highlight
  const handleSlotClick = (dayIso: string, slot: string) => {
    // Compose local datetime string for the input (YYYY-MM-DDTHH:mm)
    const localDateTime = `${dayIso}T${slot}`

    setValue('appointment_date', localDateTime)
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

        // Check if the selected date/time is available
        const dayAvailability = availability.find(day => day.date === date)
        let isAvailable = false

        if (dayAvailability) {
          // Check if slot is in available slots and not in the past (if today)
          isAvailable = dayAvailability.slots.includes(slot)

          if (date === new Date().toISOString().slice(0, 10)) {
            const now = new Date()
            const [slotHour, slotMinute] = slot.split(':').map(Number)

            if (now.getHours() > slotHour || (now.getHours() === slotHour && now.getMinutes() >= slotMinute)) {
              isAvailable = false
            }
          }
        }

        if (!isAvailable) {
          setUnavailableWarning(
            dictionary.appointments?.unavailableWarning ||
              dictionary.unavailableWarning ||
              'The selected date and time is unavailable.'
          )
        } else {
          setUnavailableWarning(null)
        }
      } else {
        setUnavailableWarning(null)
      }
    } else {
      setUnavailableWarning(null)
    }
  }, [appointmentDateValue, availability, dictionary])

  // Add new patient option
  const patientOptions: (PatientType | { id: string; name: string })[] = [
    ...patients,
    { id: '__add_new__', name: dictionary.patient?.addNewPatient || 'Add new patient' }
  ]

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
                      options={patientOptions}
                      getOptionLabel={option => option.name}
                      isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
                      onChange={(_, value) => {
                        if (value && value.id === '__add_new__') {
                          setAddPatientOpen(true)
                        } else {
                          field.onChange(value ? value.id : '')
                        }
                      }}
                      value={patients.find(p => String(p.id) === String(field.value)) || null}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          fullWidth
                          label={dictionary.patient?.name || 'Patient'}
                          error={!!errors.patient_id}
                          helperText={errors.patient_id ? dictionary.form?.required || 'Required' : ''}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li
                          {...props}
                          key={option.id}
                          style={option.id === '__add_new__' ? { fontWeight: 600, color: '#1976d2' } : {}}
                        >
                          {option.name}
                        </li>
                      )}
                    />
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
            {/* Warning message after notes and before availability */}
            {unavailableWarning && (
              <div className='col-span-1 md:col-span-2 mb-4'>
                <Alert severity='warning' sx={{ width: '100%' }}>
                  {unavailableWarning}
                </Alert>
              </div>
            )}
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
                {availability.length === 0 ? (
                  <Typography variant='body2'>
                    {dictionary.appointments?.noAppointments ||
                      dictionary.noAppointments ||
                      'No appointments available.'}
                  </Typography>
                ) : (
                  availability
                    .filter(day => {
                      // Compare only the date part (YYYY-MM-DD)
                      const today = new Date()
                      const todayStr = today.toISOString().slice(0, 10)

                      return day.date >= todayStr
                    })
                    .map(day => (
                      <Box key={day.date}>
                        <Typography variant='caption' className='mb-1 font-semibold'>
                          {/* Show day name and date */}
                          {(() => {
                            const dateObj = new Date(day.date)

                            // Use user's locale for day name
                            const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'long' })

                            return `${dayName} - ${day.date}`
                          })()}
                        </Typography>
                        <Box className='flex flex-wrap gap-2'>
                          {(() => {
                            const allSlots = [
                              '09:00',
                              '09:30',
                              '10:00',
                              '10:30',
                              '11:00',
                              '11:30',
                              '12:00',
                              '12:30',
                              '13:00',
                              '13:30',
                              '14:00',
                              '14:30',
                              '15:00',
                              '15:30',
                              '16:00',
                              '16:30',
                              '17:00',
                              '17:30'
                            ]

                            return allSlots.map(slot => {
                              let isAvailable = day.slots.includes(slot)

                              // Mark passed times for today as unavailable
                              if (day.date === new Date().toISOString().slice(0, 10)) {
                                const now = new Date()
                                const [slotHour, slotMinute] = slot.split(':').map(Number)

                                if (
                                  now.getHours() > slotHour ||
                                  (now.getHours() === slotHour && now.getMinutes() >= slotMinute)
                                ) {
                                  isAvailable = false
                                }
                              }

                              const isSelected =
                                isAvailable &&
                                selectedSlot &&
                                selectedSlot.day === day.date &&
                                selectedSlot.time === slot

                              return (
                                <Button
                                  key={slot}
                                  variant='contained'
                                  color={isSelected ? 'primary' : isAvailable ? 'success' : 'inherit'}
                                  size='small'
                                  disabled={!isAvailable}
                                  onClick={isAvailable ? () => handleSlotClick(day.date, slot) : undefined}
                                  sx={[
                                    isSelected ? { border: '2px solid #1976d2' } : {},
                                    !isAvailable ? { backgroundColor: '#e0e0e0', color: '#888' } : {}
                                  ]}
                                >
                                  {slot}
                                  {!isAvailable && (
                                    <span style={{ fontSize: 10, marginLeft: 4 }}>
                                      {dictionary.appointments?.unavailable || dictionary.unavailable || 'Unavailable'}
                                    </span>
                                  )}
                                </Button>
                              )
                            })
                          })()}
                        </Box>
                      </Box>
                    ))
                )}
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
      <AddPatientDrawer
        open={addPatientOpen}
        handleClose={() => setAddPatientOpen(false)}
        patientData={patients}
        setData={setPatients}
        onPatientCreated={(patient: PatientType) => {
          setPatients(prev => [patient, ...prev])
          setAddPatientOpen(false)
          setValue('patient_id', String(patient.id))
        }}
      />
    </Drawer>
  )
}

export default AddAppointmentDrawer
