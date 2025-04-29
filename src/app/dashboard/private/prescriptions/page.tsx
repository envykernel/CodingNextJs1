'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'

// Mock data for prescriptions
const mockPrescriptions = [
  {
    id: 1,
    patientName: 'John Doe',
    date: '2024-03-20',
    status: 'Active',
    doctor: 'Dr. Smith'
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    date: '2024-03-19',
    status: 'Completed',
    doctor: 'Dr. Johnson'
  }
]

export default function PrescriptionsPage() {
  const router = useRouter()
  const [prescriptions] = useState(mockPrescriptions)

  return (
    <Card>
      <CardHeader
        title='Prescriptions'
        action={
          <Button
            variant='contained'
            color='primary'
            onClick={() => router.push('/dashboard/private/prescriptions/create')}
          >
            Create New Prescription
          </Button>
        }
      />
      <CardContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.map(prescription => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.id}</TableCell>
                  <TableCell>{prescription.patientName}</TableCell>
                  <TableCell>{prescription.date}</TableCell>
                  <TableCell>{prescription.status}</TableCell>
                  <TableCell>{prescription.doctor}</TableCell>
                  <TableCell>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => router.push(`/dashboard/private/prescriptions/${prescription.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
