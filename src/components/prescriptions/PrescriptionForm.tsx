'use client'

import React, { useState, useEffect } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, Button, TextField, Grid, Box, Typography, Alert } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import MedicationBlock from './MedicationBlock'

// Zod schema for medication
const medicationSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  notes: z.string().optional()
})

// Zod schema for the entire form
const prescriptionSchema = z.object({
  patientId: z.number(),
  doctor: z.string().min(1, 'Doctor name is required'),
  medications: z.array(medicationSchema).min(1, 'At least one medication is required'),
  notes: z.string().optional()
})

export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>

interface PrescriptionFormProps {
  dictionary: any
  initialData?: PrescriptionFormValues
  onSubmit: (data: PrescriptionFormValues) => void
  submitButtonText: string
  title: string
  patientId: number
  doctorName: string
}

export default function PrescriptionForm({
  dictionary,
  initialData,
  onSubmit,
  submitButtonText,
  title,
  patientId,
  doctorName
}: PrescriptionFormProps) {
  const params = useParams()
  const locale = (params as any)?.lang || 'en'

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: initialData || {
      patientId: patientId,
      doctor: doctorName,
      medications: [
        {
          id: 1,
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          notes: ''
        }
      ],
      notes: ''
    }
  })

  // If initialData changes (e.g. switching from create to edit), reset the form
  // This ensures the form is always in sync with the mode
  useEffect(() => {
    if (initialData) {
      // Ensure all medication notes are strings
      const safeInitialData = {
        ...initialData,
        medications: initialData.medications.map(med => ({ ...med, notes: med.notes ?? '' }))
      }

      reset(safeInitialData)
    } else {
      reset({
        patientId: patientId,
        doctor: doctorName,
        medications: [
          {
            id: 1,
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            notes: ''
          }
        ],
        notes: ''
      })
    }
  }, [initialData, patientId, doctorName, reset])

  const medications = watch('medications')
  const [medicationsCollapsed, setMedicationsCollapsed] = useState(false)

  const [snackbar, setSnackbar] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({
    open: false,
    type: 'success',
    message: ''
  })

  const [saving, setSaving] = useState(false)
  const [alertHovered, setAlertHovered] = useState(false)
  const alertTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Auto-dismiss Alert after at least 10 seconds, but only if not hovered
  useEffect(() => {
    if (snackbar.open && !alertHovered) {
      alertTimerRef.current = setTimeout(() => {
        setSnackbar(s => ({ ...s, open: false }))
      }, 10000)
    }

    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current)
    }
  }, [snackbar.open, alertHovered])

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const currentMedications = watch('medications')
    const updatedMedications = [...currentMedications]

    updatedMedications[index] = { ...updatedMedications[index], [field]: value }
    setValue('medications', updatedMedications, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
  }

  const addMedication = () => {
    const currentMedications = watch('medications')

    setValue('medications', [
      ...currentMedications,
      {
        id: currentMedications.length + 1,
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      }
    ])
  }

  const removeMedication = (index: number) => {
    const currentMedications = watch('medications')
    const updatedMedications = currentMedications.filter((_, i) => i !== index)

    setValue('medications', updatedMedications)
  }

  const handleFormSubmit = async (data: PrescriptionFormValues) => {
    setSaving(true)

    try {
      await onSubmit(data)
      setSnackbar({
        open: true,
        type: 'success',
        message: dictionary?.navigation?.successSavePrescription || 'Prescription saved successfully.'
      })
    } catch (e) {
      setSnackbar({
        open: true,
        type: 'error',
        message: dictionary?.navigation?.errorSavePrescription || 'Error saving prescription.'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          <Link href={`/${locale}/apps/prescriptions/list`} passHref>
            <Button variant='outlined' color='secondary'>
              {dictionary?.navigation?.cancel}
            </Button>
          </Link>
        }
      />
      <CardContent>
        <Box component='form' noValidate autoComplete='off' onSubmit={handleSubmit(handleFormSubmit)}>
          <Controller
            name='patientId'
            control={control}
            render={({ field }) => <input type='hidden' {...field} value={patientId} />}
          />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name='doctor'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={dictionary?.navigation?.doctor}
                    error={!!errors.doctor}
                    helperText={errors.doctor?.message || ' '}
                    required
                    InputProps={{ readOnly: true }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h6'>{dictionary?.navigation?.medications}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant='outlined'
                    startIcon={<i className={medicationsCollapsed ? 'tabler-chevron-down' : 'tabler-chevron-up'} />}
                    onClick={() => setMedicationsCollapsed(c => !c)}
                  >
                    {medicationsCollapsed
                      ? dictionary?.navigation?.expandMedications || 'Expand'
                      : dictionary?.navigation?.collapseMedications || 'Collapse'}
                  </Button>
                  <Button variant='outlined' startIcon={<i className='tabler-plus' />} onClick={addMedication}>
                    {dictionary?.navigation?.addMedication}
                  </Button>
                </Box>
              </Box>

              {!medicationsCollapsed &&
                medications.map((medication, index) => (
                  <MedicationBlock
                    key={medication.id}
                    medication={{ ...medication, notes: medication.notes ?? '' }}
                    index={index}
                    dictionary={dictionary}
                    onMedicationChange={handleMedicationChange}
                    onRemove={removeMedication}
                    canRemove={medications.length > 1}
                    errors={errors.medications?.[index]}
                  />
                ))}
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='notes'
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label={dictionary?.navigation?.additionalNotes} multiline rows={4} />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {snackbar.open && (
                  <Alert
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                    severity={snackbar.type}
                    icon={snackbar.type === 'success' ? <CheckCircleIcon fontSize='inherit' /> : undefined}
                    sx={{ flex: 1, minWidth: 0 }}
                    onMouseEnter={() => setAlertHovered(true)}
                    onMouseLeave={() => setAlertHovered(false)}
                  >
                    {snackbar.message}
                  </Alert>
                )}
                <Link href={`/${locale}/apps/prescriptions/list`} passHref>
                  <Button variant='outlined' color='secondary'>
                    {dictionary?.navigation?.cancel}
                  </Button>
                </Link>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  disabled={saving}
                  startIcon={saving ? <i className='tabler-loader animate-spin' /> : undefined}
                >
                  {submitButtonText}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}
