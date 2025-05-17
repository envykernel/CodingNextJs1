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
import Skeleton from '@mui/material/Skeleton'

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
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)

  // Function to get start and end of a week from a given date
  const getWeekRange = (date: Date) => {
    // Create a new date object to avoid modifying the original
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday

    // Reset the date to Monday of the current week
    start.setDate(diff)

    // Set to beginning of day in local timezone
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)

    end.setDate(start.getDate() + 5) // Set to Saturday (5 days after Monday)
    // Set to end of day in local timezone
    end.setHours(23, 59, 59, 999)

    return { start, end }
  }

  // Function to navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    if (!availabilityStartDate || !availabilityEndDate) return

    const currentStart = new Date(availabilityStartDate)
    const daysToAdd = direction === 'next' ? 7 : -7

    currentStart.setDate(currentStart.getDate() + daysToAdd)

    const { start, end } = getWeekRange(currentStart)

    setAvailabilityStartDate(start)
    setAvailabilityEndDate(end)
  }

  const [availabilityStartDate, setAvailabilityStartDate] = useState<Date | null>(() => {
    const today = new Date()
    const { start } = getWeekRange(today)

    return start
  })

  const [availabilityEndDate, setAvailabilityEndDate] = useState<Date | null>(() => {
    const today = new Date()
    const { end } = getWeekRange(today)

    return end
  })

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

  // Update availability fetching to use date range
  useEffect(() => {
    const organisationId = session?.user?.organisationId

    if (open && organisationId && availabilityStartDate && availabilityEndDate) {
      setIsLoadingAvailability(true)

      // Convert dates to local timezone strings
      const startDate = availabilityStartDate.toLocaleDateString('en-CA') // YYYY-MM-DD format
      const endDate = availabilityEndDate.toLocaleDateString('en-CA') // YYYY-MM-DD format

      fetch(
        `/api/appointments/availability?organisation_id=${organisationId}&startDate=${startDate}&endDate=${endDate}`
      )
        .then(res => res.json())
        .then(data => {
          setAvailability(data)
          setIsLoadingAvailability(false)
        })
        .catch(() => {
          setAvailability([])
          setIsLoadingAvailability(false)
        })
    } else if (!open) {
      setAvailability([])
      setIsLoadingAvailability(false)
    }
  }, [open, session?.user?.organisationId, availabilityStartDate, availabilityEndDate])

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
    // Create a date string in local time (YYYY-MM-DDTHH:mm)
    const localDateTime = `${dayIso}T${slot}`

    // Create a Date object from the local time
    const localDate = new Date(localDateTime)

    setValue('appointment_date', localDate.toISOString())
    setSelectedSlot({ day: dayIso, time: slot })
  }

  // Keep selectedSlot in sync with form value (e.g., if user changes datepicker manually)
  const appointmentDateValue = watch('appointment_date')

  useEffect(() => {
    if (appointmentDateValue) {
      // Convert ISO string to local date and time
      const date = new Date(appointmentDateValue)
      const localYear = date.getFullYear()
      const localMonth = (date.getMonth() + 1).toString().padStart(2, '0')
      const localDay = date.getDate().toString().padStart(2, '0')
      const localHour = date.getHours().toString().padStart(2, '0')
      const localMinute = date.getMinutes().toString().padStart(2, '0')
      const localDateStr = `${localYear}-${localMonth}-${localDay}`
      const localTimeStr = `${localHour}:${localMinute}`

      setSelectedSlot({ day: localDateStr, time: localTimeStr })

      // Check if the selected date/time is available
      const dayAvailability = availability.find(day => day.date === localDateStr)
      let isAvailable = false

      if (dayAvailability) {
        // Check if slot is in available slots and not in the past (if today)
        isAvailable = dayAvailability.slots.includes(localTimeStr)

        if (localDateStr === new Date().toISOString().slice(0, 10)) {
          const now = new Date()
          const [slotHour, slotMinute] = localTimeStr.split(':').map(Number)

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
  }, [appointmentDateValue, availability, dictionary])

  // Format date range for display
  const formatWeekRange = (start: Date, end: Date) => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    return `${formatDate(start)} - ${formatDate(end)}`
  }

  // Add new patient option
  const patientOptions: (PatientType | { id: string; name: string })[] = [
    ...patients,
    { id: '__add_new__', name: dictionary.patient?.addNewPatient || 'Add new patient' }
  ]

  // Render skeleton for availability slots
  const renderAvailabilitySkeleton = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {[1, 2, 3].map(day => (
        <Box key={day}>
          <Skeleton variant='text' width={200} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {[1, 2, 3, 4, 5, 6].map(slot => (
              <Skeleton key={slot} variant='rounded' width={70} height={32} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  )

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
              render={({ field }) => {
                // Convert UTC ISO string to local datetime-local string
                let localValue = field.value

                if (field.value) {
                  const utcDate = new Date(field.value)
                  const year = utcDate.getFullYear()
                  const month = (utcDate.getMonth() + 1).toString().padStart(2, '0')
                  const day = utcDate.getDate().toString().padStart(2, '0')
                  const hour = utcDate.getHours().toString().padStart(2, '0')
                  const minute = utcDate.getMinutes().toString().padStart(2, '0')

                  localValue = `${year}-${month}-${day}T${hour}:${minute}`
                }

                return (
                  <CustomTextField
                    type='datetime-local'
                    fullWidth
                    label={dictionary.date || 'Date'}
                    value={localValue}
                    onChange={e => {
                      // Convert local datetime-local string to UTC ISO string
                      const localDate = new Date(e.target.value)

                      field.onChange(localDate.toISOString())
                    }}
                    error={!!errors.appointment_date}
                    helperText={errors.appointment_date ? dictionary.form?.required || 'Required' : ''}
                    InputLabelProps={{ shrink: true }}
                  />
                )
              }}
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
              <Typography variant='subtitle1' className='mb-4 font-semibold'>
                {dictionary.appointments?.availabilityTitle || dictionary.availabilityTitle || 'Availability'}
              </Typography>

              {/* Week Navigation */}
              <Box className='flex items-center justify-between mb-4'>
                <Box className='flex items-center gap-2'>
                  <IconButton
                    size='small'
                    onClick={() => navigateWeek('prev')}
                    disabled={
                      !availabilityStartDate || new Date(availabilityStartDate) <= new Date() || isLoadingAvailability
                    }
                  >
                    <i className='tabler-chevron-left text-xl' />
                  </IconButton>
                  <Typography variant='subtitle2' className='min-w-[200px] text-center'>
                    {availabilityStartDate && availabilityEndDate
                      ? formatWeekRange(availabilityStartDate, availabilityEndDate)
                      : ''}
                  </Typography>
                  <IconButton size='small' onClick={() => navigateWeek('next')} disabled={isLoadingAvailability}>
                    <i className='tabler-chevron-right text-xl' />
                  </IconButton>
                </Box>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => {
                    const { start, end } = getWeekRange(new Date())

                    setAvailabilityStartDate(start)
                    setAvailabilityEndDate(end)
                  }}
                  disabled={isLoadingAvailability}
                >
                  {dictionary.appointments?.thisWeek || 'This Week'}
                </Button>
              </Box>

              {/* Legend */}
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

              {/* Availability Content */}
              {isLoadingAvailability ? (
                renderAvailabilitySkeleton()
              ) : availability.length === 0 ? (
                <Typography variant='body2'>
                  {dictionary.appointments?.noAppointments || dictionary.noAppointments || 'No appointments available.'}
                </Typography>
              ) : (
                availability
                  .filter(day => {
                    // Only show days within the selected week range
                    if (!availabilityStartDate || !availabilityEndDate) return false

                    const dayDate = new Date(day.date)
                    const start = new Date(availabilityStartDate)
                    const end = new Date(availabilityEndDate)
                    const today = new Date()

                    // Set hours to 0 for proper date comparison
                    dayDate.setHours(0, 0, 0, 0)
                    start.setHours(0, 0, 0, 0)
                    end.setHours(23, 59, 59, 999)
                    today.setHours(0, 0, 0, 0)

                    // For debugging
                    console.log('Day:', dayDate.toISOString())
                    console.log('Today:', today.toISOString())
                    console.log('Start:', start.toISOString())
                    console.log('End:', end.toISOString())

                    // Check if the day is within the week range AND not in the past
                    // Use getTime() for more reliable date comparison
                    const isInRange = dayDate.getTime() >= start.getTime() && dayDate.getTime() <= end.getTime()
                    const isNotPast = dayDate.getTime() >= today.getTime()

                    return isInRange && isNotPast
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
                          // Use the slots returned from the server for this day
                          const daySlots = day.slots.sort((a, b) => {
                            const [aHour, aMinute] = a.split(':').map(Number)
                            const [bHour, bMinute] = b.split(':').map(Number)

                            return aHour === bHour ? aMinute - bMinute : aHour - bHour
                          })

                          return daySlots.map(slot => {
                            // Use the slot time directly without any conversion
                            const displaySlot = slot // The slot is already in the correct format (HH:mm)

                            const isSelected =
                              selectedSlot && selectedSlot.day === day.date && selectedSlot.time === displaySlot

                            return (
                              <Button
                                key={slot}
                                variant='contained'
                                color={isSelected ? 'primary' : 'success'}
                                size='small'
                                onClick={() => handleSlotClick(day.date, displaySlot)}
                                sx={[isSelected ? { border: '2px solid #1976d2' } : {}]}
                              >
                                {displaySlot}
                              </Button>
                            )
                          })
                        })()}
                      </Box>
                    </Box>
                  ))
              )}
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
