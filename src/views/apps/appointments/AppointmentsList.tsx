'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material'

const AppointmentsList = () => {
  const router = useRouter()

  // Sample data - in a real app, this would come from an API
  const [appointments] = useState([
    {
      id: '1',
      patientName: 'John Doe',
      date: '2024-03-20',
      time: '10:00 AM',
      type: 'General Checkup',
      status: 'Scheduled'
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      date: '2024-03-21',
      time: '2:30 PM',
      type: 'Follow-up',
      status: 'Confirmed'
    },
    {
      id: '3',
      patientName: 'Robert Johnson',
      date: '2024-03-22',
      time: '11:15 AM',
      type: 'Consultation',
      status: 'Pending'
    }
  ])

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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4'>Appointments</Typography>
        <Button variant='contained' onClick={() => router.push('/fr/pages/appointments/book')}>
          Book New Appointment
        </Button>
      </Box>

      <Card>
        <CardHeader title='All Appointments' />
        <CardContent>
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Patient Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map(appointment => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.patientName}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>
                      <Chip label={appointment.status} color={getStatusColor(appointment.status) as any} size='small' />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='text'
                        onClick={() => router.push(`/fr/pages/appointments/details?id=${appointment.id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AppointmentsList
