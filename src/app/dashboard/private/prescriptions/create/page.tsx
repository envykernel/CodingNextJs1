'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'

export default function CreatePrescriptionPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    patientName: '',
    doctor: '',
    medications: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would typically save the prescription to your backend
    console.log('Prescription data:', formData)
    router.push('/dashboard/private/prescriptions')
  }

  return (
    <Card>
      <CardHeader title='Create New Prescription' />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Patient Name'
                name='patientName'
                value={formData.patientName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Doctor'
                name='doctor'
                value={formData.doctor}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Medications'
                name='medications'
                value={formData.medications}
                onChange={handleChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Dosage'
                name='dosage'
                value={formData.dosage}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Frequency'
                name='frequency'
                value={formData.frequency}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Duration'
                name='duration'
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Additional Notes'
                name='notes'
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' variant='contained' color='primary'>
                Create Prescription
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}
