'use client'

import { useState } from 'react'

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

export default function ViewPrescriptionClient({ dictionary }: { dictionary: any }) {
  const [prescription] = useState(mockPrescription)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Card>
      <CardHeader
        title={dictionary?.navigation?.prescriptionDetails}
        action={
          <Button variant='contained' color='primary' onClick={handlePrint}>
            {dictionary?.navigation?.printPrescription}
          </Button>
        }
      />
      <CardContent>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                {dictionary?.navigation?.patientInformation}
              </Typography>
              <Typography>
                {dictionary?.navigation?.patientName}: {prescription.patientName}
              </Typography>
              <Typography>
                {dictionary?.navigation?.date}: {prescription.date}
              </Typography>
              <Typography>
                {dictionary?.navigation?.status}: {prescription.status}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                {dictionary?.navigation?.prescriptionInformation}
              </Typography>
              <Typography>
                {dictionary?.navigation?.doctor}: {prescription.doctor}
              </Typography>
              <Typography>
                {dictionary?.navigation?.medications}: {prescription.medications}
              </Typography>
              <Typography>
                {dictionary?.navigation?.dosage}: {prescription.dosage}
              </Typography>
              <Typography>
                {dictionary?.navigation?.frequency}: {prescription.frequency}
              </Typography>
              <Typography>
                {dictionary?.navigation?.duration}: {prescription.duration}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                {dictionary?.navigation?.additionalNotes}
              </Typography>
              <Typography>{prescription.notes}</Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}
