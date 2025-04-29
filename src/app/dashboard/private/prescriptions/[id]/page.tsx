'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { Card, CardContent, CardHeader, Typography, Button, Grid, Box } from '@mui/material'

// Mock data for a single prescription
const mockPrescription = {
  id: 1,
  patientName: 'John Doe',
  date: '2024-03-20',
  status: 'Active',
  doctor: 'Dr. Smith',
  medications: 'Amoxicillin 500mg',
  dosage: '1 tablet',
  frequency: 'Three times daily',
  duration: '7 days',
  notes: 'Take with food. Complete the full course.'
}

export default function ViewPrescriptionPage() {
  const router = useRouter()
  const params = useParams()
  const [prescription, setPrescription] = useState(mockPrescription)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Card>
      <CardHeader
        title='Prescription Details'
        action={
          <Button variant='contained' color='primary' onClick={handlePrint}>
            Print Prescription
          </Button>
        }
      />
      <CardContent>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                Patient Information
              </Typography>
              <Typography>Name: {prescription.patientName}</Typography>
              <Typography>Date: {prescription.date}</Typography>
              <Typography>Status: {prescription.status}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                Prescription Details
              </Typography>
              <Typography>Doctor: {prescription.doctor}</Typography>
              <Typography>Medications: {prescription.medications}</Typography>
              <Typography>Dosage: {prescription.dosage}</Typography>
              <Typography>Frequency: {prescription.frequency}</Typography>
              <Typography>Duration: {prescription.duration}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                Additional Notes
              </Typography>
              <Typography>{prescription.notes}</Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}
