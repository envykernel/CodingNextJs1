'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Card, CardContent, CardHeader, Typography, Box, Grid, Button, Chip, Divider } from '@mui/material'

const AppointmentDetails = () => {
  const router = useRouter()

  // Sample data - in a real app, this would come from an API based on the ID
  const [appointment] = useState({
    id: '1',
    patientName: 'John Doe',
    patientId: 'P12345',
    date: '2024-03-20',
    time: '10:00 AM',
    type: 'General Checkup',
    status: 'Scheduled',
    reason: 'Annual health checkup',
    notes: 'Patient reported mild headaches in the past week',
    doctor: 'Dr. Sarah Wilson',
    department: 'General Medicine',
    duration: '30 minutes',
    location: 'Room 105, Main Building'
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'info'
      case 'confirmed':
        return 'success'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  const renderInfoItem = (label: string, value: string) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant='body1'>{value}</Typography>
    </Box>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4'>Appointment Details</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant='outlined' onClick={() => router.push('/fr/pages/appointments/list')}>
            Back to List
          </Button>
          <Button variant='contained' color='error'>
            Cancel Appointment
          </Button>
        </Box>
      </Box>

      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='h6'>Appointment #{appointment.id}</Typography>
              <Chip label={appointment.status} color={getStatusColor(appointment.status) as any} size='small' />
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' sx={{ mb: 3 }}>
                Patient Information
              </Typography>
              {renderInfoItem('Patient Name', appointment.patientName)}
              {renderInfoItem('Patient ID', appointment.patientId)}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' sx={{ mb: 3 }}>
                Appointment Information
              </Typography>
              {renderInfoItem('Date', appointment.date)}
              {renderInfoItem('Time', appointment.time)}
              {renderInfoItem('Duration', appointment.duration)}
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' sx={{ mb: 3 }}>
                Medical Information
              </Typography>
              {renderInfoItem('Type', appointment.type)}
              {renderInfoItem('Doctor', appointment.doctor)}
              {renderInfoItem('Department', appointment.department)}
              {renderInfoItem('Location', appointment.location)}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' sx={{ mb: 3 }}>
                Additional Information
              </Typography>
              {renderInfoItem('Reason for Visit', appointment.reason)}
              {renderInfoItem('Notes', appointment.notes)}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AppointmentDetails
