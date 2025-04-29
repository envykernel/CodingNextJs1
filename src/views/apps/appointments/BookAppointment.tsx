'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const BookAppointment = () => {
  const router = useRouter()

  const [appointmentData, setAppointmentData] = useState({
    patientName: '',
    appointmentDate: null as Date | null,
    appointmentTime: '',
    appointmentType: '',
    reason: '',
    notes: ''
  })

  const appointmentTypes = ['General Checkup', 'Follow-up', 'Consultation', 'Vaccination', 'Laboratory Test', 'Other']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would typically save the appointment data
    console.log('Appointment Data:', appointmentData)
    router.push('/fr/pages/appointments/list')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' sx={{ mb: 4 }}>
        Book Appointment
      </Typography>

      <Card>
        <CardHeader title='Appointment Details' />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Patient Name'
                  value={appointmentData.patientName}
                  onChange={e => setAppointmentData({ ...appointmentData, patientName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    value={appointmentData.appointmentType}
                    label='Appointment Type'
                    onChange={e => setAppointmentData({ ...appointmentData, appointmentType: e.target.value })}
                    required
                  >
                    {appointmentTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <AppReactDatepicker
                  selected={appointmentData.appointmentDate}
                  showTimeSelect
                  dateFormat='MMMM d, yyyy h:mm aa'
                  placeholderText='Select Date and Time'
                  onChange={(date: Date | null) => setAppointmentData({ ...appointmentData, appointmentDate: date })}
                  customInput={<TextField fullWidth label='Appointment Date & Time' required />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Reason for Visit'
                  value={appointmentData.reason}
                  onChange={e => setAppointmentData({ ...appointmentData, reason: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label='Additional Notes'
                  value={appointmentData.notes}
                  onChange={e => setAppointmentData({ ...appointmentData, notes: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant='outlined' onClick={() => router.push('/fr/pages/appointments/list')}>
                  Cancel
                </Button>
                <Button type='submit' variant='contained'>
                  Book Appointment
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default BookAppointment
