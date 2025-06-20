'use client'

import React, { useState, useEffect } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { useTranslation } from '@/contexts/translationContext'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import ErrorDisplay from '@/components/ErrorDisplay'
import { UserError, ServerError, NotFoundError } from '@/utils/errorHandler'

interface Measurement {
  id: number
  measured_at: string
  weight_kg: number | null
  height_cm: number | null
  temperature_c: number | null
  blood_pressure_systolic: number | null
  blood_pressure_diastolic: number | null
  pulse: number | null
  oxygen_saturation: number | null
  respiratory_rate: number | null
}

interface PatientMeasurementsChartProps {
  patientId: number
}

const measurementTypes = [
  { value: 'weight_kg', label: 'Weight (kg)' },
  { value: 'height_cm', label: 'Height (cm)' },
  { value: 'temperature_c', label: 'Temperature (°C)' },
  { value: 'blood_pressure_systolic', label: 'Blood Pressure Systolic' },
  { value: 'blood_pressure_diastolic', label: 'Blood Pressure Diastolic' },
  { value: 'pulse', label: 'Pulse (bpm)' },
  { value: 'oxygen_saturation', label: 'Oxygen Saturation (%)' },
  { value: 'respiratory_rate', label: 'Respiratory Rate' }
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)

  return date.toISOString().split('T')[0]
}

const PatientMeasurementsChart: React.FC<PatientMeasurementsChartProps> = ({ patientId }) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [selectedType, setSelectedType] = useState('weight_kg')
  const { t, dictionary } = useTranslation()

  const { error, isLoading, handleAsyncOperation, clearError } = useErrorHandler({
    context: 'PatientMeasurementsChart',
    showUserErrors: true,
    showServerErrors: true
  })

  useEffect(() => {
    const fetchMeasurements = async () => {
      await handleAsyncOperation(
        async () => {
          const res = await fetch(`/api/patient-measurements-history?patientId=${patientId}`)

          if (!res.ok) {
            // Handle different error scenarios
            if (res.status === 404) {
              throw new NotFoundError(t('errors.notFound.patientNotFound'))
            } else if (res.status >= 400 && res.status < 500) {
              throw new UserError(t('errors.fetchFailed'))
            } else {
              throw new ServerError()
            }
          }

          const data = await res.json()

          if (!data.measurements || !Array.isArray(data.measurements)) {
            throw new ServerError('Invalid data format received')
          }

          setMeasurements(data.measurements)
          return data.measurements
        },
        {
          onSuccess: data => {
            console.log('Measurements loaded successfully:', data.length, 'measurements')
          },
          onError: error => {
            console.error('Failed to load measurements:', error)
          }
        }
      )
    }

    fetchMeasurements()
  }, [patientId, handleAsyncOperation, t])

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent>
          <div className='flex items-center gap-3 mb-4'>
            <i className='tabler-chart-line text-xl text-primary' />
            <Typography variant='h6'>{t('patientMeasurementsChart.title')}</Typography>
          </div>
          <Divider className='mb-4' />
          <ErrorDisplay
            error={error}
            onRetry={() => {
              clearError()
              // Re-fetch data
              handleAsyncOperation(async () => {
                const res = await fetch(`/api/patient-measurements-history?patientId=${patientId}`)
                if (!res.ok) {
                  if (res.status === 404) {
                    throw new NotFoundError(t('errors.notFound.patientNotFound'))
                  } else if (res.status >= 400 && res.status < 500) {
                    throw new UserError(t('errors.fetchFailed'))
                  } else {
                    throw new ServerError()
                  }
                }
                const data = await res.json()
                setMeasurements(data.measurements || [])
                return data.measurements
              })
            }}
            onDismiss={clearError}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        </CardContent>
      </Card>
    )
  }

  // Show empty state
  if (measurements.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className='flex items-center gap-3 mb-4'>
            <i className='tabler-chart-line text-xl text-primary' />
            <Typography variant='h6'>{t('patientMeasurementsChart.title')}</Typography>
          </div>
          <Divider className='mb-4' />
          <Typography color='text.secondary'>{t('patientMeasurementsChart.noMeasurements')}</Typography>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for the chart
  const chartData = measurements
    .map(m => ({
      date: formatDate(m.measured_at),
      [selectedType]: m[selectedType as keyof Measurement]
    }))
    .filter(d => d[selectedType] !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const selectedMeasurement = measurementTypes.find(m => m.value === selectedType)

  return (
    <Card>
      <CardContent>
        <div className='flex items-center gap-3 mb-4'>
          <i className='tabler-chart-line text-xl text-primary' />
          <Typography variant='h6'>{t('patientMeasurementsChart.title')}</Typography>
        </div>
        <Divider className='mb-4' />
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>{t('patientMeasurementsChart.selectMeasurement')}</InputLabel>
          <Select
            value={selectedType}
            label={t('patientMeasurementsChart.selectMeasurement')}
            onChange={e => setSelectedType(e.target.value)}
          >
            {measurementTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 12 }}
                tickFormatter={value => {
                  const date = new Date(value)

                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={value => {
                  const date = new Date(value)

                  return date.toLocaleDateString()
                }}
                formatter={(value: number) => [value, selectedMeasurement?.label]}
              />
              <Legend />
              <Line
                type='monotone'
                dataKey={selectedType}
                stroke='#8884d8'
                activeDot={{ r: 8 }}
                name={selectedMeasurement?.label}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default PatientMeasurementsChart
