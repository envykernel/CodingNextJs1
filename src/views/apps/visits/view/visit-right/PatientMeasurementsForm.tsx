'use client'

import React, { useState, useEffect } from 'react'

import { TextField, Button, Grid, Card, CardContent, Typography } from '@mui/material'
import Alert from '@mui/material/Alert'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface PatientMeasurementsFormProps {
  visitId: number
  dictionary: any
  initialValues?: any
}

const initialState = {
  weight_kg: '',
  height_cm: '',
  temperature_c: '',
  blood_pressure_systolic: '',
  blood_pressure_diastolic: '',
  pulse: '',
  oxygen_saturation: '',
  respiratory_rate: '',
  notes: ''
}

const PatientMeasurementsForm: React.FC<PatientMeasurementsFormProps> = ({ visitId, dictionary, initialValues }) => {
  const t = dictionary.patientMeasurementsForm

  const [form, setForm] = useState(() => {
    if (initialValues) {
      return {
        ...initialState,
        ...Object.fromEntries(Object.entries(initialValues).map(([k, v]) => [k, v == null ? '' : v]))
      }
    }

    return initialState
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 4000)

      return () => clearTimeout(timer)
    }
  }, [success])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/patient-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, visit_id: visitId })
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()

        setError(data.error || 'Error')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='mt-6'>
      <CardContent>
        {success && (
          <Alert icon={<CheckCircleIcon fontSize='inherit' />} severity='success' sx={{ mb: 2 }}>
            {t.savedSuccessfully}
          </Alert>
        )}
        <Typography variant='h6' className='mb-4'>
          {t.title}
        </Typography>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label={t.weight || 'Weight (kg)'}
                name='weight_kg'
                value={form.weight_kg}
                onChange={handleChange}
                fullWidth
                type='number'
                inputProps={{ step: '0.01' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t.height || 'Height (cm)'}
                name='height_cm'
                value={form.height_cm}
                onChange={handleChange}
                fullWidth
                type='number'
                inputProps={{ step: '0.01' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t.temperature || 'Temperature (°C)'}
                name='temperature_c'
                value={form.temperature_c}
                onChange={handleChange}
                fullWidth
                type='number'
                inputProps={{ step: '0.1' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t.bloodPressureSystolic || 'Blood Pressure Systolic'}
                name='blood_pressure_systolic'
                value={form.blood_pressure_systolic}
                onChange={handleChange}
                fullWidth
                type='number'
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t.bloodPressureDiastolic || 'Blood Pressure Diastolic'}
                name='blood_pressure_diastolic'
                value={form.blood_pressure_diastolic}
                onChange={handleChange}
                fullWidth
                type='number'
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t.pulse || 'Pulse (bpm)'}
                name='pulse'
                value={form.pulse}
                onChange={handleChange}
                fullWidth
                type='number'
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t.oxygenSaturation || 'Oxygen Saturation (%)'}
                name='oxygen_saturation'
                value={form.oxygen_saturation}
                onChange={handleChange}
                fullWidth
                type='number'
                inputProps={{ step: '0.01' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t.respiratoryRate || 'Respiratory Rate'}
                name='respiratory_rate'
                value={form.respiratory_rate}
                onChange={handleChange}
                fullWidth
                type='number'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t.notes || 'Notes'}
                name='notes'
                value={form.notes}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>
          <div className='flex gap-4 mt-4'>
            <Button type='submit' variant='contained' color='primary' disabled={loading}>
              {loading ? t.saving : t.save}
            </Button>
            {error && (
              <Typography color='error.main' sx={{ ml: 2 }}>
                {error}
              </Typography>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default PatientMeasurementsForm
